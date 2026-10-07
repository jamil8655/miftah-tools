export interface SpeechRecognitionCallbacks {
  onInterim?: (text: string) => void;
  onFinal?: (text: string, confidence: number) => void;
  onTranscriptUpdate?: (finals: string[], interim: string) => void;
  onError: (errorMessage: string) => void;
  onAudioLevel?: (level: number) => void; // 0 to 100 for visualizer
  onStateChange?: (isListening: boolean) => void;
}

export function deduplicateSentenceStream(sentences: string[]): string[] {
  if (!sentences || sentences.length === 0) return [];

  const cleanList: string[] = [];

  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;

    if (cleanList.length === 0) {
      cleanList.push(s);
      continue;
    }

    const lastIdx = cleanList.length - 1;
    const prev = cleanList[lastIdx];

    // 1. Exact duplicate check
    if (s === prev) {
      continue;
    }

    // 2. Current string is an expansion of previous (s starts with prev or contains prev)
    if (s.startsWith(prev) || (s.length > prev.length && s.includes(prev))) {
      cleanList[lastIdx] = s;
      continue;
    }

    // 3. Previous string is an expansion of current (ignore shorter rollback)
    if (prev.startsWith(s)) {
      continue;
    }

    // 4. Word-level overlap check (if first majority of words match, replace)
    const prevWords = prev.split(/\s+/);
    const currWords = s.split(/\s+/);
    if (prevWords.length >= 2 && currWords.length >= prevWords.length) {
      const matchCount = prevWords.filter((w, i) => currWords[i] === w).length;
      if (matchCount / prevWords.length >= 0.7) {
        cleanList[lastIdx] = s;
        continue;
      }
    }

    cleanList.push(s);
  }

  return cleanList;
}

function normalizeBcp47(bcp47: string): string {
  if (!bcp47) return 'ur-IN';
  const clean = bcp47.trim();
  if (clean === 'ur' || clean === 'ur-PK' || clean === 'ur_PK') {
    return 'ur-IN';
  }
  if (clean === 'ar' || clean === 'ar_SA') {
    return 'ar-SA';
  }
  if (clean === 'hi' || clean === 'hi_IN') {
    return 'hi-IN';
  }
  return clean;
}

export class SpeechRecognitionController {
  private recognition: any = null;
  private isListening: boolean = false;
  private shouldKeepListening: boolean = false;
  private currentLanguageBcp47: string = 'ur-IN';
  private callbacks: SpeechRecognitionCallbacks;
  private visualizerIntervalId: any = null;
  private restartTimeoutId: any = null;
  private silenceTimerId: any = null;
  private finalsHistory: string[] = [];
  private lastSessionFinals: string[] = [];
  private lastReportedFinalIndex: number = -1;
  private latestInterimText: string = '';
  private lastCommittedText: string = '';

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

