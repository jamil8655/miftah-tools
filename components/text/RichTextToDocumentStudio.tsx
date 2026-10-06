'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Zap,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Minus,
  Calendar,
  RotateCcw,
  RotateCw,
  Printer,
  Upload,
  Image as ImageIcon,
  FileCode,
  Sparkles,
  ClipboardPaste,
  FileCheck,
  PenTool,
  Info,
  Sliders,
  Type,
  FileImage,
  Indent,
  Outdent,
  RemoveFormatting,
  Layout,
  Settings2,
  Trash2,
  Share2,
  CheckCircle2,
  Search,
  Replace as ReplaceIcon,
  Eye,
  Plus,
  ArrowRight,
  ChevronDown,
  X,
  Maximize2,
  Palette,
  FolderOpen,
  Layers,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  Sparkle,
} from 'lucide-react';
import { marked } from 'marked';
import mammoth from 'mammoth';
import {
  DocumentModel,
  DocumentPageSettings,
  DEFAULT_PAGE_SETTINGS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_SPACING_OPTIONS,
  MARGIN_VALUES,
  PAPER_DIMENSIONS,
  DOCUMENT_TEMPLATES,
  DocumentTemplateItem,
  RecentDocumentMeta,
  PaperSize,
  PageOrientation,
  MarginPreset,
} from '@/lib/documents/document-types';
import {
  exportDocumentToPdf,
  exportDocumentToDocx,
  printDocumentNative,
  getSafeFileName,
} from '@/lib/documents/document-export';
import {
  downloadSingleFile,
  shareDownloadedFile,
  openDownloadedFile,
  SavedFileInfo,
} from '@/lib/utils/download';
import { adManager } from '@/lib/ads/AdManager';
import { useI18n } from '@/lib/i18n/i18n-context';

interface RichTextToDocumentStudioProps {
  defaultFormat?: 'pdf' | 'docx' | 'image';
}

const LOCAL_STORAGE_KEY_DRAFT = 'miftah_document_studio_draft_v4';
const LOCAL_STORAGE_KEY_RECENTS = 'miftah_document_studio_recents_v4';

const SPECIAL_SYMBOLS = [
  '•', '‣', '⁃', '◦', '★', '✓', '✗', '—', '–', '©', '®', '™',
  '₹', '₨', '﷼', '$', '€', '£', '¥', '¢',
  '±', '×', '÷', '≠', '≤', '≥', '≈', '√', 'π', '∞', '∑', '½', '¼', '¾',
  '§', '¶', '†', '‡', '•', '°', '‰', '℃', '℉',
];

