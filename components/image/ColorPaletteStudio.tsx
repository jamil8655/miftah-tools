'use client';

import React, { useState, useRef } from 'react';
import { Palette, Upload, Copy, Check, Zap, RefreshCw, Layers } from 'lucide-react';
import { extractColorPalette } from '@/lib/image/image-tools';

export function ColorPaletteStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<{ hex: string; rgb: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setLoading(true);

      try {
        const colors = await extractColorPalette(f);
        setPalette(colors);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const exportCssVariables = () => {
    const css = palette.map((c, i) => `  --color-brand-${i + 1}: ${c.hex}; /* ${c.rgb} */`).join('\n');
    copyToClipboard(`:root {\n${css}\n}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Image Color Palette Extractor</h2>
            <p className="text-xs sm:text-sm text-slate-500">Extract dominant colors, HEX & RGB codes, and CSS palettes from any picture or logo.</p>
          </div>
        </div>

        {/* Dropzone */}
        {!previewUrl && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-pink-500 bg-slate-50/60 hover:bg-pink-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 group-hover:scale-110 flex items-center justify-center mx-auto mb-4 transition-transform shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Click or drag & drop image or logo</p>
            <p className="text-xs text-slate-500">PNG, JPG, WebP, SVG supported (Up to 150 MB)</p>
          </div>
        )}

        {/* Loaded Image & Extracted Colors */}
        {previewUrl && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={previewUrl}
                alt="Source preview"
                className="w-36 h-36 object-contain rounded-xl bg-white border border-slate-200 shadow-sm shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{file?.name}</p>
                <p className="text-xs text-slate-500">Extracted {palette.length} primary & accent color shades</p>
                <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={exportCssVariables}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-pink-400" />
                    <span>Copy as CSS Variables</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setPalette([]);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Another</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {palette.map((color, idx) => (
                <div
                  key={color.hex + idx}
                  onClick={() => copyToClipboard(color.hex)}
                  className="group p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2.5"
                >
                  <div
                    className="w-full h-20 rounded-xl shadow-inner border border-black/5 group-hover:scale-[1.03] transition-transform relative flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-bold backdrop-blur-md transition-opacity">
                      {copiedHex === color.hex ? 'Copied!' : 'Click to Copy'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-slate-900">{color.hex}</span>
                      {copiedHex === color.hex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">{color.rgb}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
