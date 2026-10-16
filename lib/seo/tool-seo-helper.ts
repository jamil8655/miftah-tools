import { ToolDefinition } from '@/lib/types';
import { TOOLS_LIST } from '@/lib/tools-config';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  step: number;
  title: string;
  desc: string;
}

const SPECIFIC_TOOL_FAQS: Record<string, ToolFaq[]> = {
  'compress-pdf': [
    {
      question: 'How does MiftahTools compress PDF files without losing quality?',
      answer:
        'Our PDF compression engine parses the PDF object tree directly inside your browser. It removes duplicate fonts, flattens redundant metadata streams, downsamples oversized embedded images with bilinear interpolation, and applies Flate stream compression without altering document typography.',
    },
    {
      question: 'Can I set a specific target size in KB (e.g. under 200 KB)?',
      answer:
        'Yes. You can use our precision Target Size slider or preset buttons to compress your document to exact thresholds like 200 KB, 100 KB, or 50 KB—ideal for government job applications, university submissions, and portal uploads.',
    },
    {
      question: 'Are my confidential documents uploaded to a remote server?',
      answer:
        'No. All compression algorithms execute locally within your device browser using WebAssembly. Your confidential PDF files never leave your computer or phone.',
    },
  ],
  'merge-pdf': [
    {
      question: 'Can I reorder pages before merging multiple PDFs?',
      answer:
        'Yes. When you drag and drop multiple PDF files, you can freely rearrange their order, inspect page counts, and combine them into a single coherent document in seconds.',
    },
    {
      question: 'Is there a limit on how many PDF files I can combine?',
      answer:
        'MiftahTools allows you to combine up to 100 PDF files in a single session with no subscription barriers or daily caps.',
    },
    {
      question: 'Does merging preserve original PDF bookmarks and links?',
      answer:
        'Yes. Internal document structures, embedded fonts, vector curves, and page content remain crisp and fully preserved.',
    },
  ],
  'split-pdf': [
    {
      question: 'Can I extract custom page ranges (e.g. 1-3, 5, 8-10)?',
      answer:
        'Yes. You can extract individual pages, split the document into equal page segments, extract all pages as separate files, or specify comma-separated custom page ranges.',
    },
    {
      question: 'Does splitting a PDF reduce text or image sharpness?',
      answer:
        'No. Splitting extracts the exact native byte streams for the chosen pages directly from the original PDF container without recompression.',
    },
  ],
  'pdf-to-word': [
    {
      question: 'Will the converted Word document keep my original formatting and tables?',
      answer:
        'Yes. Our engine analyzes text runs, font sizes, heading hierarchies, margins, and column layouts to reconstruct authentic Microsoft Word (.docx) paragraphs, tables, and typography.',
    },
    {
      question: 'Does this tool support Arabic, Urdu, and RTL languages?',
      answer:
        'Yes. MiftahTools features specialized bi-directional Unicode text shaping that preserves right-to-left layout and diacritics without jumbled letters.',
    },
  ],
  'watermark-pdf': [
    {
      question: 'Can I position my watermark anywhere on the PDF page?',
      answer:
        'Yes. You can choose from a 9-point page grid (top, center, bottom, corners), classic center diagonal (45°), full-page repeating tiles, or exact custom X and Y coordinates.',
    },
    {
      question: 'Can I use an image or logo as a watermark stamp?',
      answer:
        'Yes. You can either type custom text with custom font sizes, colors, and opacity, or upload your company logo (PNG, JPG) as an image stamp.',
    },
  ],
  'remove-watermark-pdf': [
    {
      question: 'How does MiftahTools remove watermarks from a PDF?',
      answer:
        'Our deep cleaner inspects the PDF content streams, annotation layers (/Annots, /Stamp, /Watermark), and optional content groups (OCG). It safely filters out translucent overlay stamps and marked artifact streams while keeping original text and imagery untouched.',
    },
    {
      question: 'Can I remove a specific custom watermark text?',
      answer:
        'Yes. You can enter the exact watermark keyword (e.g. CONFIDENTIAL, DRAFT, or a company name) to target and strip that specific stamp, or leave it blank to auto-detect and remove all watermarks.',
    },
  ],
  'ocr-image': [
    {
      question: 'Which languages can MiftahTools OCR extract text from?',
      answer:
        'Our browser-based OCR supports English, Spanish, French, German, Arabic, Urdu, Hindi, Chinese, Japanese, and over 40 additional languages using Tesseract WebAssembly.',
    },
    {
      question: 'Can I convert scanned tables into an Excel spreadsheet?',
      answer:
        'Yes. Our layout analyzer identifies tabular columnar spacing and enables one-click export into clean Excel (.xlsx) and CSV spreadsheets.',
    },
  ],
  'voice-to-text': [
    {
      question: 'Is my voice recorded or stored on any server?',
      answer:
        'No. Audio input is captured and converted locally using modern Speech Recognition APIs. No audio recordings are ever saved or uploaded.',
    },
    {
      question: 'Does the voice dictation tool support multiple languages?',
      answer:
        'Yes. You can dictate in English, Urdu, Hindi, Arabic, Spanish, and dozens of regional dialects with continuous punctuation support.',
    },
  ],
};

