'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Play,
  Square,
  Copy,
  Check,
  Share2,
  Download,
  FileText,
  FileCode,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertCircle,
  Clock,
  Globe,
  Settings2,
  FileAudio,
  Trash2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Radio,
  AlignLeft,
  AlignRight,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { shareFileNative, isNativeAndroid } from '@/lib/native/android-bridge';
import {
  transcribeAudioWithWhisper,
  TranscriptionResult,
  formatTranscription,
} from '@/lib/voice/whisper-engine';
import {
  VOICE_LIMITS,
  getRemainingVoiceMinutes,
  getDailyVoiceUsageMinutes,
  recordVoiceUsage,
  canTranscribeDuration,
} from '@/lib/voice/voice-limits';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

const LANGUAGES = [
  { code: 'auto', label: '🌐 Auto-Detect Language', flag: '🌐', bcp47: 'en-US' },
  { code: 'ur', label: '🇵🇰 اردو (Urdu)', flag: '🇵🇰', bcp47: 'ur-PK' },
  { code: 'ar', label: '🇸🇦 العربية (Arabic)', flag: '🇸🇦', bcp47: 'ar-SA' },
  { code: 'hi', label: '🇮🇳 हिन्दी (Hindi)', flag: '🇮🇳', bcp47: 'hi-IN' },
  { code: 'en', label: '🇺🇸 English (US/UK)', flag: '🇺🇸', bcp47: 'en-US' },
];

const MODELS = [
  { id: 'Xenova/whisper-tiny', name: 'Whisper Tiny (Ultra-Fast)', size: '~39 MB', badge: 'Fastest' },
  { id: 'Xenova/whisper-base', name: 'Whisper Base (High Precision)', size: '~74 MB', badge: 'Recommended' },
];

