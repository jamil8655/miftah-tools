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
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useUserStore } from '@/lib/user/user-store';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { shareFileNative, isNativeAndroid } from '@/lib/native/android-bridge';
import {
  transcribeAudioWithWhisper,
  TranscriptionResult,
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
  { code: 'auto', label: '🌐 Auto-Detect Language', flag: '🌐' },
  { code: 'en', label: '🇺🇸 English', flag: '🇺🇸' },
  { code: 'ur', label: '🇵🇰 اردو (Urdu)', flag: '🇵🇰' },
  { code: 'ar', label: '🇸🇦 العربية (Arabic)', flag: '🇸🇦' },
  { code: 'hi', label: '🇮🇳 हिन्दी (Hindi)', flag: '🇮🇳' },
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
  const [selectedModel, setSelectedModel] = useState<string>('Xenova/whisper-tiny');

  // Usage stats
  const [remainingMinutes, setRemainingMinutes] = useState<number>(30);
  const [usedMinutes, setUsedMinutes] = useState<number>(0);

  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

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

  // Audio Recording Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
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

  // Start Microphone Recording
  const handleStartRecording = async () => {
    setMicError(null);
    setErrorMessage(null);
    setTranscription('');
    setResultMeta(null);

    if (remainingMinutes <= 0) {
      setErrorMessage("You've reached today's free transcription limit (30 min). Please try again tomorrow.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Setup Web Audio Analyser for Visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Draw Visualizer
      drawVisualizer();

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
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
        if (audioBlob.size > 0) {
          processAudioForTranscription(audioBlob, recordingSeconds);
        }
      };

      recorder.start(500); // 500ms slices
      setIsRecording(true);
      setRecordingSeconds(0);
      triggerHaptic('medium');

      // Start Timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          // Check 10-min max recording limit
          if (next >= VOICE_LIMITS.MAX_RECORDING_MINUTES * 60) {
            handleStopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access is required for voice recording. Please allow microphone permission and try again.');
      } else {
        setMicError('Unable to access microphone. Please check your audio input device or upload an audio file instead.');
      }
      triggerHaptic('error');
    }
  };

  // Draw Audio Visualizer Waveform
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
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#0284c7');
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
    triggerHaptic('success');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    cleanupRecordingResources();
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (50 MB)
    if (file.size > VOICE_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of ${VOICE_LIMITS.MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setUploadedFile(file);

    // Read audio duration
    const audioObj = new Audio(URL.createObjectURL(file));
    audioObj.onloadedmetadata = () => {
      setUploadedAudioDuration(audioObj.duration);
    };
  };

  // Execute Transcription Pipeline
  const processAudioForTranscription = async (audioData: Blob | File, durationSecEstimate?: number) => {
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStatus('Analyzing audio stream...');
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
        setErrorMessage('No clear speech was detected. Please try recording again in a quieter environment.');
        setTranscription('');
        setResultMeta(null);
      } else {
        setTranscription(result.text);
        setResultMeta({
          duration: result.durationSeconds || durationSecEstimate || 0,
          wordCount: result.wordCount,
          charCount: result.charCount,
          isRTL: result.isRTL,
        });

        // Record usage
        const durationSec = result.durationSeconds || durationSecEstimate || 10;
        recordVoiceUsage(durationSec);
        refreshUsage();

        // Record to Recent Tools only after successful real transcription
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

  // Copy to Clipboard
  const handleCopy = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      // Fallback
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

  // Share
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

    const paragraphs = transcription.split(/\r?\n/).map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 26, // 13pt
              font: resultMeta?.isRTL ? 'Amiri' : 'Arial',
              rightToLeft: resultMeta?.isRTL,
            }),
          ],
          spacing: { after: 160 },
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
              spacing: { after: 200 },
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
    const margin = 40;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.text('Voice to Text Transcription', margin, 50);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const dateStr = `Generated via Miftah Tools • ${new Date().toLocaleDateString()}`;
    doc.text(dateStr, margin, 70);

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 80, pageWidth - margin, 80);

    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);

    const splitLines = doc.splitTextToSize(transcription, maxLineWidth);
    let y = 105;

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
      y += 18;
    }

    doc.save(`miftah_transcription_${Date.now()}.pdf`);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Header Banner & Free Usage Meter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Voice to Text
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                  Open-Source Whisper
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Free, private AI speech recognition with noise suppression and multi-language transcription.
              </p>
            </div>
          </div>

          {/* Daily Free Usage Progress */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span>Daily Free Allowance</span>
              </span>
              <span className="font-mono text-brand-600 dark:text-brand-400">
                {remainingMinutes} min left
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full transition-all duration-500"
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

        {/* Configuration Row: Language & Whisper Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Language Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-500" />
              <span>Spoken Language</span>
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model Quality Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Whisper AI Engine</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
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

      {/* 2. Mode Selector: Record Microphone vs Upload Audio */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => {
            setActiveTab('record');
            triggerHaptic('light');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'record'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
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
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Audio File</span>
        </button>
      </div>

      {/* 3. Main Workspace Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Live Recording */}
        {activeTab === 'record' && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-4 sm:py-6">
            {micError && (
              <div className="w-full max-w-lg p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p>{micError}</p>
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* Visualizer Canvas */}
            <div className="w-full max-w-md h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
              {isRecording ? (
                <canvas ref={canvasRef} width={400} height={80} className="w-full h-full" />
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span>Audio waveform visualizer will appear during recording</span>
                </div>
              )}
            </div>

            {/* Timer & Status */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-slate-900 dark:text-white">
                {formatSeconds(recordingSeconds)}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isRecording ? 'Listening... Speak clearly into your microphone' : 'Ready to record (Max 10 min per session)'}
              </p>
            </div>

            {/* Main Action Button */}
            <div>
              {!isRecording ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleStartRecording}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-brand-600/30 transition-all cursor-pointer select-none"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-rose-600/30 transition-all animate-pulse cursor-pointer select-none"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Stop & Transcribe</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Audio File */}
        {activeTab === 'upload' && (
          <div className="space-y-6 py-2">
            {!uploadedFile ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/60 dark:bg-slate-800/40 select-none">
                <input
                  type="file"
                  accept={VOICE_LIMITS.SUPPORTED_EXTENSIONS.join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 shadow-xs">
                  <FileAudio className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Select or drop audio file
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-3">
                  Supports MP3, WAV, M4A, AAC, OGG, and WEBM (Up to 50 MB / 10 min duration)
                </p>
                <span className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-600/20">
                  Choose Audio File
                </span>
              </label>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        {uploadedAudioDuration && ` • Duration: ${formatSeconds(Math.round(uploadedAudioDuration))}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadedAudioDuration(null);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Audio Player Preview */}
                <audio
                  controls
                  src={URL.createObjectURL(uploadedFile)}
                  className="w-full h-10 rounded-lg outline-none"
                />

                {/* Transcribe Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => processAudioForTranscription(uploadedFile, uploadedAudioDuration || 0)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Whisper AI Transcription</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Processing Progress Bar */}
        {isProcessing && (
          <div className="my-6 p-5 rounded-2xl bg-brand-50/60 dark:bg-slate-800/80 border border-brand-200 dark:border-brand-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
                <span>{progressStatus || 'Processing audio with Whisper AI...'}</span>
              </span>
              <span className="font-mono text-brand-600 dark:text-brand-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 5. Transcription Result & Live Editor */}
        {transcription && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            {/* Header & Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Editable Transcription
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  {resultMeta?.isRTL ? 'RTL Text' : 'LTR Text'}
                </span>
              </div>

              {/* Word & Char Counters */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>
                  <strong>{resultMeta?.wordCount || transcription.trim().split(/\s+/).filter(Boolean).length}</strong> words
                </span>
                <span>•</span>
                <span>
                  <strong>{transcription.length}</strong> chars
                </span>
                {resultMeta?.duration ? (
                  <>
                    <span>•</span>
                    <span>
                      Duration: <strong>{formatSeconds(Math.round(resultMeta.duration))}</strong>
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Editable Textarea */}
            <div className="relative">
              <textarea
                dir={resultMeta?.isRTL ? 'rtl' : 'ltr'}
                value={transcription}
                onChange={(e) => {
                  setTranscription(e.target.value);
                  const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
                  setResultMeta((prev) => (prev ? { ...prev, wordCount: words, charCount: e.target.value.length } : null));
                }}
                rows={10}
                placeholder="Transcription text..."
                className={`w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed focus:ring-2 focus:ring-brand-500 outline-none resize-y ${
                  resultMeta?.isRTL ? 'font-serif text-right' : 'font-sans text-left'
                }`}
              />
            </div>

            {/* Export and Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
              {/* Left Actions: Copy & Share */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{shared ? 'Shared!' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTranscription('');
                    setResultMeta(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Clear Text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Right Actions: Export Downloads */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>DOCX</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Feature Highlights Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Private & Free</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Runs client-side Whisper in your browser. No paid third-party APIs or stored voice data.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Globe className="w-4 h-4 text-brand-500" />
            <span>Multi-Language & RTL</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Native support for Urdu, Arabic, Hindi, and English with auto script and punctuation formatting.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Download className="w-4 h-4 text-indigo-500" />
            <span>One-Click Export</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Instant export to TXT, Word DOCX, and PDF with copy & native Android sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
