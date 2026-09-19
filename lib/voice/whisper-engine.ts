/**
 * Miftah Tools - High-Performance Open-Source Whisper Speech-to-Text Engine
 * 100% Free, Private, and Client-Side with Zero Paid API Dependencies.
 */

export interface TranscriptionOptions {
  language?: 'auto' | 'en' | 'ur' | 'ar' | 'hi' | string;
  model?: 'Xenova/whisper-tiny' | 'Xenova/whisper-base' | string;
  onProgress?: (percent: number, status: string) => void;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  durationSeconds: number;
  wordCount: number;
  charCount: number;
  isRTL: boolean;
  noSpeech?: boolean;
}

let whisperPipelinePromise: Promise<any> | null = null;
let currentLoadedModel: string | null = null;

/**
 * Universal Transformers.js Whisper Pipeline Loader
 */
export async function getWhisperPipeline(
  modelName: string = 'Xenova/whisper-tiny',
  onProgress?: (percent: number, status: string) => void
): Promise<any> {
  if (whisperPipelinePromise && currentLoadedModel === modelName) {
    return whisperPipelinePromise;
  }

  currentLoadedModel = modelName;
  whisperPipelinePromise = (async () => {
    onProgress?.(10, 'Initializing Whisper Speech Recognition Engine...');

    try {
      // Dynamic import to support client-side bundling without SSR breakage
      const { pipeline, env } = await import('@xenova/transformers');

      // Configure Transformers.js cache & execution environment
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const asr = await pipeline('automatic-speech-recognition', modelName, {
        progress_callback: (info: any) => {
          if (info.status === 'progress' && info.total) {
            const pct = Math.min(95, Math.round(10 + (info.loaded / info.total) * 40));
            onProgress?.(pct, `Loading Whisper model (${(info.loaded / (1024 * 1024)).toFixed(1)} / ${(info.total / (1024 * 1024)).toFixed(1)} MB)...`);
          } else if (info.status === 'ready') {
            onProgress?.(50, 'Whisper model ready!');
          }
        },
      });

      return asr;
    } catch (err) {
      whisperPipelinePromise = null;
      console.error('Failed to load Whisper ASR pipeline:', err);
      throw new Error('Could not load speech recognition model. Please verify your connection and try again.');
    }
  })();

  return whisperPipelinePromise;
}

/**
 * Decodes any audio container (MP3, WAV, M4A, AAC, OGG, WEBM, FLAC) into an AudioBuffer
 */
export async function decodeAudioToAudioBuffer(
  audioFileOrBlob: Blob | File | ArrayBuffer,
  onProgress?: (percent: number, status: string) => void
): Promise<AudioBuffer> {
  onProgress?.(15, 'Reading and decoding audio stream...');
  const arrayBuffer =
    audioFileOrBlob instanceof ArrayBuffer
      ? audioFileOrBlob
      : await audioFileOrBlob.arrayBuffer();

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioContext = new AudioCtx();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return audioBuffer;
  } catch (err: any) {
    throw new Error('Unable to decode audio format. Please ensure the file is a valid audio recording.');
  } finally {
    try {
      await audioContext.close();
    } catch (_) {}
  }
}

/**
 * Resamples an AudioBuffer to standard 16,000 Hz Mono Float32Array required by Whisper
 */
export function resampleTo16kHzMono(audioBuffer: AudioBuffer): Float32Array {
  const targetSampleRate = 16000;
  const numChannels = audioBuffer.numberOfChannels;
  const originalSampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // 1. Convert multi-channel to mono
  let monoData: Float32Array;
  if (numChannels === 1) {
    monoData = audioBuffer.getChannelData(0);
  } else {
    monoData = new Float32Array(length);
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    for (let i = 0; i < length; i++) {
      monoData[i] = (left[i] + right[i]) / 2;
    }
  }

  // 2. If already 16kHz, return directly
  if (originalSampleRate === targetSampleRate) {
    return monoData;
  }

  // 3. Linear interpolation resampling to 16kHz
  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const origIndex = i * ratio;
    const indexFloor = Math.floor(origIndex);
    const indexCeil = Math.min(length - 1, indexFloor + 1);
    const fraction = origIndex - indexFloor;
    result[i] = monoData[indexFloor] * (1 - fraction) + monoData[indexCeil] * fraction;
  }

  return result;
}

/**
 * Pre-processing Pipeline: Noise Gate, Peak Normalization, and Soft Limiter
 */
export function preprocessAudioSamples(samples: Float32Array): {
  processed: Float32Array;
  hasSpeech: boolean;
  peakEnergy: number;
} {
  const len = samples.length;
  if (len === 0) {
    return { processed: samples, hasSpeech: false, peakEnergy: 0 };
  }

  // Find peak absolute amplitude and RMS
  let maxAmp = 0;
  let sumSquares = 0;
  for (let i = 0; i < len; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxAmp) maxAmp = abs;
    sumSquares += abs * abs;
  }
  const rms = Math.sqrt(sumSquares / len);

  // Voice Activity Detection (VAD) threshold check:
  // If RMS is below 0.001 and maxAmp < 0.005, audio is completely silent
  if (maxAmp < 0.005 || rms < 0.001) {
    return { processed: samples, hasSpeech: false, peakEnergy: maxAmp };
  }

  const processed = new Float32Array(len);
  // Target peak normalization to ~0.90 to maximize Whisper feature extraction clarity
  const normGain = maxAmp > 0 ? Math.min(10.0, 0.90 / maxAmp) : 1.0;
  // Soft noise gate threshold at ~5% of RMS to suppress static mic hiss
  const noiseFloor = Math.max(0.002, rms * 0.08);

  for (let i = 0; i < len; i++) {
    let s = samples[i];
    // Noise gate suppression
    if (Math.abs(s) < noiseFloor) {
      s *= 0.2; // Attenuate ambient noise floor
    }
    // Apply normalization
    let boosted = s * normGain;
    // Soft limiting to avoid harsh digital clipping
    if (boosted > 0.98) boosted = Math.tanh(boosted);
    else if (boosted < -0.98) boosted = Math.tanh(boosted);
    processed[i] = boosted;
  }

  return { processed, hasSpeech: true, peakEnergy: maxAmp };
}

