'use client';

import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Sparkles, BookOpen, Bold, Italic, List, Code, Heading } from 'lucide-react';
import { marked } from 'marked';
import { markdownToPdf } from '@/lib/pdf/pdf-manipulator';

export function MarkdownLiveStudio() {
  const [markdown, setMarkdown] = useState<string>(`# Project Documentation & Notes

Welcome to **Miftah Tools Live Markdown Studio**! Write clean documentation with live real-time preview and export to PDF instantly.

## ✨ Features
- **Real-Time Live Rendering** side-by-side
- Full **GitHub Flavored Markdown** support (Tables, Code blocks, Lists)
- **1-Click High-Fidelity PDF Export**

### Code Example
\`\`\`typescript
const greeting: string = "Hello World with Miftah Tools!";
console.log(greeting);
\`\`\`

> "Simplicity is the soul of efficiency."
`);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pdfBytes = await markdownToPdf(markdown);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertSyntax = (prefix: string, suffix: string = '') => {
    setMarkdown((prev) => prev + `\n${prefix}Text${suffix}`);
  };

  const htmlContent = marked.parse(markdown) as string;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Live Markdown Editor & PDF Exporter</h2>
              <p className="text-xs sm:text-sm text-slate-500">Write, format, preview Markdown in real-time, and download formatted PDF documents.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'Compiling PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => insertSyntax('# ')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900"
            title="Heading 1"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('**', '**')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('*', '*')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('- ')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('```typescript\n', '\n```')}
            className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Markdown Source:</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={18}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
              placeholder="Type your markdown here..."
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Live Rendered Document Preview:</label>
            <div
              className="p-6 rounded-2xl bg-white border border-slate-200 min-h-[360px] max-h-[500px] overflow-y-auto prose prose-slate prose-sm max-w-none shadow-xs"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
