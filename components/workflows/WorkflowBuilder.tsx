'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Download,
  Layers,
  FileText,
  Image as ImageIcon,
  Workflow,
  RotateCcw,
  Check,
  Eye,
  Zap,
  Cpu,
  Wand2,
  X,
  ChevronRight,
  ChevronDown,
  Upload,
  RefreshCw,
  FolderDown,
  Sliders,
  FileCheck2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  SavedWorkflow,
  WorkflowStep,
  getSavedWorkflows,
  saveWorkflow,
  deleteWorkflow,
  logActivity,
  saveProcessedFile,
} from '@/lib/storage/indexeddb-store';
import { downloadSingleFile, openDownloadedFile } from '@/lib/utils/download';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBytes } from '@/lib/utils/formatters';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { compressPdfAdvanced } from '@/lib/pdf/pdf-compressor';
import { watermarkPdf, addPageNumbers } from '@/lib/pdf/pdf-manipulator';
import {
  convertImage,
  resizeImage,
  compressImageToTargetKB,
  watermarkImage,
  stripExifAndMetadata,
} from '@/lib/image/image-manipulator';
import { runOcr } from '@/lib/ocr/ocr-engine';
import { universalMarkItDown } from '@/lib/engines/markitdown-engine';

const WORKFLOW_LOCALES = {
  en: {
    badge: 'Smart Workflows',
    title: 'Automated Workflows',
    subtitle: 'Chain multiple tools into an automated 1-click processing pipeline.',
    selectWorkflow: 'Select Pipeline',
    choosePreset: 'Choose Workflow Preset',
    allTab: 'All',
    imageTab: 'Images',
    pdfTab: 'PDF',
    ocrTab: 'OCR & Docs',
    customTab: 'Custom',
    templateBadge: 'TEMPLATE',
    customBadge: 'CUSTOM',
    stagesLabel: (count: number) => `${count} ${count === 1 ? 'Stage' : 'Stages'}`,
    uploadPrompt: 'Tap to select or drop file here',
    uploadSub: 'Supports Photos, PDFs & Documents',
    changeFile: 'Change',
    runningSteps: 'Executing Pipeline...',
    runFullWorkflow: 'Run Pipeline',
    completedTitle: 'Pipeline Completed Successfully!',
    downloadFinal: 'Download Result',
    openFile: 'Open & View',
    runAgain: 'Run Again',
    createNewPipeline: 'Create Custom Pipeline',
    pipelineNamePlaceholder: 'Pipeline Name (e.g. Photo ID Suite)',
    pipelineDescPlaceholder: 'Short description...',
    addStagePrompt: '+ Add Next Stage',
    savePipeline: 'Save Pipeline',
    cancel: 'Cancel',
    intermediateResults: 'Stage Previews',
  },
  ur: {
    badge: 'اسمارٹ ورک فلو',
    title: 'خودکار ورک فلو پائپ لائن',
    subtitle: 'مختلف ٹولز کو ملا کر 1-کلک میں خودکار پروسیسنگ کریں۔',
    selectWorkflow: 'پائپ لائن منتخب کریں',
    choosePreset: 'ورک فلو پری سیٹ منتخب کریں',
    allTab: 'تمام',
    imageTab: 'تصاویر',
    pdfTab: 'پی ڈی ایف',
    ocrTab: 'او سی آر',
    customTab: 'کسٹم',
    templateBadge: 'ٹیمپلیٹ',
    customBadge: 'کسٹم',
    stagesLabel: (count: number) => `${count} ${count === 1 ? 'مرحلہ' : 'مراحل'}`,
    uploadPrompt: 'فائل منتخب کرنے کے لیے ٹیپ کریں یا یہاں رکھیں',
    uploadSub: 'تصاویر، پی ڈی ایف اور دستاویزات کے لیے موزوں',
    changeFile: 'تبدیل کریں',
    runningSteps: 'پائپ لائن پروسیس ہو رہی ہے...',
    runFullWorkflow: 'پائپ لائن چلائیں',
    completedTitle: 'پائپ لائن کامیابی سے مکمل ہو گئی!',
    downloadFinal: 'نتیجہ ڈاؤن لوڈ کریں',
    openFile: 'فائل دیکھیں',
    runAgain: 'دوبارہ چلائیں',
    createNewPipeline: 'نیا کسٹم ورک فلو بنائیں',
    pipelineNamePlaceholder: 'ورک فلو کا نام',
    pipelineDescPlaceholder: 'مختصر تفصیل...',
    addStagePrompt: '+ اگلا مرحلہ شامل کریں',
    savePipeline: 'ورک فلو محفوظ کریں',
    cancel: 'منسوخ',
    intermediateResults: 'مراحل کے نتائج',
  },
  ar: {
    badge: 'سير العمل الذكي',
    title: 'سير العمل والأتمتة',
    subtitle: 'دمج عدة أدوات في خط معالجة تلقائي بنقرة واحدة.',
    selectWorkflow: 'اختيار خط المعالجة',
    choosePreset: 'اختر قالب سير العمل',
    allTab: 'الكل',
    imageTab: 'الصور',
    pdfTab: 'PDF',
    ocrTab: 'المستندات',
    customTab: 'مخصص',
    templateBadge: 'قالب',
    customBadge: 'مخصص',
    stagesLabel: (count: number) => `${count} ${count === 1 ? 'مرحلة' : 'مراحل'}`,
    uploadPrompt: 'اضغط لاختيار ملف أو اسحبه هنا',
    uploadSub: 'يدعم الصور وملفات PDF والمستندات',
    changeFile: 'تغيير',
    runningSteps: 'جاري تشغيل خط المعالجة...',
    runFullWorkflow: 'تشغيل سير العمل',
    completedTitle: 'تم إنجاز خط المعالجة بنجاح!',
    downloadFinal: 'تنزيل النتيجة',
    openFile: 'فتح وعرض',
    runAgain: 'إعادة التشغيل',
    createNewPipeline: 'إنشاء سير عمل مخصص',
    pipelineNamePlaceholder: 'اسم سير العمل',
    pipelineDescPlaceholder: 'وصف موجز...',
    addStagePrompt: '+ إضافة مرحلة',
    savePipeline: 'حفظ سير العمل',
    cancel: 'إلغاء',
    intermediateResults: 'مخرجات المراحل',
  },
  hi: {
    badge: 'स्मार्ट वर्कफ़्लो',
    title: 'स्वचालित वर्कफ़्लो',
    subtitle: 'मल्टीपल टूल्स को एक स्वचालित 1-क्लिक पाइपलाइन में जोड़ें।',
    selectWorkflow: 'पाइपलाइन चुनें',
    choosePreset: 'वर्कफ़्लो प्रीसेट चुनें',
    allTab: 'सभी',
    imageTab: 'फ़ोटो',
    pdfTab: 'पीडीएफ',
    ocrTab: 'दस्तावेज़',
    customTab: 'कस्टम',
    templateBadge: 'टेम्पलेट',
    customBadge: 'कस्टम',
    stagesLabel: (count: number) => `${count} चरण`,
    uploadPrompt: 'फ़ाइल चुनने के लिए टैप करें या यहाँ छोड़ें',
    uploadSub: 'फ़ोटो, पीडीएफ और दस्तावेज़ों का त्वरित प्रसंस्करण',
    changeFile: 'बदलें',
    runningSteps: 'पाइपलाइन चल रही है...',
    runFullWorkflow: 'वर्कफ़्लो चलाएं',
    completedTitle: 'पाइपलाइन सफलतापूर्वक पूरी हुई!',
    downloadFinal: 'परिणाम डाउनलोड करें',
    openFile: 'खोलें और देखें',
    runAgain: 'पुनः चलाएं',
    createNewPipeline: 'नया कस्टम वर्कफ़्लो बनाएं',
    pipelineNamePlaceholder: 'वर्कफ़्लो का नाम (उदा. पासपोर्ट सूट)',
    pipelineDescPlaceholder: 'संक्षिप्त विवरण...',
    addStagePrompt: '+ अगला चरण जोड़ें',
    savePipeline: 'वर्कफ़्लो सहेजें',
    cancel: 'रद्द करें',
    intermediateResults: 'चरण पूर्वावलोकन',
  },
};

