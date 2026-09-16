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
  Layers,
  Palette,
  Eye,
  Settings2,
  FileCode,
  Languages,
  Trash2,
  Plus,
  Sparkles,
  ClipboardPaste,
  ArrowDownCircle,
  FileCheck,
  PenTool,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Type,
  Maximize2,
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
  BorderStyle,
} from 'docx';
import { downloadSingleFile } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';

interface RichTextToDocumentStudioProps {
  defaultFormat?: 'pdf' | 'docx';
}

const STARTER_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Clean Document',
    icon: '📄',
    desc: 'Start with a clean page and open canvas',
    content: `<h1>Document Title</h1><p>Start typing or pasting your document content here. You can write paragraphs, insert headings, format text with bold or colors, add tables, and export to PDF or Word DOCX instantly.</p>`,
  },
  {
    id: 'letter',
    name: 'Formal Business Letter',
    icon: '💼',
    desc: 'Professional correspondence with header & sign-off',
    content: `<p><strong>Your Name / Company Name</strong><br/>123 Business Avenue, Suite 400<br/>City, State, Zip Code<br/>Email: contact@company.com | Tel: +1 (555) 019-2834</p><hr/><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p><p><strong>To:</strong><br/>Recipient Name / Hiring Manager<br/>Department of Operations<br/>Target Enterprise Inc.<br/>456 Innovation Blvd, Tech City</p><p><strong>Subject: Formal Business Proposal & Collaboration Request</strong></p><p>Dear Sir / Madam,</p><p>I am writing to formally present our strategic collaboration proposal for the upcoming fiscal quarter. Our organization specializes in digital efficiency and document workflow solutions designed to streamline operational overhead by over 40%.</p><p>We would welcome the opportunity to schedule a brief 15-minute introductory call at your earliest convenience to review specific implementation milestones and answer any questions.</p><p>Thank you very much for your time, consideration, and continued partnership.</p><p>Sincerely,</p><p><strong>Your Full Name</strong><br/>Managing Director & Lead Executive<br/><em>Your Organization Name</em></p>`,
  },
  {
    id: 'report',
    name: 'Project & Business Report',
    icon: '📊',
    desc: 'Executive summary, structured table & recommendations',
    content: `<h1>Executive Project Performance Report</h1><p><em>Quarterly Review & Strategic Assessment &bull; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p><hr/><h2>1. Executive Summary</h2><p>This report outlines the key performance metrics, milestone completions, and strategic opportunities achieved over the preceding quarter. All core deliverables were accomplished within projected timelines and budget allocations.</p><h2>2. Key Deliverables & Metric Status</h2><table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1;"><thead><tr style="background-color: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Project Phase</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Lead Owner</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Completion</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Status</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Architecture Audit</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Engineering</td><td style="border: 1px solid #cbd5e1; padding: 8px;">100%</td><td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a; font-weight: bold;">Completed</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Client-Side Engine Refactor</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Core Dev Team</td><td style="border: 1px solid #cbd5e1; padding: 8px;">100%</td><td style="border: 1px solid #cbd5e1; padding: 8px; color: #16a34a; font-weight: bold;">Verified</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Multi-Format Export Test</td><td style="border: 1px solid #cbd5e1; padding: 8px;">QA & Testing</td><td style="border: 1px solid #cbd5e1; padding: 8px;">95%</td><td style="border: 1px solid #cbd5e1; padding: 8px; color: #0284c7; font-weight: bold;">In Progress</td></tr></tbody></table><h2>3. Strategic Recommendations</h2><ul><li>Accelerate local client-side processing pipelines to guarantee 100% user privacy.</li><li>Standardize automated document generation templates for enterprise workflows.</li><li>Maintain bi-weekly telemetry checks to ensure zero memory leaks during batch operations.</li></ul>`,
  },
  {
    id: 'mom',
    name: 'Meeting Minutes (MoM)',
    icon: '📝',
    desc: 'Structured meeting agenda, decisions & action items',
    content: `<h1>Minutes of Meeting (MoM)</h1><p><strong>Topic:</strong> Product Roadmap & System Architecture Sync<br/><strong>Date & Time:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at 10:00 AM<br/><strong>Facilitator:</strong> Product Lead | <strong>Recorded By:</strong> Project Manager</p><hr/><h2>1. Attendees</h2><p>&bull; Alex Johnson (Engineering Lead)<br/>&bull; Sarah Williams (Product Manager)<br/>&bull; David Chen (Design & UX)<br/>&bull; Jamil Rahman (Technical Architect)</p><h2>2. Agenda Items Discussed</h2><ol><li>Review of recent client feedback regarding text to PDF & Word generation.</li><li>Introduction of the new WYSIWYG document editor and unified toolbars.</li><li>Timeline review for next release milestone.</li></ol><h2>3. Action Items & Owners</h2><table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1;"><thead><tr style="background-color: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Action Item</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Assignee</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Due Date</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Deploy Rich Text to PDF and DOCX Studio</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Jamil Rahman</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Immediate</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Test mobile responsiveness and RTL fonts</td><td style="border: 1px solid #cbd5e1; padding: 8px;">QA Team</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Tomorrow</td></tr></tbody></table>`,
  },
  {
    id: 'invoice',
    name: 'Invoice / Billing Statement',
    icon: '🧾',
    desc: 'Itemized billing table, subtotal, taxes & payment details',
    content: `<div style="display: flex; justify-content: space-between;"><div><h2>INVOICE</h2><p><strong>Invoice #:</strong> INV-2026-089<br/><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}<br/><strong>Due Date:</strong> Net 30 Days</p></div><div><p style="text-align: right;"><strong>Miftah Digital Services</strong><br/>Financial & Technology Solutions<br/>Billing: accounts@miftahtools.com</p></div></div><hr/><p><strong>Billed To:</strong><br/>Acme International Corp.<br/>Attn: Accounts Payable Department<br/>100 Enterprise Way, Floor 12</p><table style="width:100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-top: 16px;"><thead><tr style="background-color: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Service Description</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Hours / Qty</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">Rate ($)</th><th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">Amount ($)</th></tr></thead><tbody><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Document Conversion Engine Optimization</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">20</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$75.00</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$1,500.00</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">PDF Formatting & Typography Styling</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">10</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$75.00</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$750.00</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Quality Assurance & Mobile Sync</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">5</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$75.00</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$375.00</td></tr></tbody></table><div style="margin-top: 16px; text-align: right;"><p><strong>Subtotal:</strong> $2,625.00<br/><strong>Tax (0%):</strong> $0.00<br/><span style="font-size: 18px; color: #0284c7; font-weight: bold;">Total Due: $2,625.00</span></p></div><hr/><p><em>Payment Terms: Wire Transfer / ACH to Miftah Digital Services. Thank you for your business!</em></p>`,
  },
  {
    id: 'urdu_letter',
    name: 'Urdu / Arabic Application (خط و درخواست)',
    icon: '✍️',
    desc: 'RTL formatted formal petition & letter in Nastaliq',
    content: `<div dir="rtl" style="text-align: right; font-family: 'Noto Nastaliq Urdu', 'Amiri', serif;"><p><strong>بتاریخ:</strong> ${new Date().toLocaleDateString('ur-PK')}</p><p><strong>بخدمت جناب:</strong> ڈائریکٹر صاحب / مینیجنگ ایڈیٹر<br/>ادارہِ مفتاح ٹولز و ٹیکنالوجی سروسز<br/>نئی دہلی / اسلام آباد</p><p><strong>عنوان: باقاعدہ درخواست برائے جدید ٹیکسٹ ٹو پی ڈی ایف و ورڈ ڈاکومنٹ سروس</strong></p><p><strong>جنابِ عالی!</strong></p><p>مؤدبانہ گزارش ہے کہ ہماری تنظیم آپ کے پلیٹ فارم "مفتاح ٹولز" کے ذریعے مختلف دفتری دستاویزات، رپورٹس اور خطوط کو اعلیٰ معیار میں پی ڈی ایف (PDF) اور مائیکروسافٹ ورڈ (Word DOCX) میں تبدیل کرنا چاہتی ہے۔</p><p>ہمیں بے حد خوشی ہے کہ آپ نے لائیو ایڈیٹر، خوبصورت اردو نستعلیق فونٹس، اور ون کلک ایکسپورٹ کی سہولت فراہم کر کے صارفین کا کام انتہائی آسان بنا دیا ہے۔</p><p>امید ہے کہ آپ اسی طرح اردو اور عربی زبانوں کی خدمات کا دائرہ مزید وسیع فرمائیں گے۔</p><p>ہم آپ کے بے حد مشکور و ممنون رہیں گے۔</p><p style="margin-top: 24px;"><strong>فقط العارض:</strong><br/>آپ کا مخلص خادم<br/>محمد جمیل الرحمن<br/><em>رابطہ نمبر: 919876543210+</em></p></div>`,
  },
  {
    id: 'hindi_letter',
    name: 'Hindi Official Application (प्रार्थना पत्र)',
    icon: '🇮🇳',
    desc: 'Formal Hindi application with Devanagari typography',
    content: `<div style="font-family: 'Noto Sans Devanagari', sans-serif;"><p><strong>दिनांक:</strong> ${new Date().toLocaleDateString('hi-IN')}</p><p><strong>सेवा में,</strong><br/>श्रीमान प्रबंधक महोदय / प्रधानाचार्य जी,<br/>डिजिटल प्रौद्योगिकी एवं दस्तावेज़ विभाग,<br/>नई दिल्ली, भारत।</p><p><strong>विषय: उच्च गुणवत्ता वाले टेक्स्ट से पीडीएफ एवं वर्ड दस्तावेज़ निर्माण हेतु प्रार्थना पत्र।</strong></p><p><strong>महोदय,</strong></p><p>सविनय निवेदन यह है कि हम आपके प्रतिष्ठित डिजिटल प्लेटफॉर्म "Miftah Tools" का उपयोग विभिन्न आधिकारिक पत्रों, शैक्षणिक नोट्स और व्यावसायिक रिपोर्ट तैयार करने के लिए कर रहे हैं।</p><p>आपके नए रिच टेक्स्ट एडिटर की मदद से अब हम सीधे हिंदी में टाइप करके, शीर्षक, टेबल और रंगीन टेक्स्ट जोड़कर एक क्लिक में पीडीएफ (PDF) और वर्ड (DOCX) फाइल डाउनलोड कर पा रहे हैं।</p><p>अतः आपसे विनम्र निवेदन है कि इस उत्कृष्ट निःशुल्क सेवा को सदैव जारी रखने की कृपा करें।</p><p>इसके लिए हम सदैव आपके आभारी रहेंगे।</p><p style="margin-top: 24px;"><strong>भवदीय,</strong><br/>जमील रहमान<br/><em>संपर्क सूत्र: contact@miftahtools.com</em></p></div>`,
  },
  {
    id: 'notes',
    name: 'Study & Research Summary Notes',
    icon: '📚',
    desc: 'Structured study notes with callout highlights and citations',
    content: `<h1>Course Study Notes: Modern Web Architecture</h1><p><em>Module 4 &bull; Distributed Systems & Client-Side Processing</em></p><hr/><h2>Key Principles</h2><ul><li><strong>Zero Server Overhead:</strong> Computation executed on user's WebAssembly & Web Workers engine.</li><li><strong>Air-Gapped Privacy:</strong> Files never leave client device RAM.</li><li><strong>Instant Scalability:</strong> Zero cloud compute bottlenecks.</li></ul><div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 16px 0; border-radius: 8px;"><p style="margin: 0; color: #166534;"><strong>💡 Key Takeaway:</strong> By utilizing vector PDF rendering and binary memory buffers, high-resolution multi-page PDF generation can be executed in under 300 milliseconds directly in the browser.</p></div>`,
  },
];

