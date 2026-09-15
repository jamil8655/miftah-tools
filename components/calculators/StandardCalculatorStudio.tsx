'use client';

import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Delete, RotateCcw, Copy, Check, History, Trash2, Percent, Plus, Minus, X as Multiply, Divide, Equal, Zap, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

const CALC_LOCALES = {
  en: {
    title: 'Daily Standard & Scientific Calculator',
    subtitle: 'High-precision everyday calculator with calculations history, memory registers (M+, M-, MR), percentage, and scientific mathematical functions.',
    standard: 'Standard',
    scientific: 'Scientific',
    historyTitle: 'Calculation History',
    noHistory: 'No recent calculations yet',
    clearHistory: 'Clear History',
    copied: 'Result Copied!',
    copyResult: 'Copy',
    deg: 'DEG',
    rad: 'RAD',
  },
  ur: {
    title: 'روزمرہ اسٹینڈرڈ اور سائنسی کیلکولیٹر',
    subtitle: 'روزانہ کے عام حساب کتاب کے لیے تیز رفتار کیلکولیٹر، تاریخچہ (History)، میموری (M+, MR)، اور سائنسی فنکشنز کے ساتھ۔',
    standard: 'عام (Standard)',
    scientific: 'سائنسی (Scientific)',
    historyTitle: 'حساب کتاب کی ہسٹری',
    noHistory: 'ابھی کوئی سابقہ حساب نہیں ہے',
    clearHistory: 'ہسٹری صاف کریں',
    copied: 'نتیجہ کاپی ہو گیا!',
    copyResult: 'کاپی کریں',
    deg: 'DEG',
    rad: 'RAD',
  },
  ar: {
    title: 'الحاسبة اليومية والعلمية المتقدمة',
    subtitle: 'حاسبة دقيقة للحسابات اليومية والعلمية مع سجل العمليات، وأزرار الذاكرة (M+, MR)، والنسب المئوية.',
    standard: 'قياسي',
    scientific: 'علمي',
    historyTitle: 'سجل الحسابات',
    noHistory: 'لا توجد عمليات سابقة حتى الآن',
    clearHistory: 'مسح السجل',
    copied: 'تم نسخ النتيجة!',
    copyResult: 'نسخ',
    deg: 'درجات',
    rad: 'راديان',
  },
  hi: {
    title: 'दैनिक मानक और वैज्ञानिक कैलकुलेटर',
    subtitle: 'दैनिक उपयोग के लिए सरल और शक्तिशाली कैलकुलेटर: गणना इतिहास, मेमोरी (M+, MR), प्रतिशत, और वैज्ञानिक गणितीय सूत्र।',
    standard: 'मानक (Standard)',
    scientific: 'वैज्ञानिक (Scientific)',
    historyTitle: 'गणना इतिहास (History)',
    noHistory: 'अभी कोई इतिहास नहीं है',
    clearHistory: 'इतिहास साफ़ करें',
    copied: 'परिणाम कॉपी किया गया!',
    copyResult: 'कॉपी करें',
    deg: 'DEG',
    rad: 'RAD',
  },
};

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  time: string;
}

