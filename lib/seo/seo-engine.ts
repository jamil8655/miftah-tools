import { ToolDefinition, ToolCategory } from '../types';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '../tools-config';

export const SITE_DOMAIN = 'https://miftahtools.com';
export const SITE_BRAND = 'Miftah Tools';
export const SITE_TAGLINE = 'Your Digital Tools, All in One Place';

export interface ToolSeoData {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  howToSteps: { step: number; title: string; desc: string }[];
  keyFeatures: { title: string; desc: string; icon: string }[];
  specifications: {
    acceptedFormats: string;
    outputFormat: string;
    maxFiles: string;
    maxFileSize: string;
    executionType: string;
    privacy: string;
  };
  faqs: { question: string; answer: string }[];
  relatedTools: { id: string; slug: string; name: string; category: ToolCategory; shortDesc: string }[];
  canonicalUrl: string;
  jsonLd: Record<string, any>[];
}

export interface CategorySeoData {
  id: string;
  name: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  toolsCount: number;
  canonicalUrl: string;
  relatedCategories: { id: string; name: string; href: string }[];
}

/**
 * Generates rich, human-friendly, unique SEO title for any tool.
 */
export function generateToolSeoTitle(tool: ToolDefinition): string {
  const name = tool.name;

  if (name.toLowerCase().includes('pdf to') || name.toLowerCase().includes('to pdf')) {
    return `${name} Converter – Convert Files Free Online | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('compress')) {
    return `${name} Online – Reduce File Size Free | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('merge') || name.toLowerCase().includes('combine')) {
    return `${name} Online – Combine Multiple Files Free | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('split') || name.toLowerCase().includes('extract')) {
    return `${name} Online – Separate & Extract Pages Free | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('downloader')) {
    return `${name} – Free HD Video & Audio Downloader | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('generator') || name.toLowerCase().includes('qr') || name.toLowerCase().includes('barcode')) {
    return `${name} – Free Online Custom Generator | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('ocr') || name.toLowerCase().includes('scan')) {
    return `${name} – Extract Text from Images Free | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('calculator') || name.toLowerCase().includes('converter')) {
    return `${name} – Free Online Instant Calculator | ${SITE_BRAND}`;
  }
  if (name.toLowerCase().includes('editor') || name.toLowerCase().includes('edit')) {
    return `${name} Online – Free Document & File Editor | ${SITE_BRAND}`;
  }

  return `${name} – Free Online ${formatCategoryLabel(tool.category)} | ${SITE_BRAND}`;
}

/**
 * Generates natural, informative meta description for any tool.
 */
export function generateToolMetaDescription(tool: ToolDefinition): string {
  const name = tool.name;
  const desc = tool.shortDesc || tool.fullDesc;
  const exts = tool.acceptedExtensions.slice(0, 4).join(', ').replace(/\./g, '').toUpperCase();

  let actionSummary = desc;
  if (!actionSummary.endsWith('.')) actionSummary += '.';

  return `${actionSummary} Use ${name} free online with ${SITE_BRAND}. Supports ${exts || 'all major formats'} with 100% private in-browser processing.`;
}

/**
 * Generates primary H1 heading for the tool page.
 */
export function generateToolH1(tool: ToolDefinition): string {
  const name = tool.name;
  if (name.toLowerCase().includes('online')) return name;
  if (tool.category === 'pdf' && !name.toLowerCase().includes('pdf')) return `${name} PDF Online`;
  return `${name} Online`;
}

/**
 * Generates structured 4-step How to Use guide.
 */
export function generateHowToSteps(tool: ToolDefinition): { step: number; title: string; desc: string }[] {
  const exts = tool.acceptedExtensions.slice(0, 3).join(', ').replace(/\./g, '').toUpperCase();
  const outExt = (tool.outputExtension || 'file').toUpperCase();

  if (tool.maxFiles === 0 || tool.category === 'calculator' || tool.category === 'dev') {
    return [
      {
        step: 1,
        title: 'Enter or Paste Your Data',
        desc: 'Input your text, numbers, code, or parameters directly into the workspace above.',
      },
      {
        step: 2,
        title: 'Choose Output Options',
        desc: 'Select your preferred formatting, encoding, or calculation preferences.',
      },
      {
        step: 3,
        title: 'Process Instantly',
        desc: 'The tool calculates and formats your results in real-time inside your browser.',
      },
      {
        step: 4,
        title: 'Copy or Download Result',
        desc: 'Copy the processed data to your clipboard or download it as a clean file.',
      },
    ];
  }

  if (tool.category === 'media' || tool.id.includes('downloader')) {
    return [
      {
        step: 1,
        title: 'Copy Media Share Link',
        desc: 'Copy the public video or audio URL from YouTube, Instagram, Facebook, TikTok, or X.',
      },
      {
        step: 2,
        title: 'Paste in Search Box',
        desc: 'Paste the link above; our multi-cluster engine instantly analyzes available streams.',
      },
      {
        step: 3,
        title: 'Choose Video / Audio Quality',
        desc: 'Select 1080p Full HD, 720p HD, or 320kbps studio MP3 audio format.',
      },
      {
        step: 4,
        title: 'Save Directly to Device',
        desc: 'Click Download to save the media file directly to your phone or computer.',
      },
    ];
  }

  return [
    {
      step: 1,
      title: `Select ${exts || 'File'}`,
      desc: `Upload or drag and drop your ${exts || 'document'} file(s) into the secure upload area.`,
    },
    {
      step: 2,
      title: 'Configure Settings',
      desc: 'Adjust optional parameters like compression level, page range, or quality settings.',
    },
    {
      step: 3,
      title: 'Process In-Browser',
      desc: 'Click the action button to process your file locally with zero server upload wait.',
    },
    {
      step: 4,
      title: `Download ${outExt}`,
      desc: `Instantly download your converted and optimized ${outExt} file or save as ZIP.`,
    },
  ];
}

/**
 * Generates tailored FAQs for any tool.
 */
export function generateToolFaqs(tool: ToolDefinition): { question: string; answer: string }[] {
  if (tool.faq && tool.faq.length >= 3) {
    return tool.faq;
  }

  const name = tool.name;
  const exts = tool.acceptedExtensions.slice(0, 4).join(', ').replace(/\./g, '').toUpperCase();
  const outExt = (tool.outputExtension || 'document').toUpperCase();

  const generatedFaqs: { question: string; answer: string }[] = [
    {
      question: `What is ${name} and how does it work?`,
      answer: `${name} on ${SITE_BRAND} is a fast, web-based digital utility that lets you ${tool.shortDesc.toLowerCase()} It processes files directly inside your web browser using modern WebAssembly (WASM) and client-side JavaScript, ensuring high speed and absolute privacy.`,
    },
    {
      question: `Is ${name} free to use on ${SITE_BRAND}?`,
      answer: `Yes, ${name} is 100% free with unlimited usage. There are no subscriptions, paywalls, or account creation requirements.`,
    },
    {
      question: `Are my files safe and private when using ${name}?`,
      answer: `Absolutely. ${SITE_BRAND} processes your files locally on your own device. Your documents, pictures, and data are never transmitted or saved to external servers or third-party clouds.`,
    },
    {
      question: `What file formats and file size limits are supported?`,
      answer: `${name} supports ${exts || 'standard file formats'} up to ${tool.maxFileSizeMB || 500} MB per file. The output format is delivered as a high-quality .${outExt.toLowerCase()} file.`,
    },
    {
      question: `Can I use ${name} on mobile phones and tablets?`,
      answer: `Yes, ${name} is fully responsive and optimized for all devices, including Android phones, iPhones, iPads, Windows, and Mac computers.`,
    },
  ];

  if (tool.faq && tool.faq.length > 0) {
    return [...tool.faq, ...generatedFaqs.slice(tool.faq.length)];
  }

  return generatedFaqs;
}

/**
 * Finds 4-6 genuinely related tools in the same or adjacent categories.
 */
export function getRelatedTools(tool: ToolDefinition): { id: string; slug: string; name: string; category: ToolCategory; shortDesc: string }[] {
  const sameCategory = TOOLS_LIST.filter((t) => t.category === tool.category && t.id !== tool.id && t.slug !== tool.slug);
  
  if (sameCategory.length >= 5) {
    return sameCategory.slice(0, 6).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      category: t.category,
      shortDesc: t.shortDesc,
    }));
  }

  const otherTools = TOOLS_LIST.filter((t) => t.id !== tool.id && t.slug !== tool.slug && t.category !== tool.category);
  const combined = [...sameCategory, ...otherTools];
  
  return combined.slice(0, 6).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    category: t.category,
    shortDesc: t.shortDesc,
  }));
}

/**
 * Assembles complete SEO package for any tool.
 */
export function getCompleteToolSeo(tool: ToolDefinition): ToolSeoData {
  const title = generateToolSeoTitle(tool);
  const metaDescription = generateToolMetaDescription(tool);
  const h1 = generateToolH1(tool);
  const intro = `${tool.fullDesc || tool.shortDesc} Built for speed, privacy, and simplicity with 100% in-browser client-side execution.`;
  const howToSteps = generateHowToSteps(tool);
  const faqs = generateToolFaqs(tool);
  const relatedTools = getRelatedTools(tool);
  const canonicalUrl = `${SITE_DOMAIN}/tools/${tool.slug}/`;

  const exts = tool.acceptedExtensions.join(', ').replace(/\./g, '').toUpperCase();
  const outExt = (tool.outputExtension || 'file').toUpperCase();

  const specifications = {
    acceptedFormats: exts || 'All Compatible Formats',
    outputFormat: `.${outExt.toLowerCase()}`,
    maxFiles: tool.maxFiles > 0 ? `${tool.maxFiles} files per batch` : 'Single file / direct',
    maxFileSize: `${tool.maxFileSizeMB || 500} MB`,
    executionType: tool.isClientSide ? '100% Client-Side WebAssembly (WASM)' : 'High-Performance Local Engine',
    privacy: 'Zero Server Storage • Instant Device Processing',
  };

  const keyFeatures = [
    {
      title: '100% In-Browser Privacy',
      desc: 'Your files are processed locally using your device memory. Data never leaves your computer or phone.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Fast WASM Performance',
      desc: 'Hardware-accelerated processing eliminates cloud upload queues and network buffering.',
      icon: 'Zap',
    },
    {
      title: 'Zero Watermarks & Restrictions',
      desc: 'Download clean, unwatermarked files with original resolution and formatting intact.',
      icon: 'CheckCircle2',
    },
    {
      title: 'Cross-Platform Compatibility',
      desc: 'Seamlessly works in modern browsers across Windows, macOS, Linux, Android, and iOS.',
      icon: 'Globe2',
    },
  ];

  // JSON-LD Schemas
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    alternateName: `${tool.name} by ${SITE_BRAND}`,
    url: canonicalUrl,
    description: metaDescription,
    applicationCategory: formatSchemaCategory(tool.category),
    operatingSystem: 'All (Web, Android, iOS, Windows, macOS, Linux)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '2.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% in-browser client-side processing',
      `Supports ${exts || 'standard formats'}`,
      'Zero server file uploads',
      'Free unlimited usage',
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_DOMAIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: formatCategoryLabel(tool.category),
        item: `${SITE_DOMAIN}/tools/${tool.category}/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return {
    title,
    metaDescription,
    h1,
    intro,
    howToSteps,
    keyFeatures,
    specifications,
    faqs,
    relatedTools,
    canonicalUrl,
    jsonLd: [webAppSchema, breadcrumbSchema, faqSchema],
  };
}

/**
 * Generates complete SEO metadata for any category.
 */
export function getCategorySeo(categorySlug: string): CategorySeoData | null {
  const cat = CATEGORIES_CONFIG.find((c) => c.id === categorySlug || c.label.toLowerCase().includes(categorySlug.toLowerCase()));
  if (!cat) return null;

  const tools = TOOLS_LIST.filter((t) => t.category === cat.id);
  const relatedCategories = CATEGORIES_CONFIG.filter((c) => c.id !== cat.id).slice(0, 5).map((c) => ({
    id: c.id,
    name: c.label,
    href: `/tools/${c.id}/`,
  }));

  return {
    id: cat.id,
    name: cat.label,
    title: `${cat.label} – 100% Free Online Utilities | ${SITE_BRAND}`,
    metaDescription: `Discover free online ${cat.label.toLowerCase()} by ${SITE_BRAND}. ${cat.desc} Fast, private in-browser processing with zero server uploads.`,
    h1: `Free Online ${cat.label}`,
    intro: `${cat.desc} Explore all ${tools.length} free client-side tools designed for secure document and file management.`,
    toolsCount: tools.length,
    canonicalUrl: `${SITE_DOMAIN}/tools/${cat.id}/`,
    relatedCategories,
  };
}

function formatCategoryLabel(cat: ToolCategory | string): string {
  const map: Record<string, string> = {
    pdf: 'PDF Tools',
    document: 'Document Utilities',
    image: 'Image Studio',
    ocr: 'OCR & Scans',
    text: 'Text Tools',
    compress: 'File Compression',
    security: 'Security & Encryption',
    media: 'Audio & Video Tools',
    calculator: 'Calculators & Units',
    dev: 'Developer Tools',
    qr: 'QR & Barcodes',
    ai: 'AI Utilities',
    utility: 'General Utilities',
  };
  return map[cat] || 'Online Tools';
}

function formatSchemaCategory(cat: ToolCategory | string): string {
  const map: Record<string, string> = {
    pdf: 'BusinessApplication',
    document: 'OfficeApplication',
    image: 'DesignApplication',
    ocr: 'UtilitiesApplication',
    text: 'UtilitiesApplication',
    compress: 'UtilitiesApplication',
    security: 'SecurityApplication',
    media: 'MultimediaApplication',
    calculator: 'EducationalApplication',
    dev: 'DeveloperApplication',
    qr: 'UtilitiesApplication',
    ai: 'UtilitiesApplication',
  };
  return map[cat] || 'UtilitiesApplication';
}
