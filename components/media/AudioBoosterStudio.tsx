'use client';

import React, { useState, useRef } from 'react';
import { Volume2, Upload, Download, CheckCircle, AlertCircle, RefreshCw, FileAudio, Zap, VolumeX } from 'lucide-react';
import { boostAudioVolume } from '@/lib/media/audio-engine';
import { downloadSingleFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';

export function AudioBoosterStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [gainLevel, setGainLevel] = useState<number>(2.0); // 200% default boost
  const [loading, setLoading] = useState(false);
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

  const handleBoost = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { blob } = await boostAudioVolume(file, gainLevel);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to boost audio volume.');
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { label: '+50% (Mild)', val: 1.5 },
    { label: '+100% (2x Louder)', val: 2.0 },
    { label: '+150% (2.5x)', val: 2.5 },
    { label: '+200% (3x Max Boost)', val: 3.0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Audio Volume Booster</h2>
            <p className="text-xs sm:text-sm text-slate-500">Boost quiet MP3/WAV recordings, voice notes, and music by up to 300% without distortion.</p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Click or drag & drop quiet audio file</p>
            <p className="text-xs text-slate-500">Supports MP3, WAV, M4A, AAC, OGG (Up to 500 MB)</p>
          </div>
        )}

        {/* Selected Audio Controls */}
        {file && !resultUrl && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold"
              >
                Change File
              </button>
            </div>

            {/* Volume Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Volume Gain Preset:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {presets.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setGainLevel(p.val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      gainLevel === p.val
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/25'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gain Slider */}
            <div dir="ltr" className="space-y-2 bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Custom Volume Boost:</span>
                <span className="text-amber-600 font-extrabold">{Math.round(gainLevel * 100)}% ({gainLevel}x Volume)</span>
              </div>
              <input
                type="range"
                dir="ltr"
                min={1.0}
                max={4.0}
                step={0.1}
                value={gainLevel}
                onChange={(e) => setGainLevel(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>100% (Original)</span>
                <span>200% (2x)</span>
                <span>300% (3x)</span>
                <span>400% (Max)</span>
              </div>
            </div>

            <button
              onClick={handleBoost}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {loading ? 'Boosting Volume Level...' : 'Boost Audio Volume Now'}
            </button>
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-extrabold text-slate-900">Audio Volume Boosted Successfully!</p>
                <p className="text-xs text-emerald-700">Amplified by {Math.round(gainLevel * 100)}% • Soft Peak Limiting Enabled</p>
              </div>
            </div>

            <audio controls src={resultUrl} className="w-full rounded-lg" />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (resultBlob) {
                    triggerHaptic('medium');
                    const outName = `boosted_${Math.round(gainLevel * 100)}pct_${file?.name.replace(/\.[^/.]+$/, '') || 'audio'}.wav`;
                    downloadSingleFile(resultBlob, outName);
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Louder Audio (WAV)
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setResultBlob(null);
                  setResultUrl(null);
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
                Boost Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
