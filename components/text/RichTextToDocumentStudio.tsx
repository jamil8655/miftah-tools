'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  CheckSquare,
  Indent,
  Outdent,
  RemoveFormatting,
  Layout,
  Settings2,
  Trash2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { marked } from 'marked';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
} from 'docx';
import { downloadSingleFile } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';

interface RichTextToDocumentStudioProps {
  defaultFormat?: 'pdf' | 'docx' | 'image';
}

const STARTER_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Document (खाली पृष्ठ)',
    icon: '📄',
    desc: 'Clean A4 page ready for direct typing or pasting',
    content: '<h1>Document Title</h1><p>Start typing your document here or paste text from your clipboard. You can apply formatting, insert tables, add signatures, and export to PDF, Word DOCX, or Image instantly.</p>',
  },
  {
    id: 'letter',
    name: 'Formal Business Letter (व्यावसायिक पत्र)',
    icon: '💼',
    desc: 'Professional correspondence with header & sign-off',
    content: '<p><strong>Your Name / Company Name</strong><br/>123 Business Avenue, Suite 400<br/>City, State, Zip Code<br/>Email: contact@company.com | Tel: +1 (555) 019-2834</p><hr/><p><strong>Date:</strong> ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p><p><strong>To:</strong><br/>Recipient Name / Department Head<br/>Target Enterprise Inc.<br/>456 Innovation Blvd, Tech City</p><p><strong>Subject: Formal Business Collaboration & Proposal</strong></p><p>Dear Sir / Madam,</p><p>I am writing to formally present our strategic collaboration proposal for the upcoming quarter. Our organization specializes in high-performance digital tools and document workflow solutions.</p><p>We would welcome the opportunity to schedule a brief 15-minute introductory call at your earliest convenience to review milestones and answer any questions.</p><p>Thank you very much for your time and consideration.</p><p>Sincerely,</p><p><strong>Your Full Name</strong><br/>Managing Director<br/><em>Your Organization Name</em></p>',
  },
  {
    id: 'report',
    name: 'Project & Business Report (रिपोर्ट)',
    icon: '📊',
    desc: 'Executive summary, structured table & status points',
    content: '<h1>Executive Project Performance Report</h1><p><em>Quarterly Review &bull; ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</em></p><hr/><h2>1. Executive Summary</h2><p>This report outlines the key performance metrics, milestone completions, and strategic opportunities achieved over the preceding quarter.</p><h2>2. Key Deliverables & Status</h2><table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin: 12px 0;"><thead><tr style="background-color: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Project Phase</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Lead Owner</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Completion</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Status</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Architecture Optimization</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Engineering</td><td style="border: 1px solid #cbd5e1; padding: 8px;">100%</td><td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a; font-weight: bold;">Completed</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Client-Side Engine Refactor</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Core Dev Team</td><td style="border: 1px solid #cbd5e1; padding: 8px;">100%</td><td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a; font-weight: bold;">Verified</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Multi-Format Export Test</td><td style="border: 1px solid #cbd5e1; padding: 8px;">QA Team</td><td style="border: 1px solid #cbd5e1; padding: 8px;">95%</td><td style="border: 1px solid #cbd5e1; padding: 8px; color: #0284c7; font-weight: bold;">In Progress</td></tr></tbody></table><h2>3. Strategic Recommendations</h2><ul><li>Accelerate local client-side processing pipelines to guarantee 100% user privacy.</li><li>Standardize automated document generation templates for enterprise workflows.</li></ul>',
  },
  {
    id: 'mom',
    name: 'Meeting Minutes (मीटिंग विवरण)',
    icon: '📝',
    desc: 'Structured meeting agenda, decisions & action items',
    content: '<h1>Minutes of Meeting (MoM)</h1><p><strong>Topic:</strong> Product Roadmap & System Architecture Sync<br/><strong>Date & Time:</strong> ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '<br/><strong>Facilitator:</strong> Product Lead | <strong>Recorded By:</strong> Project Manager</p><hr/><h2>1. Attendees</h2><p>&bull; Alex Johnson (Engineering Lead)<br/>&bull; Sarah Williams (Product Manager)<br/>&bull; David Chen (Design & UX)<br/>&bull; Jamil Rahman (Technical Architect)</p><h2>2. Agenda Items Discussed</h2><ol><li>Review of Microsoft Word / Google Docs style WYSIWYG studio.</li><li>Deployment of PDF, Word DOCX, and high-resolution Image export.</li><li>Timeline review for next release milestone.</li></ol><h2>3. Action Items</h2><table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1;"><thead><tr style="background-color: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Action Item</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Assignee</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Due Date</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Deploy Text to PDF / Word / Image Studio</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Jamil Rahman</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Immediate</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Verify mobile responsiveness & RTL typography</td><td style="border: 1px solid #cbd5e1; padding: 8px;">QA Team</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Today</td></tr></tbody></table>',
  },
  {
    id: 'urdu_letter',
    name: 'Urdu / Arabic Application (اردو / عربی درخواست)',
    icon: '✍️',
    desc: 'RTL formatted formal petition & letter in Nastaliq',
    content: '<div dir="rtl" style="text-align: right; font-family: \'Noto Nastaliq Urdu\', \'Amiri\', serif;"><p><strong>بتاریخ:</strong> ' + new Date().toLocaleDateString('ur-PK') + '</p><p><strong>بخدمت جناب:</strong> ڈائریکٹر صاحب / مینیجنگ ایڈیٹر<br/>ادارہِ مفتاح ٹولز و ٹیکنالوجی سروسز<br/>نئی دہلی / اسلام آباد</p><p><strong>عنوان: باقاعدہ درخواست برائے جدید ٹیکسٹ ٹو پی ڈی ایف و ورڈ ڈاکومنٹ سروس</strong></p><p><strong>جنابِ عالی!</strong></p><p>مؤدبانہ گزارش ہے کہ ہماری تنظیم آپ کے پلیٹ فارم "مفتاح ٹولز" کے ذریعے مختلف دفتری دستاویزات، رپورٹس اور خطوط کو اعلیٰ معیار میں پی ڈی ایف (PDF)، مائیکروسافٹ ورڈ (Word DOCX) اور تصویر (Image) میں تبدیل کرنا چاہتی ہے۔</p><p>ہمیں بے حد خوشی ہے کہ آپ نے مائیکروسافٹ ورڈ جیسا لائیو ایڈیٹر، خوبصورت اردو نستعلیق فونٹس، اور ون کلک ایکسپورٹ کی سہولت فراہم کر کے صارفین کا کام انتہائی آسان بنا دیا ہے۔</p><p>امید ہے کہ آپ اسی طرح اردو اور عربی زبانوں کی خدمات کا دائرہ مزید وسیع فرمائیں گے۔</p><p>ہم آپ کے بے حد مشکور و ممنون رہیں گے۔</p><p style="margin-top: 24px;"><strong>فقط العارض:</strong><br/>آپ کا مخلص خادم<br/>محمد جمیل الرحمن<br/><em>رابطہ نمبر: 919876543210+</em></p></div>',
  },
  {
    id: 'hindi_letter',
    name: 'Hindi Official Application (प्रार्थना पत्र)',
    icon: '🇮🇳',
    desc: 'Formal Hindi application with Devanagari typography',
    content: '<div style="font-family: \'Noto Sans Devanagari\', sans-serif;"><p><strong>दिनांक:</strong> ' + new Date().toLocaleDateString('hi-IN') + '</p><p><strong>सेवा में,</strong><br/>श्रीमान प्रबंधक महोदय / प्रधानाचार्य जी,<br/>डिजिटल प्रौद्योगिकी एवं दस्तावेज़ विभाग,<br/>नई दिल्ली, भारत।</p><p><strong>विषय: उच्च गुणवत्ता वाले टेक्स्ट से पीडीएफ एवं वर्ड दस्तावेज़ निर्माण हेतु प्रार्थना पत्र।</strong></p><p><strong>महोदय,</strong></p><p>सविनय निवेदन यह है कि हम आपके प्रतिष्ठित डिजिटल प्लेटफॉर्म "Miftah Tools" का उपयोग विभिन्न आधिकारिक पत्रों, शैक्षणिक नोट्स और व्यावसायिक रिपोर्ट तैयार करने के लिए कर रहे हैं।</p><p>आपके नए माइक्रोसॉफ्ट वर्ड शैली वाले एडिटर की मदद से अब हम सीधे हिंदी में टाइप करके, शीर्षक, टेबल और रंगीन टेक्स्ट जोड़कर एक क्लिक में पीडीएफ (PDF), वर्ड (DOCX) और इमेज फाइल डाउनलोड कर पा रहे हैं।</p><p>अतः आपसे विनम्र निवेदन है कि इस उत्कृष्ट निःशुल्क सेवा को सदैव जारी रखने की कृपा करें।</p><p>इसके लिए हम सदैव आपके आभारी रहेंगे।</p><p style="margin-top: 24px;"><strong>भवदीय,</strong><br/>जमील रहमान<br/><em>संपर्क सूत्र: contact@miftahtools.com</em></p></div>',
  },
  {
    id: 'notes',
    name: 'Study & Summary Notes (अध्ययन नोट्स)',
    icon: '📚',
    desc: 'Structured notes with callout highlights and bullet lists',
    content: '<h1>Course Study Notes: Modern Web Architecture</h1><p><em>Module 4 &bull; Client-Side Processing & High-Performance Web Apps</em></p><hr/><h2>Key Principles</h2><ul><li><strong>Zero Server Overhead:</strong> Computation executed directly in browser memory.</li><li><strong>Air-Gapped Privacy:</strong> Files never leave client device RAM.</li><li><strong>Instant Scalability:</strong> Zero cloud compute bottlenecks.</li></ul><div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 16px 0; border-radius: 8px;"><p style="margin: 0; color: #166534;"><strong>💡 Key Takeaway:</strong> High-resolution multi-page PDF and Word DOCX generation executes in under 300 milliseconds directly inside the browser.</p></div>',
  },
];