export function getToolFaqs(tool: ToolDefinition): ToolFaq[] {
  // Check exact slug or id match
  if (SPECIFIC_TOOL_FAQS[tool.slug]) return SPECIFIC_TOOL_FAQS[tool.slug];
  if (SPECIFIC_TOOL_FAQS[tool.id]) return SPECIFIC_TOOL_FAQS[tool.id];

  // Category fallback FAQs (unique & verified)
  const category = tool.category;
  if (category === 'pdf') {
    return [
      {
        question: `How do I use ${tool.name} online?`,
        answer: `Drag and drop your PDF document into the designated upload area, adjust your desired settings, and click the process button. Your file will be processed locally in seconds.`,
      },
      {
        question: `Is ${tool.name} free to use without daily limits?`,
        answer: `Yes. MiftahTools provides 100% free access to ${tool.name} with no daily file caps, no paywalls, and no account registration required.`,
      },
      {
        question: `Are my PDF files secure and confidential?`,
        answer: `All file operations are performed client-side inside your browser sandbox via WebAssembly. Your documents are never uploaded to any remote storage.`,
      },
      {
        question: `What devices and platforms support ${tool.name}?`,
        answer: `${tool.name} works seamlessly on all modern web browsers across Windows, macOS, Linux, Android, and iOS devices.`,
      },
    ];
  }

  if (category === 'image') {
    return [
      {
        question: `What image formats does ${tool.name} support?`,
        answer: `It supports popular modern image formats including JPG, PNG, WebP, SVG, BMP, and GIF with hardware-accelerated processing.`,
      },
      {
        question: `Will ${tool.name} reduce the quality of my pictures?`,
        answer: `Our algorithms prioritize visual fidelity and lossless optimization, preserving high clarity while achieving maximum file size reduction.`,
      },
      {
        question: `Are my photos uploaded to a cloud server?`,
        answer: `No. Your photos are rendered and transformed entirely inside your local device canvas and memory.`,
      },
    ];
  }

  // Default universal fallback
  return [
    {
      question: `What is ${tool.name} used for?`,
      answer: `${tool.name} is a high-speed digital utility designed to ${tool.shortDesc.toLowerCase()} quickly and safely directly in your web browser.`,
    },
    {
      question: `Do I need to install any software or plugins?`,
      answer: `No installation is needed. ${tool.name} runs instantly inside any modern web browser without third-party extensions.`,
    },
    {
      question: `Is there any fee or subscription required?`,
      answer: `No. ${tool.name} is completely free for everyone with unlimited usage and zero registration barriers.`,
    },
  ];
}

export function getToolHowToSteps(tool: ToolDefinition): ToolHowToStep[] {
  const cat = tool.category;
  if (cat === 'pdf') {
    return [
      {
        step: 1,
        title: 'Select or Drop PDF',
        desc: `Choose your PDF document from your device or drag and drop it into the ${tool.name} workspace.`,
      },
      {
        step: 2,
        title: 'Customize Settings',
        desc: 'Review the tool options, such as page range, compression quality, or placement preferences.',
      },
      {
        step: 3,
        title: 'Process & Download',
        desc: `Click the action button to execute ${tool.name} instantly on your device and save your clean result.`,
      },
    ];
  }

  if (cat === 'image') {
    return [
      {
        step: 1,
        title: 'Upload Image Files',
        desc: 'Select your JPG, PNG, or WebP pictures by browsing your storage or dropping them on screen.',
      },
      {
        step: 2,
        title: 'Adjust Parameters',
        desc: 'Set your preferred target dimensions, quality percentage, or target file size in KB/MB.',
      },
      {
        step: 3,
        title: 'Export Result',
        desc: 'Download your optimized picture immediately with crisp sharpness and zero server lag.',
      },
    ];
  }

  return [
    {
      step: 1,
      title: 'Provide Input',
      desc: `Upload your files or paste your text into the ${tool.name} interface.`,
    },
    {
      step: 2,
      title: 'Configure Options',
      desc: 'Select your conversion options, formatting modes, or target specifications.',
    },
    {
      step: 3,
      title: 'Download & Copy',
      desc: 'Save your generated output or copy the transformed data with one click.',
    },
  ];
}

export function getRelatedTools(currentTool: ToolDefinition, count = 4): ToolDefinition[] {
  return TOOLS_LIST.filter(
    (t) => t.id !== currentTool.id && t.slug !== currentTool.slug && (t.category === currentTool.category || t.popular)
  ).slice(0, count);
}
