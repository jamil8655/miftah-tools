'use client';

import React, { useState, useRef } from 'react';
import { Music, Upload, Download, CheckCircle, AlertCircle, RefreshCw, FileAudio } from 'lucide-react';
import { extractAudioFromVideo } from '@/lib/media/audio-engine';
import { downloadSingleFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';

export function VideoToMp3Studio() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultBlob(null);
      setResultUrl(null);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await extractAudioFromVideo(file, 'wav', (pct, status) => {
        setProgress(pct);
        setStatusText(status);
      });
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to extract audio track.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Video to Audio (MP3 / WAV) Extractor</h2>
            <p className="text-sm text-slate-400">Extract high-fidelity audio track from any video file in seconds (up to 500 MB).</p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-pink-500/50 bg-slate-950/50 hover:bg-slate-900/50 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-white mb-1">Click or drag & drop video file</p>
            <p className="text-xs text-slate-400">MP4, WebM, MOV, MKV, AVI supported (Max 500 MB)</p>
          </div>
        )}

        {/* Selected File Card */}
        {file && !resultUrl && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Change
              </button>
            </div>

            {loading && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{statusText || 'Extracting audio track...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {!loading && (
              <button
                onClick={handleConvert}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
              >
                <Music className="w-5 h-5" />
                Extract Audio Track
              </button>
            )}
          </div>
        )}

        {/* Result Card */}
        {resultUrl && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold text-white">Audio Extracted Successfully!</p>
                <p className="text-xs text-emerald-400/80">
                  Output Size: {((resultBlob?.size || 0) / (1024 * 1024)).toFixed(2)} MB (Uncompressed Studio Master)
                </p>
              </div>
            </div>

            <audio controls src={resultUrl} className="w-full rounded-lg" />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (resultBlob) {
                    triggerHaptic('medium');
                    const outName = `${file?.name.replace(/\.[^/.]+$/, '') || 'audio'}_audio.wav`;
                    downloadSingleFile(resultBlob, outName);
                  }
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Studio Audio (WAV)
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
                Convert Another
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