const EXTENDED_PRESET_WORKFLOWS: SavedWorkflow[] = [
  {
    id: 'wf_passport_studio',
    name: 'Government Exam & Passport Suite',
    description: 'Clean background ➔ Official 3.5x4.5cm Crop ➔ Compress to < 50KB.',
    category: 'image',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 's1', toolId: 'background-remover', toolName: 'Background Cutout & White Fill', options: { tolerance: 30, fillColor: '#ffffff' }, status: 'Waiting' },
      { id: 's2', toolId: 'passport-photo-maker', toolName: 'Official 3.5x4.5cm Crop', options: { width: 413, height: 531 }, status: 'Waiting' },
      { id: 's3', toolId: 'image-compressor', toolName: 'Target Compression (50 KB)', options: { targetKB: 48 }, status: 'Waiting' },
    ],
  },
  {
    id: 'wf_pdf_optimizer',
    name: 'Official PDF Document Package',
    description: 'High-ratio PDF compression ➔ Add Page Numbers ➔ Stamp Official Watermark.',
    category: 'pdf',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 'p1', toolId: 'compress-pdf', toolName: 'Smart PDF Compressor', options: { level: 'medium' }, status: 'Waiting' },
      { id: 'p2', toolId: 'pdf-page-numbers', toolName: 'Page Numbering', options: { format: 'Page X of Y' }, status: 'Waiting' },
      { id: 'p3', toolId: 'watermark-pdf', toolName: 'Confidential Watermark Stamp', options: { text: 'OFFICIAL DOCUMENT', opacity: 0.25 }, status: 'Waiting' },
    ],
  },
  {
    id: 'wf_web_image_polish',
    name: 'E-Commerce Product Image Suite',
    description: 'Square 1200px Resize ➔ Strip EXIF metadata ➔ Lossless WebP Export.',
    category: 'image',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 'w1', toolId: 'image-resizer', toolName: 'Square 1200px Resizing', options: { width: 1200, height: 1200, maintainAspect: true }, status: 'Waiting' },
      { id: 'w2', toolId: 'strip-metadata', toolName: 'Sanitize EXIF Privacy Tags', options: {}, status: 'Waiting' },
      { id: 'w3', toolId: 'image-converter', toolName: 'Convert to Next-Gen WebP', options: { targetFormat: 'image/webp' }, status: 'Waiting' },
    ],
  },
  {
    id: 'wf_ocr_text_extractor',
    name: 'Scan OCR & Document Text Pipeline',
    description: 'Clarity enhancement ➔ Neural OCR Character Extraction ➔ TXT Document.',
    category: 'ocr',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 'o1', toolId: 'image-resizer', toolName: 'High-DPI Clarity Scaler', options: { width: 1800, height: 2400 }, status: 'Waiting' },
      { id: 'o2', toolId: 'ocr-image-to-text', toolName: 'Neural OCR Text Extraction', options: { language: 'eng' }, status: 'Waiting' },
    ],
  },
];

