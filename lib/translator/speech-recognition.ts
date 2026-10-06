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
  private currentLanguageBcp47: string = 'en-US';
  private callbacks: SpeechRecognitionCallbacks;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  constructor(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public start(bcp47Lang: string = 'en-US') {
    if (!SpeechRecognitionController.isSupported()) {
      this.callbacks.onError(
        'Live speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.'
      );
      return;
    }

    this.currentLanguageBcp47 = bcp47Lang;
    this.shouldKeepListening = true;
    this.initRecognition();
    this.startAudioVisualizer();
  }

  private initRecognition() {
    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
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

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0.9;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
            if (event.results[i][0].confidence) {
              confidence = event.results[i][0].confidence;
            }
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        if (interimTranscript.trim()) {
          this.callbacks.onInterim(interimTranscript.trim());
        }

        if (finalTranscript.trim()) {
          this.callbacks.onFinal(finalTranscript.trim(), confidence);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal silence, don't abort unless user stopped
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.shouldKeepListening = false;
          this.callbacks.onError(
            'Microphone access was denied. Please allow microphone permission in your browser.'
          );
          this.stop();
          return;
        }
        if (event.error === 'network') {
          this.callbacks.onError('Network connection issue for speech recognition.');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart if the user hasn't explicitly stopped
        if (this.shouldKeepListening) {
          try {
            this.recognition.start();
          } catch {
            setTimeout(() => {
              if (this.shouldKeepListening) {
                try {
                  this.recognition.start();
                } catch {}
              }
            }, 300);
          }
        } else {
          this.callbacks.onStateChange?.(false);
        }
      };

      this.recognition.start();
    } catch (err: any) {
      this.callbacks.onError(err?.message || 'Failed to initialize speech recognition.');
      this.stop();
    }
  }

  private async startAudioVisualizer() {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return;
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioContext = new AudioContextClass();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!this.shouldKeepListening || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedLevel = Math.min(100, Math.round((average / 255) * 100 * 1.5));

        this.callbacks.onAudioLevel?.(normalizedLevel);
        this.animationFrameId = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch {
      // Audio visualization is optional, silently continue
    }
  }

  public setLanguage(bcp47Lang: string) {
    this.currentLanguageBcp47 = bcp47Lang;
    if (this.isListening && this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      // onend will automatically restart with the new language if shouldKeepListening is true
    }
  }

  public stop() {
    this.shouldKeepListening = false;
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.analyser = null;
    this.callbacks.onAudioLevel?.(0);
    this.callbacks.onStateChange?.(false);
  }
}
