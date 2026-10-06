export class TextToSpeechController {
  private static cachedVoices: SpeechSynthesisVoice[] = [];

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private static getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    if (this.cachedVoices.length > 0) return this.cachedVoices;

    this.cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
    return this.cachedVoices;
  }

  public static speak(
    text: string,
    bcp47Lang: string = 'en-US',
    rate: number = 1.0,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.isSupported() || !text.trim()) return;

    try {
      window.speechSynthesis.cancel(); // Stop any currently playing audio

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47Lang;
      utterance.rate = Math.max(0.5, Math.min(2.0, rate));

      const voices = this.getVoices();
      const langPrefix = bcp47Lang.split('-')[0].toLowerCase();

      // Find the most appropriate voice
      const exactVoice = voices.find(
        (v) => v.lang.toLowerCase() === bcp47Lang.toLowerCase()
      );
      const prefixVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langPrefix)
      );

      if (exactVoice) {
        utterance.voice = exactVoice;
      } else if (prefixVoice) {
        utterance.voice = prefixVoice;
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = (e) => onError?.(e);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      onError?.(err);
    }
  }

  public static stop() {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}
