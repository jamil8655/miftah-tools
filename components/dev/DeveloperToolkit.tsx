'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Play,
  RotateCcw,
  FileText,
  Terminal,
  Database,
  Globe,
  Settings2,
  Clock,
  Layers,
} from 'lucide-react';

export function DeveloperToolkit() {
  const [activeTab, setActiveTab] = useState<'regex' | 'sql' | 'csv-json' | 'url' | 'cron' | 'http'>('regex');
  const [copied, setCopied] = useState(false);

  // Regex Tester State
  const [regexPattern, setRegexPattern] = useState('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestText, setRegexTestText] = useState('user@example.com\ninvalid-email@\ntest.dev@miftahtools.app');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [regexValid, setRegexValid] = useState<boolean>(true);

  // SQL Formatter State
  const [sqlInput, setSqlInput] = useState('SELECT id, name, email, created_at FROM users WHERE status = \'active\' AND created_at >= \'2026-01-01\' ORDER BY created_at DESC LIMIT 50;');
  const [sqlFormatted, setSqlFormatted] = useState('');

  // CSV <-> JSON State
  const [csvInput, setCsvInput] = useState('name,role,email\nAlex,Engineer,alex@miftahtools.app\nSarah,Designer,sarah@miftahtools.app\nRahm,Architect,jrahm@google.dev');
  const [jsonOutput, setJsonOutput] = useState('');

  // URL Encoder/Decoder State
  const [urlInput, setUrlInput] = useState('https://jamil8655.github.io/nexora-tools/?search=pdf to word&category=all&filter=active');
  const [urlResult, setUrlResult] = useState('');
  const [urlParsedParams, setUrlParsedParams] = useState<{ key: string; value: string }[]>([]);

  // Cron Expression State
  const [cronInput, setCronInput] = useState('*/15 * * * *');
  const [cronExplanation, setCronExplanation] = useState('Runs every 15 minutes, every hour, every day.');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Regex Tester Execution
  const testRegex = () => {
    try {
      const reg = new RegExp(regexPattern, regexFlags);
      const matches = regexTestText.match(reg);
      setRegexMatches(matches ? Array.from(matches) : []);
      setRegexValid(true);
    } catch (e) {
      setRegexValid(false);
      setRegexMatches([]);
    }
  };

  // 2. SQL Formatter Logic
  const formatSQL = () => {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'ORDER BY', 'GROUP BY', 'LIMIT', 'OFFSET', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
    let formatted = sqlInput;
    keywords.forEach((kw) => {
      const reg = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(reg, `\n${kw.toUpperCase()} `);
    });
    setSqlFormatted(formatted.trim());
  };

  // 3. CSV <-> JSON Converter
  const convertCsvToJson = () => {
    try {
      const lines = csvInput.trim().split('\n');
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map((h) => h.trim());
      const result = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || '';
        });
        return obj;
      });
      setJsonOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setJsonOutput('Invalid CSV format');
    }
  };

  // 4. URL Parser & Encoder
  const handleUrlEncode = (encode: boolean) => {
    try {
      if (encode) {
        setUrlResult(encodeURIComponent(urlInput));
      } else {
        setUrlResult(decodeURIComponent(urlInput));
      }
      const urlObj = new URL(urlInput);
      const params: { key: string; value: string }[] = [];
      urlObj.searchParams.forEach((value, key) => params.push({ key, value }));
      setUrlParsedParams(params);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 shadow-xs">
          <Terminal className="w-3.5 h-3.5 text-brand-600" />
          <span>Developer Toolkit Pro • 100% In-Browser Code & Syntax Utilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Developer Utilities & Code Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Test Regular Expressions, format SQL queries, convert CSV to JSON, parse URLs, and inspect Cron schedules with instant local computation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
        {[
          { id: 'regex', label: 'Regex Tester' },
          { id: 'sql', label: 'SQL Formatter' },
          { id: 'csv-json', label: 'CSV ↔ JSON' },
          { id: 'url', label: 'URL Encoder/Parser' },
          { id: 'cron', label: 'Cron Scheduler' },
          { id: 'http', label: 'HTTP Statuses' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. REGEX TESTER */}
      {activeTab === 'regex' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-600" />
              <span>Regular Expression (RegEx) Tester</span>
            </h3>
            <button
              type="button"
              onClick={testRegex}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Run Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">RegEx Pattern:</label>
              <input
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Flags:</label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Test String:</label>
            <textarea
              rows={4}
              value={regexTestText}
              onChange={(e) => setRegexTestText(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Matches Output */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Matches Found: ({regexMatches.length})</span>
              <span className={`text-[11px] font-bold ${regexValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                {regexValid ? '✓ Valid Pattern' : '⚠ Invalid Pattern Syntax'}
              </span>
            </span>

            <div className="space-y-1">
              {regexMatches.map((m, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-xs border border-emerald-200 dark:border-emerald-800"
                >
                  Match {i + 1}: {m}
                </div>
              ))}
              {regexMatches.length === 0 && (
                <div className="text-xs text-slate-400 font-mono">No matches found. Click &quot;Run Test&quot; above.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SQL FORMATTER */}
      {activeTab === 'sql' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              <span>SQL Query Beautifier & Formatter</span>
            </h3>
            <button
              type="button"
              onClick={formatSQL}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Beautify SQL
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Raw SQL Input:</label>
              <textarea
                rows={8}
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Formatted SQL:</span>
                {sqlFormatted && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sqlFormatted)}
                    className="text-brand-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <textarea
                rows={8}
                readOnly
                value={sqlFormatted || 'Click Beautify SQL to format...'}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CSV <-> JSON CONVERTER */}
      {activeTab === 'csv-json' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>CSV to JSON Object Converter</span>
            </h3>
            <button
              type="button"
              onClick={convertCsvToJson}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Convert to JSON
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">CSV Data:</label>
              <textarea
                rows={8}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>JSON Output:</span>
                {jsonOutput && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(jsonOutput)}
                    className="text-brand-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <textarea
                rows={8}
                readOnly
                value={jsonOutput || 'Click Convert to JSON...'}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. URL ENCODER/PARSER */}
      {activeTab === 'url' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>URL Encoder, Decoder & Query Parser</span>
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleUrlEncode(true)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl"
              >
                Encode URL
              </button>
              <button
                type="button"
                onClick={() => handleUrlEncode(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Decode URL
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">URL Input:</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {urlParsedParams.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Parsed Query Parameters:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {urlParsedParams.map((p, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                    <span className="font-bold text-brand-600">{p.key}:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. CRON EXPRESSION SCHEDULER */}
      {activeTab === 'cron' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in fade-in">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Cron Schedule Expression Explainer</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Cron Expression (minute hour day month weekday):</label>
            <input
              type="text"
              value={cronInput}
              onChange={(e) => setCronInput(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-brand-600 font-bold"
            />
          </div>

          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-200 text-xs font-bold">
            💡 Quick Presets: &quot;0 0 * * *&quot; (Every Midnight), &quot;0 * * * *&quot; (Every Hour), &quot;*/5 * * * *&quot; (Every 5 Mins), &quot;0 9 * * 1-5&quot; (Weekdays at 9 AM).
          </div>
        </div>
      )}

      {/* 6. HTTP STATUS CODES */}
      {activeTab === 'http' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            HTTP Status Codes Quick Reference
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              { code: 200, label: 'OK (Standard Success)' },
              { code: 201, label: 'Created (Resource Created)' },
              { code: 204, label: 'No Content (Empty Success)' },
              { code: 400, label: 'Bad Request (Syntax Error)' },
              { code: 401, label: 'Unauthorized (No Token)' },
              { code: 403, label: 'Forbidden (No Permission)' },
              { code: 404, label: 'Not Found (Missing Resource)' },
              { code: 429, label: 'Too Many Requests (Rate Limited)' },
              { code: 500, label: 'Internal Server Error' },
              { code: 502, label: 'Bad Gateway' },
              { code: 503, label: 'Service Unavailable' },
              { code: 504, label: 'Gateway Timeout' },
            ].map((st) => (
              <div
                key={st.code}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <span className="font-mono font-black text-brand-600">{st.code}</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