const AVAILABLE_MODULES = [
  { id: 'background-remover', name: 'Background Cutout & White Fill', category: 'image', defaultOptions: { tolerance: 30, fillColor: '#ffffff' } },
  { id: 'passport-photo-maker', name: 'Passport 3.5x4.5cm Crop', category: 'image', defaultOptions: { width: 413, height: 531 } },
  { id: 'image-resizer', name: 'Image Resizer (1200px)', category: 'image', defaultOptions: { width: 1200, height: 1200, maintainAspect: true } },
  { id: 'image-compressor', name: 'Target Compressor (50 KB)', category: 'image', defaultOptions: { targetKB: 50 } },
  { id: 'image-converter', name: 'Convert to Lossless WebP', category: 'image', defaultOptions: { targetFormat: 'image/webp' } },
  { id: 'strip-metadata', name: 'Strip EXIF & Privacy Tags', category: 'image', defaultOptions: {} },
  { id: 'watermark-image', name: 'Image Watermark Stamp', category: 'image', defaultOptions: { text: 'Miftah Tools', opacity: 0.3 } },
  { id: 'compress-pdf', name: 'Smart PDF Stream Optimizer', category: 'pdf', defaultOptions: { level: 'medium' } },
  { id: 'pdf-page-numbers', name: 'Add Header/Footer Page Numbers', category: 'pdf', defaultOptions: { format: 'Page X of Y' } },
  { id: 'watermark-pdf', name: 'Official PDF Watermark Stamp', category: 'pdf', defaultOptions: { text: 'CONFIDENTIAL', opacity: 0.25 } },
  { id: 'ocr-image-to-text', name: 'Neural OCR Character Extraction', category: 'ocr', defaultOptions: { language: 'eng' } },
  { id: 'universal-markdown', name: 'Universal Document to Markdown', category: 'document', defaultOptions: {} },
];