const FONT_FAMILIES = [
  { label: 'Calibri / Modern Sans', value: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { label: 'Times New Roman / Serif', value: 'Amiri, Georgia, "Times New Roman", Times, serif' },
  { label: 'Arial / Standard', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia / Elegant Serif', value: 'Georgia, serif' },
  { label: 'Urdu Nastaliq (اردو نستعلیق)', value: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif' },
  { label: 'Hindi Devanagari (हिंदी देवनागरी)', value: '"Noto Sans Devanagari", sans-serif' },
  { label: 'Arabic Modern (Cairo / Tajawal)', value: 'Cairo, Tajawal, "Noto Kufi Arabic", sans-serif' },
  { label: 'Courier / Monospace Code', value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = [
  { label: '11 pt (Small)', value: '14.5px' },
  { label: '12 pt (Standard)', value: '16px' },
  { label: '14 pt (Subheading)', value: '18.5px' },
  { label: '16 pt (Heading 3)', value: '21px' },
  { label: '18 pt (Heading 2)', value: '24px' },
  { label: '24 pt (Heading 1)', value: '32px' },
  { label: '32 pt (Title)', value: '42px' },
];

const LINE_SPACINGS = [
  { label: '1.0 (Single)', value: '1.2' },
  { label: '1.15 (Standard)', value: '1.35' },
  { label: '1.5 (Relaxed)', value: '1.6' },
  { label: '2.0 (Double)', value: '2.1' },
];

const MARGIN_SIZES = [
  { label: 'Normal (1 inch / 25mm)', value: '25mm' },
  { label: 'Narrow (0.5 inch / 12mm)', value: '12mm' },
  { label: 'Wide (1.5 inch / 38mm)', value: '38mm' },
];

function smartAutoFormatText(rawText: string): string {
  if (!rawText || !rawText.trim()) return '<p></p>';

  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const htmlBlocks: string[] = [];
  let inBulletList = false;
  let inOrderedList = false;

  const closeLists = () => {
    if (inBulletList) {
      htmlBlocks.push('</ul>');
      inBulletList = false;
    }
    if (inOrderedList) {
      htmlBlocks.push('</ol>');
      inOrderedList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      closeLists();
      continue;
    }

    if (line.startsWith('# ')) {
      closeLists();
      htmlBlocks.push('<h1>' + escapeHtml(line.substring(2)) + '</h1>');
      continue;
    }
    if (line.startsWith('## ')) {
      closeLists();
      htmlBlocks.push('<h2>' + escapeHtml(line.substring(3)) + '</h2>');
      continue;
    }
    if (line.startsWith('### ')) {
      closeLists();
      htmlBlocks.push('<h3>' + escapeHtml(line.substring(4)) + '</h3>');
      continue;
    }

    if (/^(\d+\.|\d+\))\s+[A-Z\u0600-\u06FF\u0900-\u097F]/.test(line) && line.length < 80 && !line.endsWith('.')) {
      closeLists();
      htmlBlocks.push('<h2>' + escapeHtml(line) + '</h2>');
      continue;
    }

    if (line.length > 3 && line.length < 60 && line === line.toUpperCase() && /[A-Z]/.test(line) && !line.includes(':')) {
      closeLists();
      htmlBlocks.push('<h2>' + escapeHtml(line) + '</h2>');
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      if (inOrderedList) closeLists();
      if (!inBulletList) {
        htmlBlocks.push('<ul>');
        inBulletList = true;
      }
      const itemText = line.replace(/^[-*•]\s+/, '');
      htmlBlocks.push('<li>' + formatInlineText(itemText) + '</li>');
      continue;
    }

    if (/^\d+[\.\)]\s+/.test(line)) {
      if (inBulletList) closeLists();
      if (!inOrderedList) {
        htmlBlocks.push('<ol>');
        inOrderedList = true;
      }
      const itemText = line.replace(/^\d+[\.\)]\s+/, '');
      htmlBlocks.push('<li>' + formatInlineText(itemText) + '</li>');
      continue;
    }

    if (line.startsWith('> ')) {
      closeLists();
      htmlBlocks.push('<blockquote>' + formatInlineText(line.substring(2)) + '</blockquote>');
      continue;
    }

    if (/^[-=_*]{3,}$/.test(line)) {
      closeLists();
      htmlBlocks.push('<hr/>');
      continue;
    }

    closeLists();
    htmlBlocks.push('<p>' + formatInlineText(line) + '</p>');
  }

  closeLists();
  return htmlBlocks.join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineText(text: string): string {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/^([A-Za-z\u0600-\u06FF\u0900-\u097F\s]{2,30}):\s*(.*)$/, '<strong>$1:</strong> $2');
  escaped = escaped.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" style="color:#0284c7;">$1</a>');
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  return escaped;
}

export function RichTextToDocumentStudio({ defaultFormat = 'pdf' }: RichTextToDocumentStudioProps) {
  const { language } = useI18n();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pasteInputRef = useRef<HTMLTextAreaElement>(null);

  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [selectedFont, setSelectedFont] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState('16px');
  const [lineSpacing, setLineSpacing] = useState('1.35');
  const [marginSize, setMarginSize] = useState('25mm');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [isRTL, setIsRTL] = useState(false);
  const [showPageBorder, setShowPageBorder] = useState(true);
  const [includeHeaderFooter, setIncludeHeaderFooter] = useState(true);
  const [pageBgColor, setPageBgColor] = useState('#ffffff');
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'templates'>('home');

  const [quickPasteOpen, setQuickPasteOpen] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(true);

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, paragraphs: 0, readingTime: 1, estimatedPages: 1 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('miftah_document_studio_draft');
      if (saved && editorRef.current) {
        editorRef.current.innerHTML = saved;
        updateStats();
        return;
      }
    }
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = STARTER_TEMPLATES[0].content;
      updateStats();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (editorRef.current && typeof window !== 'undefined') {
        localStorage.setItem('miftah_document_studio_draft', editorRef.current.innerHTML);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const paragraphs = editorRef.current.querySelectorAll('p, h1, h2, h3, h4, li, blockquote, table').length || 1;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const estimatedPages = Math.max(1, Math.ceil(words / 450));
    setStats({ words, chars, paragraphs, readingTime, estimatedPages });
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateStats();
    }
  };

  const handleApplyTemplate = (template: typeof STARTER_TEMPLATES[0]) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content;
      setDocumentTitle(template.name.split(' (')[0]);
      if (template.id === 'urdu_letter') {
        setIsRTL(true);
        setSelectedFont(FONT_FAMILIES[4].value);
      } else if (template.id === 'hindi_letter') {
        setIsRTL(false);
        setSelectedFont(FONT_FAMILIES[5].value);
      } else {
        setIsRTL(false);
        setSelectedFont(FONT_FAMILIES[0].value);
      }
      setActiveRibbonTab('home');
      updateStats();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawTextInput(text);
          setQuickPasteOpen(true);
          return;
        }
      }
      setQuickPasteOpen(true);
    } catch {
      setQuickPasteOpen(true);
    }
  };

  const handleCommitRawText = (mode: 'replace' | 'append' | 'cursor') => {
    if (!rawTextInput.trim() || !editorRef.current) return;

    const formattedHtml = autoFormatEnabled ? smartAutoFormatText(rawTextInput) : '<p>' + rawTextInput.replace(/\n/g, '<br/>') + '</p>';

    if (mode === 'replace') {
      editorRef.current.innerHTML = formattedHtml;
    } else if (mode === 'append') {
      editorRef.current.innerHTML += '<hr/>' + formattedHtml;
    } else {
      editorRef.current.focus();
      executeCommand('insertHTML', formattedHtml);
    }

    setRawTextInput('');
    setQuickPasteOpen(false);
    updateStats();
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin: 14px 0;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Item / Description</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Category</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">Status / Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Sample Entry 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">General</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; color: #16a34a; font-weight: bold;">Active</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Sample Entry 2</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Documentation</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; color: #0284c7; font-weight: bold;">Verified</td>
          </tr>
        </tbody>
      </table><p><br/></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const insertCallout = (type: 'info' | 'warning' | 'success') => {
    let bg = '#eff6ff';
    let border = '#3b82f6';
    let text = '#1e40af';
    let title = '📌 Note';

    if (type === 'warning') {
      bg = '#fffbeb';
      border = '#f59e0b';
      text = '#92400e';
      title = '⚠️ Important Notice';
    } else if (type === 'success') {
      bg = '#f0fdf4';
      border = '#22c55e';
      text = '#166534';
      title = '✓ Confirmed Item';
    }

    const html = `
      <div style="background-color: ${bg}; border-left: 4px solid ${border}; padding: 12px 16px; margin: 14px 0; border-radius: 8px;">
        <p style="margin: 0; color: ${text}; font-weight: bold;">${title}</p>
        <p style="margin: 4px 0 0 0; color: ${text};">Add your highlighted key information or instructions here.</p>
      </div><p><br/></p>
    `;
    executeCommand('insertHTML', html);
  };

  const insertSignatureBox = () => {
    const html = `
      <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 10px;">
        <div style="text-align: left; width: 220px; border-top: 1px solid #0f172a; padding-top: 6px;">
          <p style="margin: 0; font-size: 11px; font-weight: bold;">Authorized Signature</p>
          <p style="margin: 0; font-size: 10px; color: #64748b;">Managing Authority</p>
        </div>
        <div style="text-align: right; width: 160px; border-top: 1px solid #0f172a; padding-top: 6px;">
          <p style="margin: 0; font-size: 11px; font-weight: bold;">Date & Seal</p>
          <p style="margin: 0; font-size: 10px; color: #64748b;">${new Date().toLocaleDateString()}</p>
        </div>
      </div><p><br/></p>
    `;
    executeCommand('insertHTML', html);
  };

  const insertDateStamp = () => {
    const nowStr = new Date().toLocaleDateString(language === 'ur' ? 'ur-PK' : language === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    executeCommand('insertText', nowStr);
  };

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const src = loadEvt.target?.result as string;
      if (src) {
        const imgHtml = '<p><img src="' + src + '" alt="Inserted Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" /></p><p><br/></p>';
        executeCommand('insertHTML', imgHtml);
      }
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    try {
      const fileName = file.name.toLowerCase();
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));

      if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editorRef.current.innerHTML = result.value || '<p>Empty Word Document</p>';
      } else if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
        const text = await file.text();
        editorRef.current.innerHTML = (await marked.parse(text)) as string;
      } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        const text = await file.text();
        editorRef.current.innerHTML = text;
      } else {
        const text = await file.text();
        editorRef.current.innerHTML = smartAutoFormatText(text);
      }
      updateStats();
    } catch (err) {
      console.error('File import error:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportPdf = async () => {
    if (!editorRef.current) return;
    setIsExportingPdf(true);

    try {
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = paperSize === 'a4' ? '794px' : '816px';
      printContainer.style.backgroundColor = pageBgColor;
      printContainer.style.padding = marginSize === '12mm' ? '30px' : marginSize === '38mm' ? '80px' : '50px';
      printContainer.style.fontFamily = selectedFont;
      printContainer.style.fontSize = fontSize;
      printContainer.style.lineHeight = lineSpacing;
      printContainer.style.color = '#0f172a';
      printContainer.style.boxSizing = 'border-box';
      printContainer.dir = isRTL ? 'rtl' : 'ltr';

      let innerContent = '';
      if (includeHeaderFooter) {
        innerContent += `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; font-size: 11px; color: #64748b;">
            <span>${documentTitle || 'Document'}</span>
            <span>Miftah Tools • miftahtools.com</span>
          </div>
        `;
      }

      innerContent += editorRef.current.innerHTML;

      if (includeHeaderFooter) {
        innerContent += `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>${new Date().toLocaleDateString()}</span>
            <span>Page 1 of ${stats.estimatedPages} &bull; Verified Document</span>
          </div>
        `;
      }

      printContainer.innerHTML = innerContent;
      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: pageBgColor,
      });

      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: paperSize === 'a4' ? 'a4' : 'letter',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const safeTitle = (documentTitle || 'document').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document';
      pdf.save(safeTitle + '.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    setIsExportingDocx(true);

    try {
      const docElements: (Paragraph | Table)[] = [];

      if (includeHeaderFooter && documentTitle) {
        docElements.push(
          new Paragraph({
            text: documentTitle,
            heading: HeadingLevel.TITLE,
            alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
            spacing: { after: 200 },
          })
        );
      }

      const parseInlineRuns = (element: Node): TextRun[] => {
        const runs: TextRun[] = [];
        element.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            runs.push(new TextRun({ text: child.textContent || '', size: 24 }));
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement;
            const tag = el.tagName.toLowerCase();
            const text = el.innerText || el.textContent || '';
            const isBold = tag === 'b' || tag === 'strong' || el.style.fontWeight === 'bold';
            const isItalic = tag === 'i' || tag === 'em' || el.style.fontStyle === 'italic';
            const isUnderline = tag === 'u' || el.style.textDecoration.includes('underline');
            const isStrike = tag === 's' || tag === 'strike' || el.style.textDecoration.includes('line-through');

            runs.push(
              new TextRun({
                text: text,
                bold: isBold,
                italics: isItalic,
                underline: isUnderline ? {} : undefined,
                strike: isStrike,
                size: 24,
              })
            );
          }
        });
        return runs;
      };

      const nodes = Array.from(editorRef.current.childNodes);
      nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();

          if (tag === 'h1') {
            docElements.push(
              new Paragraph({
                text: el.innerText,
                heading: HeadingLevel.HEADING_1,
                alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { before: 240, after: 120 },
              })
            );
          } else if (tag === 'h2') {
            docElements.push(
              new Paragraph({
                text: el.innerText,
                heading: HeadingLevel.HEADING_2,
                alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (tag === 'h3') {
            docElements.push(
              new Paragraph({
                text: el.innerText,
                heading: HeadingLevel.HEADING_3,
                alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { before: 160, after: 80 },
              })
            );
          } else if (tag === 'table') {
            const rows = Array.from(el.querySelectorAll('tr')).map((tr) => {
              const cells = Array.from(tr.querySelectorAll('th, td')).map((cell) => {
                return new TableCell({
                  children: [
                    new Paragraph({
                      children: parseInlineRuns(cell),
                    }),
                  ],
                  width: { size: 100 / (tr.children.length || 1), type: WidthType.PERCENTAGE },
                });
              });
              return new TableRow({ children: cells });
            });

            if (rows.length > 0) {
              docElements.push(
                new Table({
                  rows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                })
              );
            }
          } else {
            const runs = parseInlineRuns(el);
            docElements.push(
              new Paragraph({
                children: runs.length > 0 ? runs : [new TextRun({ text: el.innerText || '', size: 24 })],
                alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { after: 140 },
              })
            );
          }
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docElements.length > 0 ? docElements : [new Paragraph({ text: 'Miftah Tools Document' })],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const safeTitle = (documentTitle || 'document').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document';
      downloadSingleFile(blob, safeTitle + '.docx');
    } catch (err) {
      console.error('Word DOCX generation error:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportImage = async (format: 'png' | 'jpeg' = 'png') => {
    if (!editorRef.current) return;
    setIsExportingImage(true);

    try {
      const renderContainer = document.createElement('div');
      renderContainer.style.position = 'fixed';
      renderContainer.style.left = '-9999px';
      renderContainer.style.top = '0';
      renderContainer.style.width = paperSize === 'a4' ? '794px' : '816px';
      renderContainer.style.backgroundColor = pageBgColor;
      renderContainer.style.padding = marginSize === '12mm' ? '30px' : marginSize === '38mm' ? '80px' : '50px';
      renderContainer.style.fontFamily = selectedFont;
      renderContainer.style.fontSize = fontSize;
      renderContainer.style.lineHeight = lineSpacing;
      renderContainer.style.color = '#0f172a';
      renderContainer.style.boxSizing = 'border-box';
      renderContainer.dir = isRTL ? 'rtl' : 'ltr';

      let innerContent = '';
      if (includeHeaderFooter) {
        innerContent += `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; font-size: 11px; color: #64748b;">
            <span>${documentTitle || 'Document'}</span>
            <span>Miftah Tools • miftahtools.com</span>
          </div>
        `;
      }

      innerContent += editorRef.current.innerHTML;

      if (includeHeaderFooter) {
        innerContent += `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>${new Date().toLocaleDateString()}</span>
            <span>Page 1 of ${stats.estimatedPages}</span>
          </div>
        `;
      }

      renderContainer.innerHTML = innerContent;
      document.body.appendChild(renderContainer);

      const canvas = await html2canvas(renderContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: pageBgColor,
      });

      document.body.removeChild(renderContainer);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob((blob) => {
        if (blob) {
          const safeTitle = (documentTitle || 'document').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document';
          downloadSingleFile(blob, safeTitle + (format === 'jpeg' ? '.jpg' : '.png'));
        }
      }, mimeType, 0.95);
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleCopy = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.innerText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleClear = () => {
    if (editorRef.current && confirm('Are you sure you want to clear the canvas? (क्या आप पूरे पेज को खाली करना चाहते हैं?)')) {
      editorRef.current.innerHTML = '<p><br/></p>';
      updateStats();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* 1. TOP MICROSOFT OFFICE STYLE TITLE & EXPORT HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg shadow-slate-100 dark:shadow-none space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Document Title & File Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document Title (दस्तावेज़ का नाम)..."
                className="text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 focus:border-brand-500 focus:outline-hidden px-1 py-0.5 w-full max-w-xs sm:max-w-md transition-colors"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="text-brand-600 dark:text-brand-400 font-bold">Word &amp; Docs Studio</span>
                <span>&bull;</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Auto-saved locally</span>
              </p>
            </div>
          </div>

          {/* Core Export Actions: PDF, Word DOCX, Image PNG, Paste, Print */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.markdown,.docx,.doc,.rtf,.html,.log"
              className="hidden"
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageInsert}
              accept="image/*"
              className="hidden"
            />

            {/* Paste from Clipboard Button */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Paste text from clipboard (Ctrl+V)"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-indigo-600" />
              <span>📋 Paste Text</span>
            </button>

            {/* Import File */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Open / Import .txt, .docx, .md file"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
            </button>

            {/* Copy All */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Copy all text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center transition-all shadow-xs cursor-pointer"
              title="Print document (Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* EXPORT IMAGE BUTTON */}
            <button
              type="button"
              onClick={() => handleExportImage('png')}
              disabled={isExportingImage}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-violet-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download page as high-resolution PNG image"
            >
              <FileImage className="w-3.5 h-3.5" />
              <span>{isExportingImage ? 'Rendering Image...' : 'Export Image (.png)'}</span>
            </button>

            {/* EXPORT DOCX BUTTON */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download editable Microsoft Word document"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{isExportingDocx ? 'Saving Word...' : 'Export Word (.docx)'}</span>
            </button>

            {/* EXPORT PDF BUTTON */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-brand-600/25 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download print-ready PDF document"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export PDF (.pdf)'}</span>
            </button>
          </div>
        </div>

        {/* 2. MICROSOFT OFFICE RIBBON TABS */}
        <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 pt-2.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveRibbonTab('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRibbonTab === 'home'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Home (फॉर्मेटिंग)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('insert')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRibbonTab === 'insert'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Insert (टेबल व चित्र)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('layout')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRibbonTab === 'layout'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Page Layout (पेज सेटिंग)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRibbonTab === 'templates'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Templates (${STARTER_TEMPLATES.length})</span>
          </button>
        </div>
      </div>

      {/* QUICK PASTE / SMART AUTO-FORMAT DRAWER */}
      {quickPasteOpen && (
        <div className="bg-gradient-to-r from-indigo-900/10 via-brand-900/10 to-violet-900/10 dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Quick Paste &amp; Smart Auto-Format Engine (क्विक पेस्ट व ऑटो-फॉर्मेट)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste any unformatted text, WhatsApp notes, copied PDF excerpts, or raw notes. The engine will structure headings, lists, and bold keys automatically!
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shrink-0">
              <input
                type="checkbox"
                checked={autoFormatEnabled}
                onChange={(e) => setAutoFormatEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Smart Auto-Format Enabled</span>
            </label>
          </div>

          <textarea
            ref={pasteInputRef}
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            placeholder="Paste or type raw text here... (e.g. 1. Title, - Bullet list, Key: Value, multiple paragraphs)"
            className="w-full h-36 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCommitRawText('replace')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Format &amp; Replace Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => handleCommitRawText('append')}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-600/20 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>➕ Append to Bottom (नीचे जोड़ते जाएं)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCommitRawText('cursor')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                <span>📍 Insert at Cursor</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setRawTextInput('');
                setQuickPasteOpen(false);
              }}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TEMPLATES POPUP / VIEW */}
      {activeRibbonTab === 'templates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Choose a Ready-to-Use Document Template</h3>
              <p className="text-xs text-slate-500">Pick a structured layout and start writing or editing right away.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveRibbonTab('home')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Close Templates
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{tmpl.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    Apply
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tmpl.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{tmpl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE LAYOUT SETTINGS VIEW */}
      {activeRibbonTab === 'layout' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Page Layout &amp; Margins Setup</h3>
            <p className="text-xs text-slate-500">Configure paper size, margins, page background, and writing direction.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paper Standard */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Paper Standard</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paperSize === 'a4'
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  A4 (210×297mm)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('letter')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paperSize === 'letter'
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  US Letter
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Margins</label>
              <select
                value={marginSize}
                onChange={(e) => setMarginSize(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
              >
                {MARGIN_SIZES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Writing Direction */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Writing Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsRTL(false)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !isRTL
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  LTR (ENG/हिंदी)
                </button>
                <button
                  type="button"
                  onClick={() => setIsRTL(true)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isRTL
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  RTL (اردو/عربي)
                </button>
              </div>
            </div>

            {/* Page Background */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Color</label>
              <div className="flex items-center gap-2">
                {['#ffffff', '#fafaf9', '#f8fafc', '#fefce8'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPageBgColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 cursor-pointer transition-all ${
                      pageBgColor === c ? 'border-brand-600 scale-110 shadow-xs' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeHeaderFooter}
                onChange={(e) => setIncludeHeaderFooter(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Include Header &amp; Footer in Export</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showPageBorder}
                onChange={(e) => setShowPageBorder(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Show A4 Paper Shadow &amp; Border</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. STICKY MICROSOFT OFFICE FORMATTING TOOLBAR */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-md shadow-slate-200/50 dark:shadow-none flex flex-wrap items-center justify-between gap-2">
        {/* Left Formatting Tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Font Family */}
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden text-slate-800 dark:text-slate-200"
            title="Select Font Family"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden text-slate-800 dark:text-slate-200"
            title="Font Size"
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Headings / Styles */}
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs transition-colors cursor-pointer"
            title="Main Heading (H1)"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
            title="Heading 2 (H2)"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            title="Heading 3 (H3)"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<p>')}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
            title="Normal Paragraph"
          >
            Normal
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Bold, Italic, Underline, Strike */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Text Color Picker */}
          <div className="relative flex items-center gap-1" title="Text Color">
            <span className="text-[10px] font-bold text-slate-400">A</span>
            <input
              type="color"
              defaultValue="#0f172a"
              onChange={(e) => executeCommand('foreColor', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
          </div>

          {/* Highlight Color Picker */}
          <div className="relative flex items-center gap-1" title="Highlight Color">
            <span className="text-[10px] font-bold text-amber-500">🎨</span>
            <input
              type="color"
              defaultValue="#fef08a"
              onChange={(e) => executeCommand('hiliteColor', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Justify Text"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Inserts: Table, Image, Callout, Signature, Divider, Date */}
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Insert Image from Device"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertCallout('info')}
            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 transition-colors cursor-pointer"
            title="Insert Highlight Box"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertSignatureBox}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Insert Signature Line"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertHorizontalRule')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Divider Line"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertDateStamp}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Insert Current Date"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: Clear & Quick Paste Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setQuickPasteOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{quickPasteOpen ? 'Hide Paste' : 'Quick Paste Box'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors cursor-pointer"
            title="Clear Page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. REALISTIC MICROSOFT WORD / GOOGLE DOCS A4 CANVAS CONTAINER */}
      <div className="p-3 sm:p-8 bg-slate-200/70 dark:bg-slate-950/70 rounded-3xl border border-slate-300/80 dark:border-slate-800 flex flex-col items-center min-h-[750px] overflow-x-auto">
        {/* Top Paper Header Info */}
        <div className="w-full max-w-4xl flex items-center justify-between pb-3 px-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {paperSize === 'a4' ? 'A4 Paper (210×297mm)' : 'US Letter'} &bull; ~{stats.estimatedPages} Page(s) &bull; Click anywhere on page to type
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            {stats.words.toLocaleString()} Words &bull; {stats.chars.toLocaleString()} Chars
          </div>
        </div>

        {/* Central White A4 Sheet with Realistic Word Shadow */}
        <div
          className={`w-full max-w-[800px] transition-all bg-white text-slate-900 ${
            showPageBorder ? 'shadow-2xl shadow-slate-400/60 dark:shadow-2xl dark:shadow-black/70 border border-slate-300/80 rounded-xl' : ''
          }`}
          style={{
            backgroundColor: pageBgColor,
            minHeight: paperSize === 'a4' ? '1120px' : '1050px',
            padding: marginSize,
            boxSizing: 'border-box',
          }}
        >
          {/* Document Top Header */}
          {includeHeaderFooter && (
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 text-xs text-slate-400 font-medium select-none"
            >
              <span>{documentTitle || 'Untitled Document'}</span>
              <span>Miftah Tools Document Studio</span>
            </div>
          )}

          {/* Editable WYSIWYG Content Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateStats}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="min-h-[700px] outline-hidden text-slate-900 prose prose-slate max-w-none focus:outline-hidden"
            style={{
              fontFamily: selectedFont,
              fontSize: fontSize,
              lineHeight: lineSpacing,
            }}
          />

          {/* Document Page Footer */}
          {includeHeaderFooter && (
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="flex items-center justify-between border-t border-slate-200 pt-3 mt-12 text-[11px] text-slate-400 font-medium select-none"
            >
              <span>{new Date().toLocaleDateString()}</span>
              <span>Page 1 of ${stats.estimatedPages} &bull; miftahtools.com</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. MICROSOFT WORD STYLE BOTTOM STATUS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>Page 1 of {stats.estimatedPages}</span>
          </span>
          <span>&bull;</span>
          <span><strong>{stats.words.toLocaleString()}</strong> words</span>
          <span>&bull;</span>
          <span><strong>{stats.chars.toLocaleString()}</strong> characters</span>
          <span>&bull;</span>
          <span><strong>{stats.paragraphs}</strong> blocks</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Est. Reading: ~{stats.readingTime} min</span>
          <span>&bull;</span>
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready to Export</span>
          </span>
        </div>
      </div>
    </div>
  );
}
