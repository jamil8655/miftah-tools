export interface SpeechRecognitionCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string, confidence: number) => void;
  onError: (errorMessage: string) => void;
  onAudioLevel?: (level: number) => void; // 0 to 100 for visualizer
  onStateChange?: (isListening: boolean) => void;
}

export class SpeechRecognitionController {
  private recognition: any = null;
  private isListening: boolean = false;
  private shouldKeepListening: boolean = false;
  private currentLanguageBcp47: string = 'ur-PK';
  private callbacks: SpeechRecognitionCallbacks;
  private visualizerIntervalId: any = null;
  private restartTimeoutId: any = null;

  constructor(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const hasWebSpeech = !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
    const hasAndroidSpeech = !!((window as any).AndroidSpeech);
    return hasWebSpeech || hasAndroidSpeech;
  }

  public async start(bcp47Lang: string = 'ur-PK') {
    if (!SpeechRecognitionController.isSupported()) {
      this.callbacks.onError(
        'Live speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.'
      );
      return;
    }

    this.currentLanguageBcp47 = bcp47Lang;
    this.shouldKeepListening = true;

    // Check for native Android WebView bridge first
    const hasAndroidSpeech = typeof window !== 'undefined' && Boolean((window as any).AndroidSpeech);
    if (hasAndroidSpeech) {
      (window as any).__onAndroidSpeechEvent = (eventType: string, data: string) => {
        if (eventType === 'onPartialResults') {
          if (data && data.trim()) {
            this.callbacks.onAudioLevel?.(65);
            this.callbacks.onInterim(data.trim());
          }
        } else if (eventType === 'onResults') {
          if (data && data.trim()) {
            this.callbacks.onAudioLevel?.(80);
            this.callbacks.onFinal(data.trim(), 0.95);
          }
        } else if (eventType === 'onError') {
          console.warn('Android speech event error:', data);
          if (data && data.toLowerCase().includes('permission')) {
            this.callbacks.onError('Microphone permission missing in app.');
          }
        }
      };

      try {
        (window as any).AndroidSpeech.startListening(this.currentLanguageBcp47);
        this.isListening = true;
        this.callbacks.onStateChange?.(true);
        this.startSimulatedVisualizer();
      } catch (e: any) {
        this.callbacks.onError(e?.message || 'Failed to start Android speech recognizer.');
      }
      return;
    }

    // For standard web browsers, ensure microphone permission dialog is prompted if not granted yet
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop and release the tracks to guarantee zero audio hardware locking
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          this.callbacks.onError('Microphone access was denied. Please allow microphone permission in your browser.');
          this.callbacks.onStateChange?.(false);
          return;
        }
      }
    }

    this.initRecognition();
    this.startSimulatedVisualizer();
  }

  private initRecognition() {
    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (this.recognition) {
        try {
          this.recognition.onstart = null;
          this.recognition.onresult = null;
          this.recognition.onerror = null;
          this.recognition.onend = null;
          this.recognition.abort();
        } catch {}
        this.recognition = null;
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.currentLanguageBcp47;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStateChange?.(true);
      };

      this.recognition.onaudiostart = () => {
        this.callbacks.onAudioLevel?.(45);
      };

      this.recognition.onspeechstart = () => {
        this.callbacks.onAudioLevel?.(75);
      };

      this.recognition.onspeechend = () => {
        this.callbacks.onAudioLevel?.(15);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0.95;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscript += transcriptChunk;
            if (result[0]?.confidence) {
              confidence = result[0].confidence;
            }
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        this.callbacks.onAudioLevel?.(Math.floor(Math.random() * 40) + 50);

        if (interimTranscript.trim()) {
          this.callbacks.onInterim(interimTranscript.trim());
        }

        if (finalTranscript.trim()) {
          this.callbacks.onFinal(finalTranscript.trim(), confidence);
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = event.error;
        if (error === 'no-speech') {
          this.callbacks.onAudioLevel?.(10);
          return;
        }
        if (error === 'aborted') {
          return;
        }
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          this.shouldKeepListening = false;
          this.callbacks.onError(
            'Microphone access was denied. Please allow microphone permission in your browser.'
          );
          this.stop();
          return;
        }
        if (error === 'language-not-supported') {
          // If language like ur-PK isn't supported on device, fallback to ur or hi-IN
          if (this.currentLanguageBcp47 === 'ur-PK') {
            this.currentLanguageBcp47 = 'ur-IN';
            try {
              this.recognition.lang = 'ur-IN';
              this.recognition.start();
              return;
            } catch {}
          }
        }
        if (error === 'audio-capture') {
          this.callbacks.onError('Microphone hardware error or mic is in use by another app.');
          return;
        }
        if (error === 'network') {
          console.warn('Speech recognition network blip, retrying...');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.shouldKeepListening) {
          if (this.restartTimeoutId) clearTimeout(this.restartTimeoutId);
          this.restartTimeoutId = setTimeout(() => {
            if (this.shouldKeepListening) {
              try {
                this.initRecognition();
              } catch {}
            }
          }, 200);
        } else {
          this.callbacks.onStateChange?.(false);
          this.callbacks.onAudioLevel?.(0);
        }
      };

      this.recognition.start();
    } catch (err: any) {
      if (this.shouldKeepListening) {
        if (this.restartTimeoutId) clearTimeout(this.restartTimeoutId);
        this.restartTimeoutId = setTimeout(() => {
          if (this.shouldKeepListening) {
            try {
              this.initRecognition();
            } catch {}
          }
        }, 500);
      } else {
        this.callbacks.onError(err?.message || 'Failed to initialize speech recognition.');
        this.stop();
      }
    }
  }

  private startSimulatedVisualizer() {
    if (this.visualizerIntervalId) clearInterval(this.visualizerIntervalId);
    this.visualizerIntervalId = setInterval(() => {
      if (!this.shouldKeepListening) return;
      if (this.isListening) {
        const randomFlutter = Math.floor(Math.random() * 25) + 10;
        this.callbacks.onAudioLevel?.(randomFlutter);
      }
    }, 120);
  }

  public setLanguage(bcp47Lang: string) {
    this.currentLanguageBcp47 = bcp47Lang;
    if (typeof window !== 'undefined' && (window as any).AndroidSpeech) {
      try {
        (window as any).AndroidSpeech.startListening(bcp47Lang);
      } catch {}
      return;
    }
    if (this.isListening && this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
    }
  }

  public stop() {
    this.shouldKeepListening = false;
    this.isListening = false;

    if (typeof window !== 'undefined' && (window as any).AndroidSpeech) {
      try {
        (window as any).AndroidSpeech.stopListening();
      } catch {}
    }

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
      this.restartTimeoutId = null;
    }

    if (this.visualizerIntervalId) {
      clearInterval(this.visualizerIntervalId);
      this.visualizerIntervalId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    this.callbacks.onAudioLevel?.(0);
    this.callbacks.onStateChange?.(false);
  }
}