export function WorkflowBuilder() {
  const { language, isRTL } = useI18n();
  const loc = WORKFLOW_LOCALES[language] || WORKFLOW_LOCALES.en;

  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'image' | 'pdf' | 'ocr' | 'custom'>('all');
  const [activeWorkflow, setActiveWorkflow] = useState<SavedWorkflow | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputPreview, setInputPreview] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [stepResults, setStepResults] = useState<{ stepId: string; stepName: string; resultBlob: Blob; dataUrl: string; size: number; details?: string }[]>([]);
  const [finalResultBlob, setFinalResultBlob] = useState<Blob | null>(null);
  const [finalDownloadUrl, setFinalDownloadUrl] = useState<string | null>(null);
  const [finalFilename, setFinalFilename] = useState<string>('');

  // Accordion / Expanded state: only 1 workflow is open at a time
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null);

  // Custom Pipeline Creator State
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState<'image' | 'pdf' | 'ocr'>('image');
  const [customSteps, setCustomSteps] = useState<{ toolId: string; toolName: string; options: any }[]>([
    { toolId: 'image-resizer', toolName: 'Image Resizer (1200px)', options: { width: 1200, height: 1200 } },
    { toolId: 'image-compressor', toolName: 'Target Compressor (100KB)', options: { targetKB: 100 } },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadWorkflows = async () => {
    const list = await getSavedWorkflows();
    const merged = [...EXTENDED_PRESET_WORKFLOWS];
    list.forEach((item) => {
      if (!merged.some((m) => m.id === item.id)) {
        merged.push(item);
      }
    });
    setWorkflows(merged);
    if (merged.length > 0 && !activeWorkflow) {
      setActiveWorkflow(merged[0]);
      setExpandedWorkflowId(merged[0].id);
    }
  };

  const handleSelectWorkflow = (wf: SavedWorkflow) => {
    setActiveWorkflow(wf);
    setExpandedWorkflowId(wf.id);
    setIsDropdownOpen(false);
    setInputFile(null);
    setInputPreview(null);
    setStepResults([]);
    setFinalResultBlob(null);
    setFinalDownloadUrl(null);
    setCurrentStepIndex(-1);
    triggerHaptic('light');
  };

  const handleToggleAccordion = (id: string) => {
    const target = workflows.find((w) => w.id === id);
    if (target) {
      if (expandedWorkflowId === id) {
        // keep it or allow toggle
        setExpandedWorkflowId(null);
      } else {
        setExpandedWorkflowId(id);
        setActiveWorkflow(target);
        setInputFile(null);
        setInputPreview(null);
        setStepResults([]);
        setFinalResultBlob(null);
        setFinalDownloadUrl(null);
        setCurrentStepIndex(-1);
      }
    }
    triggerHaptic('light');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInputFile(file);
      if (file.type.startsWith('image/')) {
        setInputPreview(URL.createObjectURL(file));
      } else {
        setInputPreview(null);
      }
      setStepResults([]);
      setFinalResultBlob(null);
      setFinalDownloadUrl(null);
      setCurrentStepIndex(-1);
      triggerHaptic('medium');
    }
  };

  const handleAddCustomStep = (moduleId: string) => {
    const mod = AVAILABLE_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;
    setCustomSteps((prev) => [
      ...prev,
      { toolId: mod.id, toolName: mod.name, options: { ...mod.defaultOptions } },
    ]);
    triggerHaptic('light');
  };

  const handleRemoveCustomStep = (index: number) => {
    setCustomSteps((prev) => prev.filter((_, i) => i !== index));
    triggerHaptic('light');
  };

  // Real Multi-Stage Pipeline Execution Engine
  const runWorkflowPipeline = async () => {
    if (!activeWorkflow || !inputFile) return;
    setIsRunning(true);
    setFinalDownloadUrl(null);
    setFinalResultBlob(null);
    setStepResults([]);
    const startTime = Date.now();
    const steps: WorkflowStep[] = activeWorkflow.steps.map((s) => ({ ...s, status: 'Waiting' }));
    let currentBlob: Blob = inputFile;
    let currentMime = inputFile.type || 'image/png';
    const recordedResults: { stepId: string; stepName: string; resultBlob: Blob; dataUrl: string; size: number; details?: string }[] = [];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      steps[i].status = 'Processing';
      setActiveWorkflow({ ...activeWorkflow, steps: [...steps] });

      try {
        const { outputBlob, details } = await executeConcreteStep(steps[i], currentBlob, inputFile.name);
        steps[i].status = 'Completed';
        currentBlob = outputBlob;
        currentMime = outputBlob.type || currentMime;

        const dataUrl = URL.createObjectURL(outputBlob);
        recordedResults.push({
          stepId: steps[i].id,
          stepName: steps[i].toolName,
          resultBlob: outputBlob,
          dataUrl,
          size: outputBlob.size,
          details,
        });
        setStepResults([...recordedResults]);
      } catch (err: any) {
        steps[i].status = 'Failed';
        steps[i].error = err.message || 'Stage execution failed';
        setActiveWorkflow({ ...activeWorkflow, steps: [...steps] });
        setIsRunning(false);
        triggerHaptic('error');

        await logActivity({
          toolId: activeWorkflow.id,
          toolName: `Workflow: ${activeWorkflow.name}`,
          category: activeWorkflow.category,
          fileName: inputFile.name,
          fileSize: inputFile.size,
          status: 'Failed',
          durationMs: Date.now() - startTime,
        });
        return;
      }
    }

    setStepResults(recordedResults);
    setFinalResultBlob(currentBlob);
    const finalUrl = URL.createObjectURL(currentBlob);
    setFinalDownloadUrl(finalUrl);

    let ext = 'png';
    if (currentBlob.type === 'application/pdf' || activeWorkflow.category === 'pdf') ext = 'pdf';
    else if (currentBlob.type === 'text/markdown' || activeWorkflow.category === 'document') ext = 'md';
    else if (currentBlob.type === 'image/webp') ext = 'webp';
    else if (currentBlob.type === 'image/jpeg') ext = 'jpg';
    else if (currentBlob.type === 'text/plain') ext = 'txt';

    const outName = `${inputFile.name.replace(/\.[^/.]+$/, '')}_${activeWorkflow.id}_processed.${ext}`;
    setFinalFilename(outName);
    setIsRunning(false);
    setCurrentStepIndex(-1);
    triggerHaptic('success');

    await saveProcessedFile({
      name: outName,
      size: currentBlob.size,
      type: currentBlob.type || `application/${ext}`,
      dataUrl: finalUrl,
      toolUsed: activeWorkflow.name,
      category: activeWorkflow.category,
    });

    await logActivity({
      toolId: activeWorkflow.id,
      toolName: `Workflow: ${activeWorkflow.name}`,
      category: activeWorkflow.category,
      fileName: inputFile.name,
      fileSize: inputFile.size,
      status: 'Completed',
      durationMs: Date.now() - startTime,
      resultSummary: `Executed ${steps.length} stages in ${Math.round((Date.now() - startTime) / 1000)}s`,
      downloadUrl: finalUrl,
    });
  };

  const executeConcreteStep = async (
    step: WorkflowStep,
    blob: Blob,
    origName: string
  ): Promise<{ outputBlob: Blob; details?: string }> => {
    const isImage = blob.type.startsWith('image/') || origName.match(/\.(png|jpe?g|webp|bmp)$/i);
    const isPdf = blob.type === 'application/pdf' || origName.endsWith('.pdf');

    if (step.toolId === 'background-remover' || step.toolId === 'passport-photo-maker') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = step.options.width || img.naturalWidth || 600;
          canvas.height = step.options.height || img.naturalHeight || 600;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return reject(new Error('Canvas context error'));

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          const bgR = data[0];
          const bgG = data[1];
          const bgB = data[2];
          const tolerance = step.options.tolerance || 40;

          for (let p = 0; p < data.length; p += 4) {
            const dist = Math.sqrt(
              (data[p] - bgR) ** 2 + (data[p + 1] - bgG) ** 2 + (data[p + 2] - bgB) ** 2
            );
            if (dist < tolerance) {
              if (step.options.fillColor === '#ffffff') {
                data[p] = 255;
                data[p + 1] = 255;
                data[p + 2] = 255;
                data[p + 3] = 255;
              } else {
                data[p + 3] = 0;
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);

          canvas.toBlob((b) => {
            if (b) resolve({ outputBlob: b, details: `${canvas.width}x${canvas.height}px` });
            else reject(new Error('Background processing failed'));
          }, 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(blob);
      });
    }

    if (step.toolId === 'image-resizer') {
      const file = new File([blob], origName, { type: blob.type || 'image/png' });
      const targetW = step.options.width || 1200;
      const targetH = step.options.height || 1200;
      const res = await resizeImage(file, targetW, targetH, step.options.maintainAspect ?? true, 'image/png', 0.95);
      return { outputBlob: res.blob, details: `${res.width}x${res.height}px` };
    }

    if (step.toolId === 'image-compressor') {
      const file = new File([blob], origName, { type: blob.type || 'image/jpeg' });
      const targetKB = step.options.targetKB || 50;
      const res = await compressImageToTargetKB(file, targetKB, 'image/jpeg');
      return { outputBlob: res.blob, details: `${res.finalKB} KB` };
    }

    if (step.toolId === 'image-converter') {
      const file = new File([blob], origName, { type: blob.type || 'image/png' });
      const targetFormat = (step.options.targetFormat as any) || 'image/webp';
      const res = await convertImage(file, targetFormat, 0.92);
      return { outputBlob: res.blob, details: targetFormat.split('/')[1].toUpperCase() };
    }

    if (step.toolId === 'strip-metadata') {
      const file = new File([blob], origName, { type: blob.type || 'image/jpeg' });
      const res = await stripExifAndMetadata(file);
      return { outputBlob: res.blob, details: 'Metadata Cleaned' };
    }

    if (step.toolId === 'watermark-image') {
      const file = new File([blob], origName, { type: blob.type || 'image/png' });
      const res = await watermarkImage(file, step.options.text || 'Miftah Tools', step.options.opacity || 0.4);
      return { outputBlob: res.blob, details: 'Watermark Stamped' };
    }

    if (step.toolId === 'compress-pdf' && (isPdf || blob.type === 'application/pdf')) {
      const buffer = await blob.arrayBuffer();
      const res = await compressPdfAdvanced(buffer, { level: step.options.level || 'medium' });
      const outBlob = new Blob([res.bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      return { outputBlob: outBlob, details: `${res.savedPercentage.toFixed(0)}% Saved` };
    }

    if (step.toolId === 'pdf-page-numbers' && (isPdf || blob.type === 'application/pdf')) {
      const buffer = await blob.arrayBuffer();
      const resBytes = await addPageNumbers(buffer, 'bottom-center', step.options.format || 'Page X of Y');
      const outBlob = new Blob([resBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      return { outputBlob: outBlob, details: 'Numbered' };
    }

    if (step.toolId === 'watermark-pdf' && (isPdf || blob.type === 'application/pdf')) {
      const buffer = await blob.arrayBuffer();
      const resBytes = await watermarkPdf(buffer, step.options.text || 'CONFIDENTIAL', step.options.opacity || 0.25);
      const outBlob = new Blob([resBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      return { outputBlob: outBlob, details: 'Stamped' };
    }

    if (step.toolId === 'ocr-image-to-text') {
      const res = await runOcr(blob, step.options.language || 'eng');
      const txtBlob = new Blob([res.text], { type: 'text/plain;charset=utf-8' });
      return { outputBlob: txtBlob, details: `${res.text.length} chars` };
    }

    if (step.toolId === 'universal-markdown') {
      const file = new File([blob], origName, { type: blob.type });
      const res = await universalMarkItDown(file, { includeMetadata: true });
      const mdBlob = new Blob([res.markdown], { type: 'text/markdown;charset=utf-8' });
      return { outputBlob: mdBlob, details: `${res.wordCount} words` };
    }

    return { outputBlob: blob, details: 'Completed' };
  };

  const handleDownloadFinal = async () => {
    if (!finalResultBlob || !finalFilename) return;
    triggerHaptic('light');
    await downloadSingleFile(finalResultBlob, finalFilename);
  };

  const handleOpenFinal = async () => {
    if (!finalResultBlob || !finalFilename) return;
    triggerHaptic('light');
    await openDownloadedFile({ name: finalFilename, blob: finalResultBlob });
  };

  const handleSaveCustomWorkflow = async () => {
    if (!customName.trim()) return;
    const newWf: SavedWorkflow = {
      id: 'custom_wf_' + Date.now(),
      name: customName.trim(),
      description: customDesc.trim() || 'Custom automated workflow',
      category: customCategory,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTemplate: false,
      steps: customSteps.map((s, idx) => ({
        id: `cstep_${idx}_${Date.now()}`,
        toolId: s.toolId,
        toolName: s.toolName,
        options: s.options,
        status: 'Waiting',
      })),
    };

    await saveWorkflow(newWf);
    await loadWorkflows();
    setActiveWorkflow(newWf);
    setExpandedWorkflowId(newWf.id);
    setIsCreatingCustom(false);
    triggerHaptic('success');
  };

  const filteredWorkflows = workflows.filter((wf) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return !wf.isTemplate;
    return wf.category === selectedCategory;
  });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. Header with Compact Pill Controls */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-black border border-brand-200 dark:border-brand-800">
          <Workflow className="w-3.5 h-3.5" />
          <span>{loc.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {loc.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {loc.subtitle}
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {[
            { id: 'all', label: loc.allTab },
            { id: 'image', label: loc.imageTab },
            { id: 'pdf', label: loc.pdfTab },
            { id: 'ocr', label: loc.ocrTab },
            { id: 'custom', label: loc.customTab },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.id as any);
                  triggerHaptic('light');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Dropdown / Accordion Workflow Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Dropdown Header Trigger */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {loc.selectWorkflow}
              </h3>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeWorkflow?.name || loc.choosePreset}</span>
                {activeWorkflow && (
                  <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-[10px] font-bold">
                    {loc.stagesLabel(activeWorkflow.steps.length)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className="px-3 py-1.5 rounded-xl border border-dashed border-brand-300 dark:border-brand-700 hover:border-brand-500 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{loc.createNewPipeline}</span>
            </button>
          </div>
        </div>

        {/* Custom Pipeline Creator Drawer */}
        {isCreatingCustom && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-brand-300 dark:border-brand-800 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-brand-600" />
                <span>{loc.createNewPipeline}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder={loc.pipelineNamePlaceholder}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-hidden"
              />
              <input
                type="text"
                placeholder={loc.pipelineDescPlaceholder}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-hidden"
              />
            </div>

            {/* Stages Builder */}
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {customSteps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-bold shadow-2xs"
                  >
                    <span className="text-brand-600 font-mono text-[10px]">{sIdx + 1}.</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {step.toolName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomStep(sIdx)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCustomStep(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-brand-600 dark:text-brand-400 cursor-pointer focus:ring-2 focus:ring-brand-500 outline-hidden"
                  defaultValue=""
                >
                  <option value="" disabled>{loc.addStagePrompt}</option>
                  {AVAILABLE_MODULES.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      + {mod.name} ({mod.category.toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSaveCustomWorkflow}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                >
                  {loc.savePipeline}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accordion List of Workflows: Only 1 expands at a time */}
        <div className="space-y-2 pt-1">
          {filteredWorkflows.map((wf) => {
            const isSelected = activeWorkflow?.id === wf.id;
            const isExpanded = expandedWorkflowId === wf.id;

            return (
              <div
                key={wf.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'border-brand-500/80 bg-brand-50/30 dark:bg-brand-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Accordion Header Row */}
                <div
                  onClick={() => handleToggleAccordion(wf.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {wf.category === 'pdf' ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : wf.category === 'ocr' ? (
                        <Cpu className="w-3.5 h-3.5" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        <span className="truncate">{wf.name}</span>
                        {wf.isTemplate ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 shrink-0">
                            {loc.templateBadge}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 shrink-0">
                            {loc.customBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {wf.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {loc.stagesLabel(wf.steps.length)}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-brand-600' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Stage Sequence: Shown only for the active accordion */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-200">
                    {/* Compact Horizontal Stages Flow */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {wf.steps.map((step, sIdx) => {
                        const isCurrent = isRunning && isSelected && currentStepIndex === sIdx;
                        const isDone = isSelected && step.status === 'Completed';

                        return (
                          <React.Fragment key={step.id}>
                            <div
                              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-2xs ${
                                isDone
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                                  : isCurrent
                                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 animate-pulse ring-2 ring-amber-500/20'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : isCurrent
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : sIdx + 1}
                              </span>
                              <span className="truncate max-w-[160px] sm:max-w-none">{step.toolName}</span>
                            </div>

                            {sIdx < wf.steps.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Streamlined File Upload & 1-Click Execution Studio */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
        {!inputFile ? (
          <div
            onClick={() => document.getElementById('pipeline-file-input')?.click()}
            className="p-10 sm:p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-3 hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 transition-all cursor-pointer group"
          >
            <input
              id="pipeline-file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
                {loc.uploadPrompt}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {loc.uploadSub}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Selected File Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {inputFile.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatBytes(inputFile.size)}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{inputFile.type.split('/')[1] || 'FILE'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInputFile(null);
                  setFinalDownloadUrl(null);
                  setFinalResultBlob(null);
                  setStepResults([]);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              >
                {loc.changeFile}
              </button>
            </div>

            {/* Run Button */}
            {!finalDownloadUrl && (
              <button
                type="button"
                onClick={runWorkflowPipeline}
                disabled={isRunning}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-sm sm:text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loc.runningSteps}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{loc.runFullWorkflow} ({activeWorkflow?.steps.length || 0} Stages)</span>
                  </>
                )}
              </button>
            )}

            {/* Intermediate Output Previews */}
            {stepResults.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>{loc.intermediateResults}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stepResults.map((res, index) => (
                    <div
                      key={res.stepId}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {index + 1}. {res.stepName}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {formatBytes(res.size)}
                        </span>
                      </div>

                      {res.details && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {res.details}
                        </div>
                      )}

                      {res.resultBlob.type.startsWith('image/') && (
                        <div className="h-24 rounded-xl overflow-hidden bg-slate-200/50 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                          <img
                            src={res.dataUrl}
                            alt={res.stepName}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Final Screen */}
            {finalDownloadUrl && finalResultBlob && (
              <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-black text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{loc.completedTitle}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs font-mono font-bold">
                    {formatBytes(finalResultBlob.size)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadFinal}
                    className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{loc.downloadFinal}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenFinal}
                    className="py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-brand-600" />
                    <span>{loc.openFile}</span>
                  </button>
                </div>

                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={runWorkflowPipeline}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{loc.runAgain}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