export function RichTextToDocumentStudio({ defaultFormat = 'pdf' }: RichTextToDocumentStudioProps) {
  const { language, isRtl: appIsRtl } = useI18n();

  // Primary Document Model State
  const [docId, setDocId] = useState<string>('doc_' + Date.now());
  const [docTitle, setDocTitle] = useState<string>('Untitled Document');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].family);
  const [fontSize, setFontSize] = useState<string>('16px');
  const [lineSpacing, setLineSpacing] = useState<string>(FONT_OPTIONS[0].defaultLineHeight || '1.5');
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [settings, setSettings] = useState<DocumentPageSettings>(DEFAULT_PAGE_SETTINGS);

  // Editor DOM & Tooling Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Stats & Progress States
  const [stats, setStats] = useState({ words: 0, chars: 0, paragraphs: 0, pages: 1 });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'restored'>('saved');
  const [copied, setCopied] = useState(false);

  // Active Modals & Bottom Drawers
  const [activeModal, setActiveModal] = useState<
    'none' | 'settings' | 'insert' | 'templates' | 'recents' | 'findReplace' | 'link' | 'table' | 'symbols' | 'preview' | 'exportResult'
  >('none');

  // Export / Progress State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ percent: 0, status: '' });
  const [exportResultInfo, setExportResultInfo] = useState<{
    fileInfo: SavedFileInfo | null;
    format: 'pdf' | 'docx';
    title: string;
  } | null>(null);

  // Find and Replace State
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [findCount, setFindCount] = useState<number | null>(null);

  // Table Insert Config
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Link Insert Config
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');

  // Quick Paste Drawer
  const [quickPasteOpen, setQuickPasteOpen] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');

  // 1. Initial Load & Recovery from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as DocumentModel;
        if (parsed.contentHtml && editorRef.current) {
          editorRef.current.innerHTML = parsed.contentHtml;
          setDocId(parsed.id || 'doc_' + Date.now());
          setDocTitle(parsed.title || 'Untitled Document');
          setIsRTL(parsed.isRTL ?? (language === 'ur' || language === 'ar'));
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
          if (parsed.fontSize) setFontSize(parsed.fontSize);
          if (parsed.lineSpacing) setLineSpacing(parsed.lineSpacing);
          if (parsed.settings) setSettings(parsed.settings);
          setSaveStatus('restored');
          recalculateStats();
          return;
        }
      }
    } catch (e) {
      console.warn('Draft restore notice:', e);
    }

    // Default template load if empty
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      const defaultTmpl = language === 'ur'
        ? DOCUMENT_TEMPLATES.find((t) => t.id === 'urdu_formal') || DOCUMENT_TEMPLATES[0]
        : language === 'ar'
        ? DOCUMENT_TEMPLATES.find((t) => t.id === 'arabic_formal') || DOCUMENT_TEMPLATES[0]
        : language === 'hi'
        ? DOCUMENT_TEMPLATES.find((t) => t.id === 'hindi_application') || DOCUMENT_TEMPLATES[0]
        : DOCUMENT_TEMPLATES[0];

      editorRef.current.innerHTML = defaultTmpl.content;
      setDocTitle(defaultTmpl.name.split(' (')[0]);
      setIsRTL(defaultTmpl.isRTL);
      setFontFamily(defaultTmpl.fontFamily);
      if (defaultTmpl.defaultLineHeight) {
        setLineSpacing(defaultTmpl.defaultLineHeight);
      }
      recalculateStats();
    }
  }, [language]);

  // 2. Selection Helper
  const saveCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSavedSelection = () => {
    if (typeof window === 'undefined' || !savedSelectionRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // 3. Stats & Live Page Calculation
  const recalculateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const paragraphs = editorRef.current.querySelectorAll('p, h1, h2, h3, li, blockquote, table').length || 1;

    const pageBreaks = editorRef.current.querySelectorAll('.page-break').length;
    const contentHeight = editorRef.current.scrollHeight;
    const autoPages = Math.max(1, Math.ceil(contentHeight / 950));
    const estimatedPages = Math.max(pageBreaks + 1, autoPages, Math.ceil(words / 450));

    setStats({ words, chars, paragraphs, pages: estimatedPages });
  }, []);

  // 4. Auto-Save Mechanism
  const persistDraftToStorage = useCallback(() => {
    if (!editorRef.current || typeof window === 'undefined') return;

    setSaveStatus('saving');
    const model: DocumentModel = {
      id: docId,
      title: docTitle,
      contentHtml: editorRef.current.innerHTML,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isRTL,
      fontFamily,
      fontSize,
      lineSpacing,
      settings,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(model));

      // Update Recents List
      const recentsRaw = localStorage.getItem(LOCAL_STORAGE_KEY_RECENTS);
      let recentsList: RecentDocumentMeta[] = recentsRaw ? JSON.parse(recentsRaw) : [];

      const currentSnippet = editorRef.current.innerText?.slice(0, 100) || '';
      const existingIdx = recentsList.findIndex((r) => r.id === docId);

      const metaItem: RecentDocumentMeta = {
        id: docId,
        title: docTitle || 'Untitled Document',
        updatedAt: Date.now(),
        wordCount: stats.words,
        charCount: stats.chars,
        pageCount: stats.pages,
        previewSnippet: currentSnippet,
        isRTL,
      };

      if (existingIdx >= 0) {
        recentsList[existingIdx] = metaItem;
      } else {
        recentsList.unshift(metaItem);
        recentsList = recentsList.slice(0, 20);
      }

      localStorage.setItem(LOCAL_STORAGE_KEY_RECENTS, JSON.stringify(recentsList));
      setTimeout(() => setSaveStatus('saved'), 400);
    } catch (e) {
      console.warn('Auto-save error:', e);
      setSaveStatus('saved');
    }
  }, [docId, docTitle, isRTL, fontFamily, fontSize, lineSpacing, settings, stats]);

  useEffect(() => {
    const timer = setInterval(() => {
      persistDraftToStorage();
    }, 3000);
    return () => clearInterval(timer);
  }, [persistDraftToStorage]);

  // 5. Rich Text Command Executor
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (typeof document !== 'undefined') {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      recalculateStats();
      persistDraftToStorage();
    }
  };

  // 6. Font Family Change with Optimal Line-Height & RTL auto-tuning
  const handleFontChange = (selectedFamily: string) => {
    setFontFamily(selectedFamily);
    const fontObj = FONT_OPTIONS.find((f) => f.family === selectedFamily);
    if (fontObj) {
      if (fontObj.defaultLineHeight) {
        setLineSpacing(fontObj.defaultLineHeight);
      }
      if (fontObj.isRTL !== undefined) {
        setIsRTL(fontObj.isRTL);
      }
    }
    recalculateStats();
    persistDraftToStorage();
  };

  // 7. Font Size Change Helper
  const handleFontSizeDelta = (delta: number) => {
    const currentPt = parseInt(fontSize) || 16;
    const newPt = Math.max(8, Math.min(72, currentPt + delta));
    setFontSize(`${newPt}px`);
  };

  // 8. Insert Custom Elements
  const insertPageBreak = () => {
    const html = `<div class="page-break" style="page-break-after: always; break-after: page; height: 16px; margin: 24px 0; border-bottom: 2px dashed #94a3b8; text-align: center; color: #94a3b8; font-size: 10px; user-select: none;" contenteditable="false">--- Page Break ---</div><p><br/></p>`;
    execCmd('insertHTML', html);
    setActiveModal('none');
  };

  const insertHorizontalRule = () => {
    execCmd('insertHorizontalRule');
    setActiveModal('none');
  };

  const insertDate = () => {
    const dateText = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    execCmd('insertText', dateText);
    setActiveModal('none');
  };

  const insertTableElement = () => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin: 16px 0;"><thead><tr style="background-color: #f8fafc;">`;
    for (let c = 1; c <= tableCols; c++) {
      tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 10px; text-align: ${isRTL ? 'right' : 'left'}; font-weight: bold;">Header ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: ${isRTL ? 'right' : 'left'};">Row ${r}, Col ${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;

    execCmd('insertHTML', tableHtml);
    setActiveModal('none');
  };

  const insertLinkElement = () => {
    if (!linkUrl.trim()) return;
    const html = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">${linkText.trim() || linkUrl.trim()}</a>`;
    execCmd('insertHTML', html);
    setLinkText('');
    setLinkUrl('https://');
    setActiveModal('none');
  };

  const insertCalloutBox = (type: 'info' | 'warning' | 'success') => {
    const config = {
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '📌', title: 'Note' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️', title: 'Important' },
      success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: '✓', title: 'Key Takeaway' },
    }[type];

    const html = `
      <div style="background-color: ${config.bg}; border-left: 4px solid ${config.border}; padding: 12px 16px; margin: 16px 0; border-radius: 8px;">
        <p style="margin: 0; color: ${config.text}; font-weight: bold;">${config.icon} ${config.title}:</p>
        <p style="margin: 4px 0 0 0; color: ${config.text};">Write your important announcement or note here.</p>
      </div><p><br/></p>
    `;
    execCmd('insertHTML', html);
    setActiveModal('none');
  };

  const insertSignatureBlock = () => {
    const html = `
      <div style="display: flex; justify-content: space-between; margin-top: 48px; padding-top: 12px; page-break-inside: avoid;">
        <div style="text-align: ${isRTL ? 'right' : 'left'}; width: 220px; border-top: 1px solid #334155; padding-top: 6px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Authorized Signature</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Managing Authority</p>
        </div>
        <div style="text-align: ${isRTL ? 'left' : 'right'}; width: 180px; border-top: 1px solid #334155; padding-top: 6px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Date &amp; Seal</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">${new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div><p><br/></p>
    `;
    execCmd('insertHTML', html);
    setActiveModal('none');
  };

  const insertSymbol = (sym: string) => {
    execCmd('insertText', sym);
    setActiveModal('none');
  };

  // 9. Image Handling
  const handleImageFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const src = loadEvt.target?.result as string;
      if (src) {
        const imgHtml = `
          <div style="text-align: center; margin: 16px 0;">
            <img src="${src}" alt="Inserted Image" style="max-width: 100%; width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
          </div><p><br/></p>
        `;
        execCmd('insertHTML', imgHtml);
      }
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setActiveModal('none');
  };

  // 10. Document Import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    try {
      const name = file.name.toLowerCase();
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));

      if (name.endsWith('.docx') || name.endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editorRef.current.innerHTML = result.value || '<p>Empty Document</p>';
      } else if (name.endsWith('.md') || name.endsWith('.markdown')) {
        const text = await file.text();
        editorRef.current.innerHTML = (await marked.parse(text)) as string;
      } else if (name.endsWith('.html') || name.endsWith('.htm')) {
        const text = await file.text();
        editorRef.current.innerHTML = text;
      } else {
        const text = await file.text();
        const paras = text.split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
        editorRef.current.innerHTML = paras || '<p>Empty Document</p>';
      }
      recalculateStats();
      persistDraftToStorage();
    } catch (err) {
      console.error('File import error:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 11. Templates Selector Handler
  const handleApplyTemplate = (tmpl: DocumentTemplateItem) => {
    if (!editorRef.current) return;
    if (confirm(`Load template "${tmpl.name}"? Current content will be replaced with the template layout.`)) {
      setDocId('doc_' + Date.now());
      setDocTitle(tmpl.name.split(' (')[0]);
      setIsRTL(tmpl.isRTL);
      setFontFamily(tmpl.fontFamily);
      if (tmpl.defaultLineHeight) {
        setLineSpacing(tmpl.defaultLineHeight);
      }
      editorRef.current.innerHTML = tmpl.content;
      recalculateStats();
      persistDraftToStorage();
      setActiveModal('none');
    }
  };

  // 12. Create New Document
  const handleCreateNewDoc = () => {
    if (confirm('Create a new blank document? Your current draft is already saved.')) {
      setDocId('doc_' + Date.now());
      setDocTitle('Untitled Document');
      if (editorRef.current) {
        editorRef.current.innerHTML = '<h1>Untitled Document</h1><p>Start writing...</p>';
      }
      recalculateStats();
      persistDraftToStorage();
      setActiveModal('none');
    }
  };

  // 13. Find & Replace Handler
  const handleFindNext = () => {
    if (!findQuery.trim() || typeof window === 'undefined') return;
    const win = window as any;
    if (win.find) {
      const found = win.find(findQuery, false, false, true, false, false, false);
      setFindCount(found ? 1 : 0);
    }
  };

  const handleReplace = () => {
    if (!findQuery.trim() || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const regex = new RegExp(escapeRegex(findQuery), 'i');
    if (regex.test(currentHtml)) {
      editorRef.current.innerHTML = currentHtml.replace(regex, replaceQuery);
      recalculateStats();
      persistDraftToStorage();
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery.trim() || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const regex = new RegExp(escapeRegex(findQuery), 'gi');
    const matches = currentHtml.match(regex);
    if (matches && matches.length > 0) {
      editorRef.current.innerHTML = currentHtml.replace(regex, replaceQuery);
      setFindCount(matches.length);
      recalculateStats();
      persistDraftToStorage();
    }
  };

  function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 14. PDF Export Pipeline
  const handleExportPDF = async () => {
    if (!editorRef.current) return;
    setIsExporting(true);
    setExportProgress({ percent: 10, status: 'Starting PDF export...' });

    try {
      const docModel: DocumentModel = {
        id: docId,
        title: docTitle,
        contentHtml: editorRef.current.innerHTML,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isRTL,
        fontFamily,
        fontSize,
        lineSpacing,
        settings,
      };

      const pdfBlob = await exportDocumentToPdf(docModel, (pct, msg) => {
        setExportProgress({ percent: pct, status: msg });
      });

      const fileName = getSafeFileName(docTitle, 'pdf');

      await adManager.showInterstitialOnDownload(async () => {
        const saved = await downloadSingleFile(pdfBlob, fileName);
        setExportResultInfo({
          fileInfo: saved,
          format: 'pdf',
          title: fileName,
        });
        setActiveModal('exportResult');
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('PDF export failed. Your document is still safely preserved.');
    } finally {
      setIsExporting(false);
    }
  };

  // 15. Word (.docx) Export Pipeline
  const handleExportWord = async () => {
    if (!editorRef.current) return;
    setIsExporting(true);
    setExportProgress({ percent: 10, status: 'Creating Word document...' });

    try {
      const docModel: DocumentModel = {
        id: docId,
        title: docTitle,
        contentHtml: editorRef.current.innerHTML,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isRTL,
        fontFamily,
        fontSize,
        lineSpacing,
        settings,
      };

      const docxBlob = await exportDocumentToDocx(docModel, (pct, msg) => {
        setExportProgress({ percent: pct, status: msg });
      });

      const fileName = getSafeFileName(docTitle, 'docx');

      await adManager.showInterstitialOnDownload(async () => {
        const saved = await downloadSingleFile(docxBlob, fileName);
        setExportResultInfo({
          fileInfo: saved,
          format: 'docx',
          title: fileName,
        });
        setActiveModal('exportResult');
      });
    } catch (err) {
      console.error('Word Export Error:', err);
      alert('Word export failed. Your document is still safely preserved.');
    } finally {
      setIsExporting(false);
    }
  };

  // 16. Native System Print
  const handlePrint = () => {
    if (!editorRef.current) return;
    const docModel: DocumentModel = {
      id: docId,
      title: docTitle,
      contentHtml: editorRef.current.innerHTML,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isRTL,
      fontFamily,
      fontSize,
      lineSpacing,
      settings,
    };
    printDocumentNative(docModel);
  };

  // Paper Dimension CSS Calculation
  const paperDim = PAPER_DIMENSIONS[settings.paperSize] || PAPER_DIMENSIONS.a4;
  const currentDim = settings.orientation === 'landscape' ? paperDim.landscape : paperDim.portrait;
  const marginCss = MARGIN_VALUES[settings.marginPreset].css;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 pb-16">
      {/* 1. MOBILE-FIRST TOP HEADER: Title, Auto-Save Status, Main Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-md shadow-slate-100 dark:shadow-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Title Input & Save Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title..."
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 focus:border-brand-500 focus:outline-hidden px-1 py-0.5 w-full max-w-sm transition-colors"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-bold text-brand-600 dark:text-brand-400">Word/Docs Studio</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" />
                {saveStatus === 'saving' ? 'Saving draft...' : saveStatus === 'restored' ? 'Draft restored' : 'Saved'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions: Templates, Page Setup, Print, Preview, Export */}
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {/* Templates Gallery */}
          <button
            type="button"
            onClick={() => setActiveModal('templates')}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Choose from starter document templates"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Templates</span>
          </button>

          {/* Page Setup Settings */}
          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center transition-all shadow-xs cursor-pointer active:scale-95"
            title="Page Size, Margins, Headers & Footers"
          >
            <Layout className="w-4 h-4" />
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center transition-all shadow-xs cursor-pointer active:scale-95"
            title="Print or Save as Native Vector PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Preview Mode */}
          <button
            type="button"
            onClick={() => setActiveModal('preview')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Preview Multi-Page Print Layout"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview</span>
          </button>

          {/* Export Word (.docx) */}
          <button
            type="button"
            onClick={handleExportWord}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export as Microsoft Word (.docx)"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Word (.docx)</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-brand-600/25 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export print-ready PDF document"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 2. HORIZONTALLY SCROLLABLE FORMATTING TOOLBAR WITH ORGANIZED FONTS */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1.5 sm:p-2 shadow-md shadow-slate-200/40 dark:shadow-none flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Categorized Font Selector */}
          <select
            value={fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            className="p-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden text-slate-800 dark:text-slate-200 max-w-[150px] sm:max-w-[200px]"
            title="Font Family & Typography"
          >
            <optgroup label="Urdu (اردو)">
              {FONT_OPTIONS.filter((f) => f.category === 'urdu').map((f) => (
                <option key={f.id} value={f.family}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Arabic (العربية)">
              {FONT_OPTIONS.filter((f) => f.category === 'arabic').map((f) => (
                <option key={f.id} value={f.family}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Hindi (हिन्दी)">
              {FONT_OPTIONS.filter((f) => f.category === 'hindi').map((f) => (
                <option key={f.id} value={f.family}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="English & Standard">
              {FONT_OPTIONS.filter((f) => f.category === 'english').map((f) => (
                <option key={f.id} value={f.family}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Font Size Selector + Step Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleFontSizeDelta(-1)}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              title="Decrease Font Size"
            >
              A-
            </button>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="p-1 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-0 focus:outline-hidden"
            >
              {FONT_SIZE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleFontSizeDelta(1)}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h1>')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs cursor-pointer"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h2>')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h3>')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<p>')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            title="Body Paragraph"
          >
            Body
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer active:scale-95"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer active:scale-95"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer active:scale-95"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer active:scale-95"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Text ForeColor */}
          <label className="relative flex items-center gap-1 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Text Color">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 underline decoration-brand-600 decoration-2">A</span>
            <input
              type="color"
              defaultValue="#0f172a"
              onChange={(e) => execCmd('foreColor', e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent opacity-0 absolute inset-0"
            />
          </label>

          {/* Highlight Marker */}
          <label className="relative flex items-center gap-1 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Highlight Color">
            <Palette className="w-4 h-4 text-amber-500" />
            <input
              type="color"
              defaultValue="#fef08a"
              onChange={(e) => execCmd('hiliteColor', e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent opacity-0 absolute inset-0"
            />
          </label>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Justify Text"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          {/* Line Spacing Selector */}
          <select
            value={lineSpacing}
            onChange={(e) => setLineSpacing(e.target.value)}
            className="p-1 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden text-slate-800 dark:text-slate-200"
            title="Line Spacing (فاصل الأسطر / فاصلہ)"
          >
            {LINE_SPACING_OPTIONS.map((ls) => (
              <option key={ls.value} value={ls.value}>
                {ls.label}
              </option>
            ))}
          </select>

          {/* RTL / LTR Direction Toggle */}
          <button
            type="button"
            onClick={() => setIsRTL((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRTL
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            title="Toggle Right-to-Left or Left-to-Right"
          >
            <span>{isRTL ? 'RTL (دائیں سے بائیں)' : 'LTR (Left to Right)'}</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('indent')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Indent"
          >
            <Indent className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('outdent')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Outdent"
          >
            <Outdent className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Master Insert Button (Opens Menu) */}
          <button
            type="button"
            onClick={() => setActiveModal('insert')}
            className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold text-xs border border-brand-200 dark:border-brand-800 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert</span>
          </button>

          {/* Find and Replace */}
          <button
            type="button"
            onClick={() => setActiveModal('findReplace')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Find & Replace Text"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: File Upload & Clear */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".txt,.md,.markdown,.docx,.doc,.rtf,.html,.log"
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageFilePicked}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Open / Import .txt, .docx, .md file"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCreateNewDoc}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 cursor-pointer"
            title="New / Clear Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. FIND AND REPLACE INLINE DRAWER */}
      {activeModal === 'findReplace' && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find text..."
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFindNext()}
                className="bg-transparent focus:outline-hidden text-slate-900 dark:text-white text-xs w-28 sm:w-36"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <ReplaceIcon className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="bg-transparent focus:outline-hidden text-slate-900 dark:text-white text-xs w-28 sm:w-36"
              />
            </div>

            <button
              type="button"
              onClick={handleFindNext}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Find Next
            </button>
            <button
              type="button"
              onClick={handleReplace}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white cursor-pointer"
            >
              Replace All
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. REALISTIC MULTI-PAGE DOCUMENT VIEW CONTAINER */}
      <div className="p-2 sm:p-8 bg-slate-200/70 dark:bg-slate-950/70 rounded-3xl border border-slate-300/80 dark:border-slate-800 flex flex-col items-center min-h-[750px] overflow-x-auto">
        {/* Top Paper Header Info */}
        <div className="w-full max-w-4xl flex items-center justify-between pb-3 px-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {settings.paperSize.toUpperCase()} {settings.orientation === 'landscape' ? 'Landscape' : 'Portrait'} &bull; ~{stats.pages} Page(s)
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            {stats.words.toLocaleString()} Words &bull; {stats.chars.toLocaleString()} Chars &bull; {stats.paragraphs} Blocks
          </div>
        </div>

        {/* Central White Paper Sheet */}
        <div
          className={`w-full max-w-[840px] transition-all bg-white text-slate-900 ${
            settings.showPageBorders ? 'shadow-2xl shadow-slate-400/60 dark:shadow-2xl dark:shadow-black/70 border border-slate-300/80 rounded-xl' : ''
          }`}
          style={{
            backgroundColor: settings.pageBgColor || '#ffffff',
            minHeight: `${currentDim.heightPx}px`,
            padding: marginCss,
            boxSizing: 'border-box',
          }}
        >
          {/* Document Top Header */}
          {settings.includeHeaderFooter && (
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 text-xs text-slate-400 font-medium select-none"
            >
              <span>{settings.headerText || docTitle || 'Untitled Document'}</span>
              <span>Miftah Tools Document Studio</span>
            </div>
          )}

          {/* Editable WYSIWYG Content Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={recalculateStats}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="min-h-[700px] outline-hidden text-slate-900 prose prose-slate max-w-none focus:outline-hidden"
            style={{
              fontFamily,
              fontSize,
              lineHeight: lineSpacing,
            }}
          />

          {/* Document Page Footer */}
          {settings.includeHeaderFooter && (
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="flex items-center justify-between border-t border-slate-200 pt-3 mt-12 text-[11px] text-slate-400 font-medium select-none"
            >
              <span>{settings.footerText || new Date().toLocaleDateString('en-GB')}</span>
              <span>Page 1 of {stats.pages} &bull; miftahtools.com</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. BOTTOM STATUS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
            <FileText className="w-4 h-4" />
            <span>Page 1 of {stats.pages}</span>
          </span>
          <span>&bull;</span>
          <span><strong>{stats.words.toLocaleString()}</strong> words</span>
          <span>&bull;</span>
          <span><strong>{stats.chars.toLocaleString()}</strong> chars</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Est. Reading: ~{Math.max(1, Math.ceil(stats.words / 200))} min</span>
          <span>&bull;</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready to Export</span>
          </span>
        </div>
      </div>

      {/* MODAL: INSERT MENU */}
      {activeModal === 'insert' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-600" />
                <span>Insert Element</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Image */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <ImageIcon className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Image</div>
                <div className="text-[10px] text-slate-500">From gallery / camera</div>
              </button>

              {/* Table */}
              <button
                type="button"
                onClick={() => setActiveModal('table')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <TableIcon className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Table</div>
                <div className="text-[10px] text-slate-500">Rows &amp; Columns</div>
              </button>

              {/* Hyperlink */}
              <button
                type="button"
                onClick={() => setActiveModal('link')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <Type className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Hyperlink</div>
                <div className="text-[10px] text-slate-500">Web URL link</div>
              </button>

              {/* Page Break */}
              <button
                type="button"
                onClick={insertPageBreak}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <Layers className="w-5 h-5 text-violet-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Page Break</div>
                <div className="text-[10px] text-slate-500">Force new page</div>
              </button>

              {/* Divider Line */}
              <button
                type="button"
                onClick={insertHorizontalRule}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <Minus className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Divider Line</div>
                <div className="text-[10px] text-slate-500">Horizontal rule</div>
              </button>

              {/* Date Stamp */}
              <button
                type="button"
                onClick={insertDate}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Date Stamp</div>
                <div className="text-[10px] text-slate-500">Today&apos;s date</div>
              </button>

              {/* Highlight Callout */}
              <button
                type="button"
                onClick={() => insertCalloutBox('info')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <Info className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Callout Box</div>
                <div className="text-[10px] text-slate-500">Highlighted notice</div>
              </button>

              {/* Signature Line */}
              <button
                type="button"
                onClick={insertSignatureBlock}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <PenTool className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Signature Line</div>
                <div className="text-[10px] text-slate-500">Sign &amp; date block</div>
              </button>

              {/* Special Symbols */}
              <button
                type="button"
                onClick={() => setActiveModal('symbols')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1 transition-all cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Symbols</div>
                <div className="text-[10px] text-slate-500">Math, currency &amp; icons</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TABLE BUILDER */}
      {activeModal === 'table' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-indigo-600" />
                <span>Insert Table</span>
              </h3>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Number of Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Number of Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                Creates a responsive {tableRows} × {tableCols} styled table matching document direction ({isRTL ? 'RTL' : 'LTR'}).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertTableElement}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-600/20"
                >
                  Insert Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HYPERLINK */}
      {activeModal === 'link' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-sky-600" />
                <span>Insert Hyperlink</span>
              </h3>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Link Text</label>
                <input
                  type="text"
                  placeholder="e.g. Visit Miftah Tools"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Destination</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertLinkElement}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-600/20"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SPECIAL SYMBOLS */}
      {activeModal === 'symbols' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Special Symbols &amp; Math</span>
              </h3>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-60 overflow-y-auto p-1">
              {SPECIAL_SYMBOLS.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertSymbol(sym)}
                  className="h-10 rounded-xl bg-slate-100 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-brand-950/50 hover:text-brand-600 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAGE SETTINGS */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-600" />
                <span>Page Layout &amp; Margins Setup</span>
              </h3>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paper Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Paper Standard</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['a4', 'letter'] as PaperSize[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSettings({ ...settings, paperSize: p })}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        settings.paperSize === p
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {p.toUpperCase()} ({p === 'a4' ? '210×297mm' : '8.5×11 in'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as PageOrientation[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setSettings({ ...settings, orientation: o })}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        settings.orientation === o
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {o === 'portrait' ? 'Portrait (عمودي)' : 'Landscape (أفقي)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins Preset */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Margins</label>
                <select
                  value={settings.marginPreset}
                  onChange={(e) => setSettings({ ...settings, marginPreset: e.target.value as MarginPreset })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="normal">Normal (1 in / 25.4mm)</option>
                  <option value="narrow">Narrow (0.5 in / 12.7mm)</option>
                  <option value="wide">Wide (1.5 in / 38.1mm)</option>
                </select>
              </div>

              {/* Page Number Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Numbering</label>
                <select
                  value={settings.pageNumberPosition}
                  onChange={(e) => setSettings({ ...settings, pageNumberPosition: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="bottom-center">Bottom Center (صفحة 1 من N)</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="none">No Page Numbers</option>
                </select>
              </div>
            </div>

            {/* Header & Footer Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Header Text</label>
                <input
                  type="text"
                  placeholder="e.g. Official Document"
                  value={settings.headerText}
                  onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Footer Text</label>
                <input
                  type="text"
                  placeholder="e.g. Confidential &bull; All Rights Reserved"
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeHeaderFooter}
                  onChange={(e) => setSettings({ ...settings, includeHeaderFooter: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span>Include Header &amp; Footer in PDF</span>
              </label>

              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 rounded-xl bg-brand-600 text-white font-extrabold text-xs shadow-md shadow-brand-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STARTER TEMPLATES */}
      {activeModal === 'templates' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Choose a Starter Document Template</span>
                </h3>
                <p className="text-xs text-slate-500">Pick a pre-formatted layout in Urdu, Arabic, Hindi, or English.</p>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto p-1 flex-1">
              {DOCUMENT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tmpl.icon}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      Use Template
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{tmpl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW MODE */}
      {activeModal === 'preview' && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col p-2 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 max-w-5xl mx-auto w-full mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-brand-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{docTitle} &bull; Print Preview</h3>
                <p className="text-[11px] text-slate-500">True multi-page layout preview ({settings.paperSize.toUpperCase()})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Print
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-extrabold text-white cursor-pointer"
              >
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex justify-center p-2">
            <div
              className="bg-white text-slate-900 shadow-2xl rounded-xl p-8 max-w-[800px] w-full"
              style={{
                fontFamily,
                fontSize,
                lineHeight: lineSpacing,
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '' }}
            />
          </div>
        </div>
      )}

      {/* MODAL: EXPORT RESULT READY DIALOG */}
      {activeModal === 'exportResult' && exportResultInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {exportResultInfo.format === 'pdf' ? 'PDF Document Ready!' : 'Word Document Ready!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your file has been processed and saved with 100% data privacy.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                📄 {exportResultInfo.title}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span>Format: {exportResultInfo.format.toUpperCase()}</span>
                <span>&bull;</span>
                <span>Pages: ~{stats.pages}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (exportResultInfo.fileInfo) {
                    shareDownloadedFile(exportResultInfo.fileInfo);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (exportResultInfo.fileInfo) {
                    openDownloadedFile(exportResultInfo.fileInfo);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Open in Viewer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Back to Document Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PROGRESS OVERLAY */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 flex items-center justify-center mx-auto animate-bounce">
              <Download className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {exportProgress.status || 'Generating document...'}
              </h4>
              <p className="text-xs text-slate-500">{exportProgress.percent}% completed</p>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-200"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