const FONT_FAMILIES = [
  { label: 'Modern Sans (Plus Jakarta / Inter)', value: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif' },
  { label: 'Classic Serif (Amiri / Georgia)', value: 'Amiri, Georgia, "Times New Roman", serif' },
  { label: 'Urdu Nastaliq (اردو نستعلیق)', value: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif' },
  { label: 'Arabic Modern (Cairo / Tajawal)', value: 'Cairo, Tajawal, "Noto Kufi Arabic", sans-serif' },
  { label: 'Hindi Devanagari (हिंदी देवनागरी)', value: '"Noto Sans Devanagari", sans-serif' },
  { label: 'Technical Monospace (Courier)', value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const LINE_SPACINGS = ['1.15', '1.25', '1.5', '1.75', '2.0'];
const MARGIN_SIZES = [
  { label: 'Normal (24mm)', value: '24mm' },
  { label: 'Compact (12mm)', value: '12mm' },
  { label: 'Spacious (36mm)', value: '36mm' },
];

/**
 * Smart Auto-Format Engine: converts raw plain text, unstructured notes,
 * or clipboard dumps into beautifully structured HTML with headings, lists,
 * bold labels, and cleaned line wraps.
 */
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

    // Detect Markdown Headers (# Header or ## Header)
    if (line.startsWith('# ')) {
      closeLists();
      htmlBlocks.push(`<h1>${escapeHtml(line.substring(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeLists();
      htmlBlocks.push(`<h2>${escapeHtml(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      closeLists();
      htmlBlocks.push(`<h3>${escapeHtml(line.substring(4))}</h3>`);
      continue;
    }

    // Detect Numbered Section Titles (e.g., "1. Executive Summary" or "Section 2: Goals")
    if (/^(\d+\.|\d+\))\s+[A-Z\u0600-\u06FF\u0900-\u097F]/.test(line) && line.length < 80 && !line.endsWith('.')) {
      closeLists();
      htmlBlocks.push(`<h2>${escapeHtml(line)}</h2>`);
      continue;
    }

    // Detect ALL CAPS Section Title
    if (line.length > 3 && line.length < 60 && line === line.toUpperCase() && /[A-Z]/.test(line) && !line.includes(':')) {
      closeLists();
      htmlBlocks.push(`<h2>${escapeHtml(line)}</h2>`);
      continue;
    }

    // Detect Bullet Points (- item, * item, • item)
    if (/^[-*•]\s+/.test(line)) {
      if (inOrderedList) closeLists();
      if (!inBulletList) {
        htmlBlocks.push('<ul>');
        inBulletList = true;
      }
      const itemText = line.replace(/^[-*•]\s+/, '');
      htmlBlocks.push(`<li>${formatInlineText(itemText)}</li>`);
      continue;
    }

    // Detect Numbered List items (1. item, 2. item)
    if (/^\d+[\.\)]\s+/.test(line)) {
      if (inBulletList) closeLists();
      if (!inOrderedList) {
        htmlBlocks.push('<ol>');
        inOrderedList = true;
      }
      const itemText = line.replace(/^\d+[\.\)]\s+/, '');
      htmlBlocks.push(`<li>${formatInlineText(itemText)}</li>`);
      continue;
    }

    // Detect Blockquote (> quote)
    if (line.startsWith('> ')) {
      closeLists();
      htmlBlocks.push(`<blockquote>${formatInlineText(line.substring(2))}</blockquote>`);
      continue;
    }

    // Detect Divider (--- or === or ***)
    if (/^[-=_*]{3,}$/.test(line)) {
      closeLists();
      htmlBlocks.push('<hr/>');
      continue;
    }

    // Normal Paragraph with Key-Value bolding
    closeLists();
    htmlBlocks.push(`<p>${formatInlineText(line)}</p>`);
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
  const pasteInputRef = useRef<HTMLTextAreaElement>(null);

  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [selectedFont, setSelectedFont] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState('16px');
  const [lineSpacing, setLineSpacing] = useState('1.5');
  const [marginSize, setMarginSize] = useState('24mm');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [isRTL, setIsRTL] = useState(false);
  const [showPageBorder, setShowPageBorder] = useState(true);
  const [includeHeaderFooter, setIncludeHeaderFooter] = useState(true);
  const [pageBgColor, setPageBgColor] = useState('#ffffff');
  const [watermarkText, setWatermarkText] = useState('');

  // Quick Paste & Stream Input Drawer
  const [quickPasteOpen, setQuickPasteOpen] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(true);

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'page-setup'>('editor');
  const [stats, setStats] = useState({ words: 0, chars: 0, paragraphs: 0, readingTime: 1, estimatedPages: 1 });

  // Initialize editor content with autosave restore or blank template
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

  // Autosave draft every 3 seconds
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
      setDocumentTitle(template.name);
      if (template.id === 'urdu_letter') {
        setIsRTL(true);
        setSelectedFont(FONT_FAMILIES[2].value);
      } else if (template.id === 'hindi_letter') {
        setIsRTL(false);
        setSelectedFont(FONT_FAMILIES[4].value);
      } else {
        setIsRTL(false);
        setSelectedFont(FONT_FAMILIES[0].value);
      }
      setActiveTab('editor');
      updateStats();
    }
  };

  // 1-Click Clipboard Paste & Auto-Insert
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        setRawTextInput(text);
        setQuickPasteOpen(true);
      } else {
        setQuickPasteOpen(true);
      }
    } catch (err) {
      setQuickPasteOpen(true);
    }
  };

  // Insert or Append Raw/Formatted text into Editor
  const handleCommitRawText = (mode: 'replace' | 'append' | 'cursor') => {
    if (!rawTextInput.trim() || !editorRef.current) return;

    const formattedHtml = autoFormatEnabled ? smartAutoFormatText(rawTextInput) : `<p>${rawTextInput.replace(/\n/g, '<br/>')}</p>`;

    if (mode === 'replace') {
      editorRef.current.innerHTML = formattedHtml;
    } else if (mode === 'append') {
      editorRef.current.innerHTML += `<hr/>` + formattedHtml;
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
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Sample Entry A</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Operations</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; color: #16a34a; font-weight: bold;">Active</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Sample Entry B</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Technology</td>
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
      title = '✓ Confirmed Milestone';
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
          <p style="margin: 0; font-size: 11px; font-weight: bold;">Date & Official Seal</p>
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
        // Plain text / RTF / Logs
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

  // 1-Click Export to High-Quality Vector & Paginated PDF
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
      printContainer.style.padding = marginSize === '12mm' ? '30px' : marginSize === '36mm' ? '80px' : '50px';
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
            <span>Generated with Miftah Tools • miftahtools.com</span>
          </div>
        `;
      }

      innerContent += editorRef.current.innerHTML;

      if (includeHeaderFooter) {
        innerContent += `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>${new Date().toLocaleDateString()}</span>
            <span>Page 1 • ${watermarkText ? watermarkText : 'Verified Document'}</span>
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
      pdf.save(`${safeTitle}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 1-Click Export to Genuine Word DOCX
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
            children: docElements.length > 0 ? docElements : [new Paragraph({ text: 'Miftah Tools Document Export' })],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const safeTitle = (documentTitle || 'document').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document';
      downloadSingleFile(blob, `${safeTitle}.docx`);
    } catch (err) {
      console.error('Word DOCX generation error:', err);
    } finally {
      setIsExportingDocx(false);
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
    if (editorRef.current && confirm('Are you sure you want to clear the editor canvas?')) {
      editorRef.current.innerHTML = '<p><br/></p>';
      updateStats();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* 1. TOP HEADER & EXPORT ACTIONS BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-100 dark:shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter Document Title..."
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 focus:border-brand-500 focus:outline-hidden px-1 py-0.5 w-full max-w-md transition-colors"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Studio Document Editor</span>
                <span>&bull;</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">PDF &amp; Word (.docx) Ready</span>
                <span>&bull;</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Autosave Active</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.markdown,.docx,.doc,.rtf,.html,.log"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Import .txt, .md, .docx, .html files"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import File</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Paste text from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-indigo-600" />
              <span>Paste &amp; Auto-Format</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Print document (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Export DOCX Button */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>{isExportingDocx ? 'Generating Word...' : 'Export Word (.docx)'}</span>
            </button>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-brand-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Compiling PDF...' : 'Export PDF (.pdf)'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Words</span>
            <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 font-mono">
              {stats.words.toLocaleString()}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Characters</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.chars.toLocaleString()}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Paragraphs</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.paragraphs}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Est. Pages</span>
            <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400 font-mono">
              ~{stats.estimatedPages} {stats.estimatedPages === 1 ? 'Page' : 'Pages'}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Reading Time</span>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              ~{stats.readingTime} min
            </span>
          </div>
        </div>
      </div>

      {/* 2. QUICK PASTE / RAW TEXT AUTO-FORMAT DRAWER */}
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
                <ArrowDownCircle className="w-3.5 h-3.5" />
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

      {/* 3. TABS SWITCHER: VISUAL EDITOR, TEMPLATES, PAGE SETUP */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Visual Document Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Templates ({STARTER_TEMPLATES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('page-setup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'page-setup'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Page &amp; Typography Setup</span>
        </button>
      </div>

      {/* VIEW 1: TEMPLATES SELECTOR */}
      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Choose a Ready-to-Use Template</h3>
              <p className="text-xs text-slate-500">Pick a structured layout and start writing or editing right away.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Back to Editor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    Apply Layout
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{tmpl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PAGE & TYPOGRAPHY SETUP */}
      {activeTab === 'page-setup' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Document Layout &amp; Page Setup</h3>
            <p className="text-xs text-slate-500">Customize paper dimensions, fonts, margins, line heights, and page headers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Font Family */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Typography Font Family</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Font Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Spacing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Line Height Spacing</label>
              <select
                value={lineSpacing}
                onChange={(e) => setLineSpacing(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
              >
                {LINE_SPACINGS.map((ls) => (
                  <option key={ls} value={ls}>
                    {ls}x Spacing
                  </option>
                ))}
              </select>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Margins</label>
              <select
                value={marginSize}
                onChange={(e) => setMarginSize(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:border-brand-500"
              >
                {MARGIN_SIZES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Paper Standard</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paperSize === 'a4'
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  A4 (210 x 297 mm)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('letter')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paperSize === 'letter'
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  US Letter (8.5 x 11 in)
                </button>
              </div>
            </div>

            {/* RTL Text Direction */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Writing Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsRTL(false)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !isRTL
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  LTR (English / Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setIsRTL(true)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isRTL
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  RTL (Urdu / Arabic)
                </button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeHeaderFooter}
                onChange={(e) => setIncludeHeaderFooter(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Include Document Header &amp; Page Footer</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showPageBorder}
                onChange={(e) => setShowPageBorder(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Show Document Canvas Shadow &amp; Border</span>
            </label>
          </div>
        </div>
      )}

      {/* 4. LIVE VISUAL EDITOR CANVAS */}
      <div className="space-y-3">
        {/* Floating Formatting Toolbar */}
        <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-wrap items-center justify-between gap-2">
          {/* Group 1: Undo/Redo & Headings */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('undo')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('redo')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              title="Main Heading (H1)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              title="Section Heading (H2)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h3>')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              title="Subheading (H3)"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<p>')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              title="Normal Paragraph"
            >
              Paragraph
            </button>
          </div>

          {/* Group 2: Inline Styles (Bold, Italic, Underline, Strikethrough) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            {/* Text Color Picker */}
            <div className="relative flex items-center gap-1 ml-1">
              <label className="text-[10px] font-bold text-slate-400">Color:</label>
              <input
                type="color"
                defaultValue="#0f172a"
                onChange={(e) => executeCommand('foreColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Choose Text Color"
              />
            </div>

            {/* Highlight Picker */}
            <div className="relative flex items-center gap-1 ml-1">
              <label className="text-[10px] font-bold text-slate-400">Highlight:</label>
              <input
                type="color"
                defaultValue="#fef08a"
                onChange={(e) => executeCommand('hiliteColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Highlight Background Color"
              />
            </div>
          </div>

          {/* Group 3: Alignment & Direction */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyFull')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsRTL((prev) => !prev)}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                isRTL
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title="Toggle LTR / RTL Direction"
            >
              {isRTL ? 'RTL (اردو/عربي)' : 'LTR (ENG/हिंदी)'}
            </button>
          </div>

          {/* Group 4: Elements & Callouts */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Quote Block"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertTable}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Insert Styled Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertCallout('info')}
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 transition-colors cursor-pointer"
              title="Insert Info Callout"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertSignatureBox}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Insert Signature Block"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertHorizontalRule')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Divider Line"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertDateStamp}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Insert Date Stamp"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Canvas Container with Live Paginated Styling */}
        <div className="p-4 sm:p-8 bg-slate-100/80 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center min-h-[700px] overflow-x-auto">
          {/* Quick Paste Floating Pill inside Canvas */}
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{paperSize.toUpperCase()} Page View • {stats.estimatedPages} Page(s)</span>
            </div>

            <button
              type="button"
              onClick={() => setQuickPasteOpen((prev) => !prev)}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{quickPasteOpen ? 'Hide Quick Paste' : '⚡ Quick Paste Box'}</span>
            </button>
          </div>

          <div
            className={`w-full max-w-(--breakpoint-md) transition-all bg-white text-slate-900 ${
              showPageBorder ? 'shadow-2xl shadow-slate-300/70 dark:shadow-none border border-slate-200/80 rounded-2xl' : ''
            }`}
            style={{
              backgroundColor: pageBgColor,
              minHeight: paperSize === 'a4' ? '1120px' : '1050px',
              padding: marginSize,
              boxSizing: 'border-box',
            }}
          >
            {/* Page Header */}
            {includeHeaderFooter && (
              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 text-xs text-slate-400 font-medium select-none"
              >
                <span>{documentTitle || 'Document'}</span>
                <span>Miftah Tools Document Suite</span>
              </div>
            )}

            {/* Editable WYSIWYG Content Area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateStats}
              dir={isRTL ? 'rtl' : 'ltr'}
              className="min-h-[550px] outline-hidden text-slate-900 prose prose-slate max-w-none focus:outline-hidden"
              style={{
                fontFamily: selectedFont,
                fontSize: fontSize,
                lineHeight: lineSpacing,
              }}
            />

            {/* Page Footer */}
            {includeHeaderFooter && (
              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className="flex items-center justify-between border-t border-slate-200 pt-3 mt-12 text-[11px] text-slate-400 font-medium select-none"
              >
                <span>{new Date().toLocaleDateString()}</span>
                <span>Page 1 of {stats.estimatedPages} &bull; miftahtools.com</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