export function VoiceToTextStudio() {
  const { language: uiLang, isRTL: uiRTL } = useI18n();
  const { recordToolUsage } = useUserStore();

  // Mode: 'record' or 'upload'
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [selectedLang, setSelectedLang] = useState<string>('auto');
  const [selectedModel, setSelectedModel] = useState<string>('Xenova/whisper-base');

  // Usage stats
  const [remainingMinutes, setRemainingMinutes] = useState<number>(30);
  const [usedMinutes, setUsedMinutes] = useState<number>(0);

  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveInterim, setLiveInterim] = useState<string>('');

  // Uploaded audio state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAudioDuration, setUploadedAudioDuration] = useState<number | null>(null);

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [transcription, setTranscription] = useState<string>('');
  const [resultMeta, setResultMeta] = useState<{
    duration: number;
    wordCount: number;
    charCount: number;
    isRTL: boolean;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

  // Audio & Speech Recognition Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Web Speech Recognition Engine Ref
  const recognitionRef = useRef<any>(null);
  const liveFinalBufferRef = useRef<string[]>([]);
  const lastSpeechTimestampRef = useRef<number>(Date.now());
  const pauseCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh usage limits on mount
  const refreshUsage = () => {
    setRemainingMinutes(getRemainingVoiceMinutes());
    setUsedMinutes(getDailyVoiceUsageMinutes());
  };

  useEffect(() => {
    refreshUsage();
    return () => {
      cleanupRecordingResources();
    };
  }, []);

  const cleanupRecordingResources = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (pauseCheckIntervalRef.current) {
      clearInterval(pauseCheckIntervalRef.current);
      pauseCheckIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
  };

  // Helper to compute BCP47 language code for native SpeechRecognition
  const getBcp47Lang = (langCode: string): string => {
    if (langCode === 'ur') return 'ur-PK';
    if (langCode === 'ar') return 'ar-SA';
    if (langCode === 'hi') return 'hi-IN';
    if (langCode === 'en') return 'en-US';
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    return 'en-US';
  };

  // Smart sentence and paragraph boundary formatter
  const applySmartPunctuationAndParagraphs = (sentences: string[], lang: string): string => {
    if (sentences.length === 0) return '';
    const isRtl = lang === 'ur' || lang === 'ar';
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    sentences.forEach((sentence) => {
      let s = sentence.trim();
      if (!s) return;

      // Capitalize first letter for Latin languages
      if (!isRtl && lang !== 'hi') {
        s = s.charAt(0).toUpperCase() + s.slice(1);
      }

      // Add appropriate ending punctuation if missing
      if (!/[.!?۔،।]$/.test(s)) {
        if (lang === 'ur') s += '۔';
        else if (lang === 'hi') s += '।';
        else if (lang === 'ar') s += '.';
        else s += '.';
      }

      currentParagraph.push(s);

      // Group into readable paragraphs (every 2-3 sentences or after pause breaks)
      if (currentParagraph.length >= 2) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    });

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs.join('\n\n');
  };

  // Start Live Microphone Recording & Real-time Recognition
  const handleStartRecording = async () => {
    setMicError(null);
    setErrorMessage(null);
    setLiveInterim('');
    setTranscription('');
    setResultMeta(null);
    liveFinalBufferRef.current = [];
    lastSpeechTimestampRef.current = Date.now();

    if (remainingMinutes <= 0) {
      setErrorMessage("You've reached today's free transcription limit (30 min). Please try again tomorrow.");
      return;
    }

    try {
      // 1. Request High-Quality Noise-Suppressed Audio Stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // 2. Setup Web Audio Analyser & DSP Waveform Filter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);

      // Bandpass filter for speech clarity (80Hz to 7500Hz)
      const highpass = audioCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 80;

      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 7500;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(analyser);
      analyserRef.current = analyser;

      drawVisualizer();

      // 3. Initialize High-Accuracy Native SpeechRecognition for Real-time Streaming
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = getBcp47Lang(selectedLang);

        recognition.onresult = (event: any) => {
          lastSpeechTimestampRef.current = Date.now();
          let interimStr = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0].transcript;

            if (result.isFinal) {
              const cleaned = text.trim();
              if (cleaned.length > 0) {
                liveFinalBufferRef.current.push(cleaned);
              }
            } else {
              interimStr += text;
            }
          }

          setLiveInterim(interimStr);

          // Update live structured transcription
          const formatted = applySmartPunctuationAndParagraphs(
            liveFinalBufferRef.current,
            selectedLang
          );
          if (formatted) {
            setTranscription(formatted);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition notice:', e.error);
        };

        recognition.onend = () => {
          // Keep listening continuously if recording is active
          if (mediaStreamRef.current && mediaStreamRef.current.active) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Could not start live speech recognition:', e);
        }
      }

      // 4. Setup MediaRecorder as Audio Backup and Whisper Engine Pipeline
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        handleRecordingFinished(audioBlob, recordingSeconds);
      };

      recorder.start(500); // 500ms slices
      setIsRecording(true);
      setRecordingSeconds(0);
      triggerHaptic('medium');

      // 5. Start Elapsed Recording Timer & Silence Paragraph Boundary Monitor
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= VOICE_LIMITS.MAX_RECORDING_MINUTES * 60) {
            handleStopRecording();
          }
          return next;
        });
      }, 1000);

      // Silence monitor: if speaker pauses for >2.5 seconds, insert paragraph break
      pauseCheckIntervalRef.current = setInterval(() => {
        const silenceDuration = Date.now() - lastSpeechTimestampRef.current;
        if (silenceDuration > 2500 && liveFinalBufferRef.current.length > 0) {
          const lastItem = liveFinalBufferRef.current[liveFinalBufferRef.current.length - 1];
          if (lastItem && !lastItem.endsWith('\n\n')) {
            liveFinalBufferRef.current[liveFinalBufferRef.current.length - 1] = lastItem + '\n\n';
            const formatted = applySmartPunctuationAndParagraphs(
              liveFinalBufferRef.current,
              selectedLang
            );
            if (formatted) setTranscription(formatted);
          }
        }
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access is required for voice recording. Please allow microphone permission and try again.');
      } else {
        setMicError('Unable to access microphone. Please check your audio device or upload an audio file instead.');
      }
      triggerHaptic('error');
    }
  };

  // Draw Dynamic Audio Visualizer
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.92;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#0052cc');
        gradient.addColorStop(1, '#38bdf8');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    render();
  };

  // Stop Microphone Recording
  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setLiveInterim('');
    triggerHaptic('success');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (pauseCheckIntervalRef.current) {
      clearInterval(pauseCheckIntervalRef.current);
      pauseCheckIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    cleanupRecordingResources();
  };

  // Post-Recording Finalization (Dual-Engine: Native Speech Result or Whisper Fallback)
  const handleRecordingFinished = async (audioBlob: Blob, recordedSec: number) => {
    // If native speech recognition already captured accurate text:
    if (liveFinalBufferRef.current.length > 0) {
      const formatted = applySmartPunctuationAndParagraphs(
        liveFinalBufferRef.current,
        selectedLang
      );
      const isRtl = selectedLang === 'ur' || selectedLang === 'ar';
      const wordCount = formatted.trim().split(/\s+/).filter(Boolean).length;
      const charCount = formatted.length;

      setTranscription(formatted);
      setResultMeta({
        duration: recordedSec || 1,
        wordCount,
        charCount,
        isRTL: isRtl,
      });

      recordVoiceUsage(recordedSec || 1);
      refreshUsage();
      recordToolUsage('voice-to-text', 'Voice to Text', 'text', 'Mic');
      return;
    }

    // Otherwise, process audio through Whisper AI engine
    if (audioBlob.size > 0) {
      processAudioForTranscription(audioBlob, recordedSec);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > VOICE_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the limit of ${VOICE_LIMITS.MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setUploadedFile(file);

    const audioObj = new Audio(URL.createObjectURL(file));
    audioObj.onloadedmetadata = () => {
      setUploadedAudioDuration(audioObj.duration);
    };
  };

  // Execute Whisper Neural Transcription for Files & Fallback
  const processAudioForTranscription = async (audioData: Blob | File, durationSecEstimate?: number) => {
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStatus('Decoding and filtering acoustic spectrum...');
    setErrorMessage(null);

    try {
      const result: TranscriptionResult = await transcribeAudioWithWhisper(audioData, {
        language: selectedLang,
        model: selectedModel,
        onProgress: (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        },
      });

      if (result.noSpeech || result.text.trim().length === 0) {
        setErrorMessage('No clear speech was detected. Please verify your recording and try again.');
        setTranscription('');
        setResultMeta(null);
      } else {
        const { formattedText, isRTL, wordCount, charCount } = formatTranscription(
          result.text,
          selectedLang
        );

        setTranscription(formattedText);
        setResultMeta({
          duration: result.durationSeconds || durationSecEstimate || 0,
          wordCount,
          charCount,
          isRTL,
        });

        const durationSec = result.durationSeconds || durationSecEstimate || 10;
        recordVoiceUsage(durationSec);
        refreshUsage();
        recordToolUsage('voice-to-text', 'Voice to Text', 'text', 'Mic');
        triggerHaptic('success');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'An error occurred during transcription. Please try again.');
      triggerHaptic('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Smart Auto-Format Tool: Reformat Paragraphs & Spacing
  const handleAutoFormatText = () => {
    if (!transcription) return;
    const lines = transcription.split(/\n+/).filter(Boolean);
    const reformatted = applySmartPunctuationAndParagraphs(lines, selectedLang);
    setTranscription(reformatted);
    triggerHaptic('light');
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = transcription;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Native & Web Share
  const handleShare = async () => {
    if (!transcription) return;
    triggerHaptic('light');

    if (isNativeAndroid()) {
      await shareFileNative(transcription, 'voice_transcription.txt', 'text/plain');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Voice to Text Transcription — Miftah Tools',
          text: transcription,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  // Download TXT
  const handleDownloadTxt = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `miftah_transcription_${Date.now()}.txt`);
    triggerHaptic('success');
  };

  // Download DOCX
  const handleDownloadDocx = async () => {
    if (!transcription) return;
    triggerHaptic('medium');

    const paragraphs = transcription.split(/\r?\n\r?\n/).map(
      (para) =>
        new Paragraph({
          children: [
            new TextRun({
              text: para,
              size: 26, // 13pt
              font: resultMeta?.isRTL ? 'Amiri' : 'Arial',
              rightToLeft: resultMeta?.isRTL,
            }),
          ],
          spacing: { after: 200, line: 360 },
          bidirectional: resultMeta?.isRTL,
          alignment: resultMeta?.isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
        })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Voice to Text Transcription',
              heading: 'Heading1',
              spacing: { after: 240 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `miftah_transcription_${Date.now()}.docx`);
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!transcription) return;
    triggerHaptic('medium');

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
    });

    const isRtl = resultMeta?.isRTL;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 45;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.text('Voice to Text Transcription', margin, 50);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = `Generated via Miftah Tools • ${new Date().toLocaleDateString()}`;
    doc.text(dateStr, margin, 70);

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 80, pageWidth - margin, 80);

    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);

    const splitLines = doc.splitTextToSize(transcription, maxLineWidth);
    let y = 110;

    for (let i = 0; i < splitLines.length; i++) {
      if (y > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        y = 50;
      }
      if (isRtl) {
        doc.text(splitLines[i], pageWidth - margin, y, { align: 'right' });
      } else {
        doc.text(splitLines[i], margin, y);
      }
      y += 20;
    }

    doc.save(`miftah_transcription_${Date.now()}.pdf`);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isRtlLanguage = selectedLang === 'ur' || selectedLang === 'ar' || resultMeta?.isRTL;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Free Usage Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052cc] to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Voice to Text
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                  100% Free & Accurate
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time speech recognition with auto-paragraphs, acoustic noise suppression, and multi-language support.
              </p>
            </div>
          </div>

          {/* Daily Allowance Meter */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0052cc]" />
                <span>Daily Free Allowance</span>
              </span>
              <span className="font-mono text-[#0052cc] dark:text-blue-400">
                {remainingMinutes} min left
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#0052cc] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, ((VOICE_LIMITS.DAILY_FREE_MINUTES - usedMinutes) / VOICE_LIMITS.DAILY_FREE_MINUTES) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>{usedMinutes.toFixed(1)}m used</span>
              <span>{VOICE_LIMITS.DAILY_FREE_MINUTES}m daily limit</span>
            </div>
          </div>
        </div>

        {/* Configuration Bar: Language & Engine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0052cc]" />
              <span>Spoken Language (زبان / भाषा)</span>
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-[#0052cc] outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Speech Recognition Engine</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.size}) — {model.badge}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Mode Selector: Record vs Upload */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => {
            setActiveTab('record');
            triggerHaptic('light');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'record'
              ? 'bg-white dark:bg-slate-900 text-[#0052cc] dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Live Microphone Recording</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            triggerHaptic('light');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 text-[#0052cc] dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Audio File</span>
        </button>
      </div>

      {/* 3. Main Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMessage}</div>
          </div>
        )}

        {micError && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{micError}</div>
          </div>
        )}

        {/* TAB 1: Live Recording */}
        {activeTab === 'record' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            {/* Visualizer Canvas */}
            <div className="w-full max-w-lg h-24 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2 relative shadow-inner">
              <canvas
                ref={canvasRef}
                width={480}
                height={80}
                className="w-full h-full"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400">
                  Ready to record • Tap the microphone to start speaking
                </div>
              )}
            </div>

            {/* Live Interim Speech Badge */}
            {isRecording && liveInterim && (
              <div className="w-full max-w-xl px-4 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 text-xs text-[#0052cc] dark:text-blue-300 flex items-center gap-2 animate-pulse font-semibold">
                <Radio className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">"{liveInterim}"</span>
              </div>
            )}

            {/* Timer & Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 font-mono text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                <div className={`w-3.5 h-3.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
                <span>{formatSeconds(recordingSeconds)}</span>
                <span className="text-xs font-sans text-slate-400 font-bold ml-1">/ 10:00 max</span>
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#0052cc] to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Live Voice Typing</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop & Finalize Text</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Upload Audio File */}
        {activeTab === 'upload' && (
          <div className="py-4 space-y-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#0052cc] rounded-3xl p-8 sm:p-12 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30">
              <input
                type="file"
                id="voice-file-upload"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="voice-file-upload"
                className="flex flex-col items-center justify-center cursor-pointer space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <FileAudio className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white block">
                    {uploadedFile ? uploadedFile.name : 'Click to select or drag audio file here'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Supports MP3, WAV, M4A, AAC, OGG, WEBM, FLAC (Max: 50 MB / 10 min)
                  </span>
                </div>
              </label>
            </div>

            {uploadedFile && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-[#0052cc]" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      {uploadedAudioDuration && ` • ~${formatSeconds(Math.round(uploadedAudioDuration))}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => processAudioForTranscription(uploadedFile, uploadedAudioDuration || 0)}
                  className="px-6 py-2.5 rounded-xl bg-[#0052cc] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Transcribe File with AI</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar during AI processing */}
        {isProcessing && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0052cc] animate-spin" />
                <span>{progressStatus}</span>
              </span>
              <span className="font-mono text-[#0052cc]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-[#0052cc] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 4. Interactive Transcription Result & Paragraph Editor */}
        {transcription && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0052cc]" />
                  <span>Transcription Output</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({transcription.trim().split(/\s+/).filter(Boolean).length} words • {transcription.length} chars)
                </span>
              </div>

              {/* Formatting Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFormatText}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0052cc] bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  title="Auto-format paragraphs and punctuation"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Format Paragraphs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTranscription('')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-800 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Editable Text Area */}
            <div className="relative">
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                dir={isRtlLanguage ? 'rtl' : 'ltr'}
                rows={10}
                className={`w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed outline-none focus:ring-2 focus:ring-[#0052cc] focus:bg-white dark:focus:bg-slate-900 transition-all font-sans ${
                  selectedLang === 'ur' ? 'font-urdu leading-[2.2]' : selectedLang === 'ar' ? 'font-arabic leading-[2.0]' : ''
                }`}
                placeholder="Spoken words will appear here automatically in real-time..."
              />
            </div>

            {/* Action Buttons: Copy, Share, TXT, DOCX, PDF */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0052cc] bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#0052cc]" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0052cc] bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-blue-500" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Download TXT</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDocx}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-rose-500" />
                <span>PDF (.pdf)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Private & Free</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time client-side speech recognition in your browser. No paid third-party APIs or stored voice data.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Globe className="w-4 h-4 text-[#0052cc]" />
            <span>Urdu, Arabic, Hindi & English</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Full dialect mapping for Urdu (ur-PK), Arabic (ar-SA), Hindi (hi-IN), and English with auto RTL script support.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Smart Auto-Paragraphs</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Automatically detects speech pauses to insert ending punctuation and create clean paragraph breaks.
          </p>
        </div>
      </div>
    </div>
  );
}