/**
 * Safe deterministic post-processing: smart paragraph segmentation, punctuation, spacing, and script integrity
 */
export function formatTranscription(rawText: string, lang: string): {
  formattedText: string;
  isRTL: boolean;
  wordCount: number;
  charCount: number;
} {
  let text = (rawText || '').trim();
  if (!text) {
    return { formattedText: '', isRTL: lang === 'ur' || lang === 'ar', wordCount: 0, charCount: 0 };
  }

  // Normalize spaces and linebreaks
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/(\r\n|\r|\n)+/g, '\n');

  // Detect RTL script (Urdu, Arabic, Persian, Hebrew)
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const isRTL = lang === 'ur' || lang === 'ar' || rtlRegex.test(text);

  // Smart sentence formatting & auto-paragraph grouping
  const lines = text.split('\n');
  const formattedParagraphs: string[] = [];

  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;

    // Capitalize first letter of sentences for Latin scripts
    if (!isRTL && lang !== 'hi') {
      trimmed = trimmed.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
    }

    // Ensure sentence ending punctuation if missing
    if (!/[.!?۔،।]$/.test(trimmed)) {
      if (lang === 'ur') {
        trimmed += '۔';
      } else if (lang === 'hi') {
        trimmed += '।';
      } else if (lang === 'ar') {
        trimmed += '.';
      } else {
        trimmed += '.';
      }
    }

    formattedParagraphs.push(trimmed);
  }

  // Group into clean paragraphs with double newlines
  const formattedText = formattedParagraphs.join('\n\n');

  // Calculate actual metrics
  const wordCount = formattedText.length > 0 ? formattedText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = formattedText.length;

  return {
    formattedText,
    isRTL,
    wordCount,
    charCount,
  };
}

/**
 * Maps language codes to Whisper language identifiers
 */
function resolveWhisperLanguage(langCode: string): string | null {
  const map: Record<string, string> = {
    en: 'english',
    ur: 'urdu',
    ar: 'arabic',
    hi: 'hindi',
    fr: 'french',
    es: 'spanish',
    de: 'german',
    zh: 'chinese',
    ru: 'russian',
    tr: 'turkish',
    fa: 'persian',
  };
  return map[langCode.toLowerCase()] || (langCode !== 'auto' ? langCode : null);
}

/**
 * Transcribes audio buffer or file using self-hosted open-source Whisper
 */
export async function transcribeAudioWithWhisper(
  audioInput: Blob | File | AudioBuffer,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const onProgress = options.onProgress;
  const selectedLang = options.language || 'auto';
  const modelName = options.model || 'Xenova/whisper-tiny';

  // 1. Decode audio
  let audioBuffer: AudioBuffer;
  if (audioInput instanceof AudioBuffer) {
    audioBuffer = audioInput;
  } else {
    audioBuffer = await decodeAudioToAudioBuffer(audioInput, onProgress);
  }

  const durationSeconds = audioBuffer.duration;

  // 2. Resample to 16kHz Mono Float32Array
  onProgress?.(30, 'Resampling audio to 16,000 Hz Mono...');
  const resampled16k = resampleTo16kHzMono(audioBuffer);

  // 3. Audio Pre-processing: VAD, Noise Gating, and Normalization
  onProgress?.(45, 'Applying acoustic noise reduction and audio normalization...');
  const { processed, hasSpeech } = preprocessAudioSamples(resampled16k);

  if (!hasSpeech) {
    return {
      text: '',
      language: selectedLang,
      durationSeconds,
      wordCount: 0,
      charCount: 0,
      isRTL: selectedLang === 'ur' || selectedLang === 'ar',
      noSpeech: true,
    };
  }

  // 4. Load Whisper Pipeline
  const asrPipeline = await getWhisperPipeline(modelName, onProgress);

  // 5. Execute Whisper Speech-to-Text inference
  onProgress?.(60, 'Transcribing speech with Whisper AI...');

  const whisperLang = resolveWhisperLanguage(selectedLang);
  const generateKwargs: Record<string, any> = {
    task: 'transcribe', // MUST be transcribe (no forced translation)
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: false,
  };

  if (whisperLang) {
    generateKwargs.language = whisperLang;
  }

  const output = await asrPipeline(processed, generateKwargs);

  onProgress?.(90, 'Structuring punctuation and paragraphs...');
  const rawText = typeof output === 'string' ? output : output?.text || '';

  // 6. Post-processing & RTL formatting
  const { formattedText, isRTL, wordCount, charCount } = formatTranscription(rawText, selectedLang);

  onProgress?.(100, 'Transcription complete!');

  return {
    text: formattedText,
    language: selectedLang,
    durationSeconds,
    wordCount,
    charCount,
    isRTL,
    noSpeech: formattedText.length === 0,
  };
}