  public start(bcp47Lang: string = 'ur-IN') {
    if (!SpeechRecognitionController.isSupported()) {
      this.callbacks.onError(
        'Live speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.'
      );
      return;
    }

    this.currentLanguageBcp47 = normalizeBcp47(bcp47Lang);
    this.shouldKeepListening = true;
    this.finalsHistory = [];
    this.lastSessionFinals = [];
    this.lastReportedFinalIndex = -1;
    this.latestInterimText = '';
    this.lastCommittedText = '';

    // Check for native Android WebView bridge first
    const hasAndroidSpeech = typeof window !== 'undefined' && Boolean((window as any).AndroidSpeech);
    if (hasAndroidSpeech) {
      (window as any).__onAndroidSpeechEvent = (eventType: string, data: string) => {
        if (eventType === 'onPartialResults') {
          if (data && data.trim()) {
            this.callbacks.onAudioLevel?.(65);
            this.latestInterimText = data.trim();
            this.callbacks.onTranscriptUpdate?.(this.finalsHistory, data.trim());
            this.callbacks.onInterim?.(data.trim());
          }
        } else if (eventType === 'onResults') {
          if (data && data.trim()) {
            this.commitText(data.trim(), 0.95);
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

    // Direct synchronous start to preserve mobile User Gesture token
    this.isListening = true;
    this.callbacks.onStateChange?.(true);
    this.initRecognition();
    this.startSimulatedVisualizer();
  }

  private commitText(text: string, confidence: number = 0.95) {
    const clean = text.trim();
    if (!clean) return;

    this.finalsHistory = deduplicateSentenceStream([...this.finalsHistory, clean]);
    this.lastCommittedText = clean;
    this.latestInterimText = '';

    this.callbacks.onAudioLevel?.(80);
    this.callbacks.onTranscriptUpdate?.(this.finalsHistory, '');
    this.callbacks.onFinal?.(clean, confidence);
  }

  private resetSilenceTimer() {
    if (this.silenceTimerId) {
      clearTimeout(this.silenceTimerId);
      this.silenceTimerId = null;
    }

    // Auto-commit on pause of 1.4s
    this.silenceTimerId = setTimeout(() => {
      if (this.latestInterimText && this.latestInterimText.trim()) {
        const textToCommit = this.latestInterimText.trim();
        this.commitText(textToCommit, 0.92);
      }
    }, 1400);
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

      this.lastSessionFinals = [];
      this.lastReportedFinalIndex = -1;

      const isMobile =
        typeof navigator !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      this.recognition = new SpeechRecognitionClass();
      // On mobile browsers, continuous = false prevents mobile Web Speech service crashes
      this.recognition.continuous = !isMobile;
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
        const currentFinals: string[] = [];
        let interimTranscript = '';
        let latestNewFinalChunk = '';
        let confidence = 0.95;

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript?.trim() || '';
          if (!text) continue;

          if (result.isFinal) {
            currentFinals.push(text);
            if (i > this.lastReportedFinalIndex) {
              this.lastReportedFinalIndex = i;
              latestNewFinalChunk = text;
              if (result[0]?.confidence) confidence = result[0].confidence;
            }
          } else {
            interimTranscript += (interimTranscript ? ' ' : '') + text;
          }
        }

        this.lastSessionFinals = currentFinals;
        const allFinals = deduplicateSentenceStream([...this.finalsHistory, ...currentFinals]);

        this.callbacks.onAudioLevel?.(Math.floor(Math.random() * 40) + 50);

        if (interimTranscript) {
          this.latestInterimText = interimTranscript;
          this.callbacks.onInterim?.(interimTranscript);
          this.resetSilenceTimer();
        }

        if (this.callbacks.onTranscriptUpdate) {
          this.callbacks.onTranscriptUpdate(allFinals, interimTranscript);
        }

        if (latestNewFinalChunk) {
          this.latestInterimText = '';
          if (this.silenceTimerId) clearTimeout(this.silenceTimerId);
          this.commitText(latestNewFinalChunk, confidence);
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
          this.isListening = false;
          this.callbacks.onError(
            'Microphone access was denied. Please allow microphone permission in your browser.'
          );
          this.stop();
          return;
        }
        if (error === 'language-not-supported') {
          if (this.currentLanguageBcp47 === 'ur-IN') {
            this.currentLanguageBcp47 = 'ur-PK';
          } else if (this.currentLanguageBcp47 === 'ur-PK') {
            this.currentLanguageBcp47 = 'ur';
          } else if (this.currentLanguageBcp47 === 'ar-SA') {
            this.currentLanguageBcp47 = 'ar';
          } else if (this.currentLanguageBcp47 === 'hi-IN') {
            this.currentLanguageBcp47 = 'hi';
          }
          try {
            this.recognition.lang = this.currentLanguageBcp47;
            this.recognition.start();
            return;
          } catch {}
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
        // If there is uncommitted interim text when onend triggers (typical on mobile Android Chrome)
        if (this.latestInterimText && this.latestInterimText.trim()) {
          const uncommitted = this.latestInterimText.trim();
          this.commitText(uncommitted, 0.90);
        } else if (this.lastSessionFinals.length > 0) {
          this.finalsHistory = deduplicateSentenceStream([...this.finalsHistory, ...this.lastSessionFinals]);
          this.lastSessionFinals = [];
          this.lastReportedFinalIndex = -1;
        }

        if (this.shouldKeepListening) {
          if (this.restartTimeoutId) clearTimeout(this.restartTimeoutId);
          this.restartTimeoutId = setTimeout(() => {
            if (this.shouldKeepListening) {
              try {
                this.initRecognition();
              } catch {}
            }
          }, 80);
        } else {
          this.isListening = false;
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
        }, 200);
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
    this.currentLanguageBcp47 = normalizeBcp47(bcp47Lang);
    if (typeof window !== 'undefined' && (window as any).AndroidSpeech) {
      try {
        (window as any).AndroidSpeech.startListening(this.currentLanguageBcp47);
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

    if (this.silenceTimerId) {
      clearTimeout(this.silenceTimerId);
      this.silenceTimerId = null;
    }

    if (this.latestInterimText && this.latestInterimText.trim()) {
      const textToCommit = this.latestInterimText.trim();
      this.commitText(textToCommit, 0.90);
    }

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