export function StandardCalculatorStudio() {
  const { language } = useI18n();
  const loc = CALC_LOCALES[language as keyof typeof CALC_LOCALES] || CALC_LOCALES.en;

  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [memory, setMemory] = useState<number>(0);
  const [isScientific, setIsScientific] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [copied, setCopied] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_calc_history');
      if (saved) setHistory(JSON.parse(saved));
      const savedMem = localStorage.getItem('nexora_calc_mem');
      if (savedMem) setMemory(parseFloat(savedMem) || 0);
    } catch (e) {
      // ignore
    }
  }, []);

  const saveHistoryToStorage = (newHist: HistoryItem[]) => {
    setHistory(newHist);
    try {
      localStorage.setItem('nexora_calc_history', JSON.stringify(newHist));
    } catch (e) {}
  };

  const handleDigit = (digit: string) => {
    triggerHaptic('selection');
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      setDisplay((prev) => prev + digit);
    }
  };

  const handleDot = () => {
    triggerHaptic('selection');
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const handleOperator = (op: string) => {
    triggerHaptic('light');
    if (display === 'Error') return;
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    triggerHaptic('medium');
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    triggerHaptic('light');
    if (display === 'Error' || display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handlePlusMinus = () => {
    triggerHaptic('light');
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercentage = () => {
    triggerHaptic('light');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      const res = (val / 100).toString();
      setDisplay(res);
    }
  };

  // Safe evaluation
  const handleEquals = () => {
    triggerHaptic('success');
    if (!equation && display) return;
    const fullExpr = `${equation}${display}`;
    try {
      // Replace arithmetic visual symbols with JS operators
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      // Safe JS math calculation
      const computed = Function(`'use strict'; return (${sanitized})`)();
      const formattedRes = Number.isInteger(computed)
        ? computed.toString()
        : parseFloat(computed.toFixed(8)).toString();

      const newHistItem: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        expression: fullExpr,
        result: formattedRes,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [newHistItem, ...history.slice(0, 49)];
      saveHistoryToStorage(updatedHistory);

      setDisplay(formattedRes);
      setEquation('');
    } catch (err) {
      setDisplay('Error');
      triggerHaptic('error');
    }
  };

  // Scientific functions
  const handleScientificFunc = (func: string) => {
    triggerHaptic('light');
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    const rad = angleMode === 'deg' ? (val * Math.PI) / 180 : val;

    switch (func) {
      case 'sin':
        res = Math.sin(rad);
        break;
      case 'cos':
        res = Math.cos(rad);
        break;
      case 'tan':
        res = Math.tan(rad);
        break;
      case 'sqrt':
        res = Math.sqrt(val);
        break;
      case 'sq':
        res = Math.pow(val, 2);
        break;
      case 'cube':
        res = Math.pow(val, 3);
        break;
      case 'log':
        res = Math.log10(val);
        break;
      case 'ln':
        res = Math.log(val);
        break;
      case '1/x':
        res = val !== 0 ? 1 / val : 0;
        break;
      case 'pi':
        res = Math.PI;
        break;
      case 'e':
        res = Math.E;
        break;
      case 'fact':
        let f = 1;
        for (let i = 1; i <= Math.min(170, Math.floor(val)); i++) f *= i;
        res = f;
        break;
      default:
        return;
    }

    const formatted = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();
    setDisplay(formatted);
  };

  // Memory Registers
  const handleMemory = (action: 'mc' | 'mr' | 'm+' | 'm-') => {
    triggerHaptic('light');
    const current = parseFloat(display) || 0;
    if (action === 'mc') {
      setMemory(0);
      try {
        localStorage.removeItem('nexora_calc_mem');
      } catch (e) {}
    } else if (action === 'mr') {
      setDisplay(memory.toString());
    } else if (action === 'm+') {
      const newMem = memory + current;
      setMemory(newMem);
      try {
        localStorage.setItem('nexora_calc_mem', newMem.toString());
      } catch (e) {}
    } else if (action === 'm-') {
      const newMem = memory - current;
      setMemory(newMem);
      try {
        localStorage.setItem('nexora_calc_mem', newMem.toString());
      } catch (e) {}
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Mode Switcher & History Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setIsScientific(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isScientific
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {loc.standard}
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setIsScientific(true);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isScientific
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {loc.scientific}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isScientific && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'));
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {angleMode.toUpperCase()}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showHistoryModal
                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-5">
        {/* Display Screen */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right space-y-1 relative group">
          <div className="h-6 text-xs text-slate-400 font-mono tracking-wider overflow-x-auto whitespace-nowrap">
            {equation || (memory !== 0 ? `M = ${memory}` : '')}
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white overflow-x-auto whitespace-nowrap py-1">
            {display}
          </div>

          <button
            type="button"
            onClick={copyResult}
            className="absolute top-3 left-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-opacity text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{loc.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{loc.copyResult}</span>
              </>
            )}
          </button>
        </div>

        {/* Memory Bar */}
        <div className="grid grid-cols-4 gap-2 text-xs font-bold font-mono">
          <button
            type="button"
            onClick={() => handleMemory('mc')}
            className="py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            MC
          </button>
          <button
            type="button"
            onClick={() => handleMemory('mr')}
            className={`py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors ${
              memory !== 0 ? 'text-brand-400 font-black' : 'text-slate-400'
            }`}
          >
            MR
          </button>
          <button
            type="button"
            onClick={() => handleMemory('m+')}
            className="py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            M+
          </button>
          <button
            type="button"
            onClick={() => handleMemory('m-')}
            className="py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            M-
          </button>
        </div>

        {/* Scientific Expanded Row */}
        {isScientific && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs font-bold font-mono">
            {['sin', 'cos', 'tan', 'sqrt', 'sq', 'cube', 'log', 'ln', '1/x', 'fact', 'pi', 'e'].map((fn) => (
              <button
                key={fn}
                type="button"
                onClick={() => handleScientificFunc(fn)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-all active:scale-95"
              >
                {fn === 'sq' ? 'x²' : fn === 'cube' ? 'x³' : fn === 'sqrt' ? '√' : fn === 'fact' ? 'x!' : fn === 'pi' ? 'π' : fn}
              </button>
            ))}
          </div>
        )}

        {/* Primary Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-lg font-bold font-mono">
          {/* Row 1 */}
          <button
            type="button"
            onClick={handleClear}
            className="py-4 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-extrabold transition-all active:scale-95"
          >
            C
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handlePercentage}
            className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className="py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all active:scale-95"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => handleDigit('7')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleDigit('8')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleDigit('9')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className="py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all active:scale-95"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => handleDigit('4')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleDigit('5')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleDigit('6')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperator('−')}
            className="py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all active:scale-95"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={() => handleDigit('1')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleDigit('2')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleDigit('3')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className="py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all active:scale-95"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={handlePlusMinus}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-bold transition-all active:scale-95"
          >
            ±
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDot}
            className="py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            =
          </button>
        </div>
      </div>

      {/* Calculation History Drawer / Card */}
      {showHistoryModal && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>{loc.historyTitle}</span>
            </h4>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => saveHistoryToStorage([])}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{loc.clearHistory}</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">{loc.noHistory}</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    setDisplay(item.result);
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">{item.expression} =</span>
                    <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                      {item.result}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
