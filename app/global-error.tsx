'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-2xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">عارضی خرابی (Application Error)</h2>
            <p className="text-xs text-slate-400">
              سسٹم میں ایک عارضی مسئلہ پیدا ہوا ہے۔ برائے مہربانی ریفریش کریں۔
            </p>
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
          >
            دوبارہ کوشش کریں (Retry)
          </button>
        </div>
      </body>
    </html>
  );
}
