'use client';

import React, { useState, useRef } from 'react';
import { Scissors, Upload, Download, CheckCircle, AlertCircle, RefreshCw, FileAudio } from 'lucide-react';
import { trimAudioFile } from '@/lib/media/audio-engine';
import { downloadSingleFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';

export function AudioCutterStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(30);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);

      // Load duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(f);
      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration);
        setDuration(dur);
        setStartSec(0);
        setEndSec(Math.min(30, dur));
      };
    }
  };

  const handleTrim = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { blob } = await trimAudioFile(file, startSec, endSec);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to trim audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Audio Cutter & Ringtone Trimmer</h2>
            <p className="text-sm text-slate-400">Trim, cut, and slice MP3, WAV, and audio files with millisecond accuracy.</p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-violet-500/50 bg-slate-950/50 hover:bg-slate-900/50 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-white mb-1">Click or drag & drop audio track</p>
            <p className="text-xs text-slate-400">MP3, WAV, AAC, M4A, OGG, FLAC supported (Up to 500 MB)</p>
          </div>
        )}

        {/* Selected Audio Controls */}
        {file && !resultUrl && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-slate-400">Total Duration: {duration}s | {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Change
              </button>
            </div>

            {/* Time Sliders */}
            <div dir="ltr" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>Start Time:</span>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, endSec - 1)}
                    value={startSec}
                    onChange={(e) => setStartSec(Math.min(Math.max(0, Number(e.target.value) || 0), endSec - 1))}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-right font-mono text-xs text-white"
                  />
                </div>
                <input
                  type="range"
                  dir="ltr"
                  min={0}
                  max={Math.max(0, duration - 1)}
                  value={startSec}
                  onChange={(e) => setStartSec(Math.min(Number(e.target.value), endSec - 1))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>End Time:</span>
                  <input
                    type="number"
                    min={startSec + 1}
                    max={duration}
                    value={endSec}
                    onChange={(e) => setEndSec(Math.min(Math.max(startSec + 1, Number(e.target.value) || duration), duration))}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-right font-mono text-xs text-white"
                  />
                </div>
                <input
                  type="range"
                  dir="ltr"
                  min={1}
                  max={duration}
                  value={endSec}
                  onChange={(e) => setEndSec(Math.max(Number(e.target.value), startSec + 1))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-xs text-center text-slate-400">
              Selected Clip Length: <span className="text-violet-400 font-semibold">{Math.max(0, endSec - startSec)} seconds</span>
            </div>

            <button
              onClick={handleTrim}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
            >
              <Scissors className="w-5 h-5" />
              {loading ? 'Trimming Audio...' : 'Trim & Extract Audio Clip'}
            </button>
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold text-white">Audio Trimmed Successfully!</p>
                <p className="text-xs text-emerald-400/80">Duration: {endSec - startSec}s | Studio Master Quality</p>
              </div>
            </div>

            <audio controls src={resultUrl} className="w-full rounded-lg" />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (resultBlob) {
                    triggerHaptic('medium');
                    const outName = `trimmed_${file?.name.replace(/\.[^/.]+$/, '') || 'audio'}.wav`;
                    downloadSingleFile(resultBlob, outName);
                  }
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Trimmed Audio (WAV)
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setResultBlob(null);
                  setResultUrl(null);
                }}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Cut Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
