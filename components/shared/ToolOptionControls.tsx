'use client';

import React, { useRef } from 'react';
import { ToolDefinition } from '@/lib/types';
import {
  Sliders,
  Zap,
  Layers,
  RotateCw,
  Stamp,
  Hash,
  Scissors,
  FileImage,
  Sparkles,
  Maximize2,
  Lock,
  Unlock,
  Settings2,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
} from 'lucide-react';
import { formatBytes, formatBytesDual } from '@/lib/utils/formatters';
import { useI18n } from '@/lib/i18n/i18n-context';

interface ToolOptionControlsProps {
  tool: ToolDefinition;
  files: File[];
  options: Record<string, any>;
  onOptionsChange: (newOptions: Record<string, any>) => void;
}

export function ToolOptionControls({
  tool,
  files,
  options,
  onOptionsChange,
}: ToolOptionControlsProps) {
  const { t, language, isRTL } = useI18n();
  const headerImgInputRef = useRef<HTMLInputElement>(null);
  const footerImgInputRef = useRef<HTMLInputElement>(null);
  const watermarkImgInputRef = useRef<HTMLInputElement>(null);

  const updateOption = (key: string, val: any) => {
    onOptionsChange({ ...options, [key]: val });
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const isImageCompress = tool.id.includes('compress') && tool.category === 'image';
  const isImageResize = tool.id.includes('resize') && tool.category === 'image';
  const isImageConvert = (tool.id.includes('to-') || tool.id.includes('convert')) && tool.category === 'image';
  const isPdfCompress = tool.id.includes('compress') && tool.category === 'pdf';
  const isPdfSplit = (tool.id.includes('split') || tool.id.includes('extract')) && tool.category === 'pdf';
  const isPdfRotate = tool.id.includes('rotate') && tool.category === 'pdf';
  const isPdfWatermark = tool.id.includes('watermark');
  const isPdfPageNumbers = tool.id.includes('page-numbers') || tool.id.includes('number');
  const isImageToPdf = tool.id.includes('image-to-pdf') || tool.id.includes('images-to-pdf');
  const isPdfHeaderFooter =
    tool.id.includes('header') ||
    tool.id.includes('footer') ||
    tool.slug.includes('header') ||
    tool.slug.includes('footer');

  const showTargetSizeSection =
    isImageCompress ||
    isPdfCompress ||
    isImageResize ||
    isImageConvert ||
    tool.category === 'compress' ||
    tool.id.includes('size') ||
    tool.id.includes('optimize');

  // Handle image upload to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, optionKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateOption(optionKey, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Multilingual Strings
  const L = {
    settingsTitle: {
      en: 'Tool Customization & Target Size Settings',
      ur: 'ٹول سیٹنگز اور مطلوبہ سائز کے کنٹرولز',
      ar: 'إعدادات تخصيص الأداة والحجم المستهدف',
      hi: 'टूल कस्टमाइज़یشن व लक्षित साइज़ सेटिंग्स',
    }[language] || 'Tool Customization & Target Size Settings',
    selectedFiles: {
      en: `Selected: ${files.length} file(s) • Total: ${formatBytesDual(totalBytes)}`,
      ur: `منتخب شدہ: ${files.length} فائلیں • کل سائز: ${formatBytesDual(totalBytes)}`,
      ar: `المحدد: ${files.length} ملف • الإجمالي: ${formatBytesDual(totalBytes)}`,
      hi: `चयनित: ${files.length} फ़ाइलें • कुल: ${formatBytesDual(totalBytes)}`,
    }[language] || `Selected: ${files.length} file(s)`,
    targetSizePreset: {
      en: '🎯 Target File Size (Choose KB / MB Preset or Custom):',
      ur: '🎯 مطلوبہ فائل سائز (KB یا MB پریسیٹ یا کسٹم منتخب کریں):',
      ar: '🎯 الحجم المستهدف (اختر بالكيلوبايت KB أو الميجابايت MB):',
      hi: '🎯 लक्षित फ़ाइल साइज़ (KB या MB प्रीसेट चुनें या कस्टम दर्ज करें):',
    }[language] || 'Target File Size:',
    customTarget: {
      en: 'Custom Size',
      ur: 'اپنی مرضی کا سائز',
      ar: 'حجم مخصص',
      hi: 'कस्टम साइज़',
    }[language] || 'Custom Size',
    enterTargetValue: {
      en: 'Enter target value (e.g. 100, 500, 2):',
      ur: 'مطلوبہ سائز نمبر لکھیں (مثلاً 100، 500، 2):',
      ar: 'أدخل الحجم المطلوب (مثال: 100، 500، 2):',
      hi: 'लक्षित साइज़ मान दर्ज करें (उदा. 100, 500, 2):',
    }[language] || 'Enter target value:',
    compressionStrength: {
      en: 'Compression Strength:',
      ur: 'کمپریشن کی طاقت:',
      ar: 'قوة الضغط:',
      hi: 'कंप्रेशन की तीव्रता:',
    }[language] || 'Compression Strength:',
    compressed: {
      en: 'Compressed',
      ur: 'کمپریسڈ',
      ar: 'مضغوط',
      hi: 'कंप्रेस किया गया',
    }[language] || 'Compressed',
    quality: {
      en: 'Quality',
      ur: 'کوالٹی',
      ar: 'الجودة',
      hi: 'क्वालिटी',
    }[language] || 'Quality',
    maxCompression: {
      en: 'Maximum Compression (Smaller KB)',
      ur: 'زیادہ سے زیادہ کمپریشن (چھوٹا سائز)',
      ar: 'أقصى ضغط (حجم أصغر)',
      hi: 'अधिकतम कंप्रेशन (छोटा KB साइज़)',
    }[language] || 'Max Compression',
    balanced: {
      en: 'Balanced (Recommended)',
      ur: 'متوازن (تجویز کردہ)',
      ar: 'متوازن (موصى به)',
      hi: 'संतुलित (सुझाया गया)',
    }[language] || 'Balanced',
    highQuality: {
      en: 'High Quality (Preserve detail)',
      ur: 'اعلیٰ کوالٹی (تفصیلات محفوظ)',
      ar: 'جودة عالية (الحفاظ على التفاصيل)',
      hi: 'उच्च गुणवत्ता (डिटेल्स सुरक्षित)',
    }[language] || 'High Quality',
    outputFormat: {
      en: 'Output Format:',
      ur: 'آؤٹ پٹ فارمیٹ:',
      ar: 'صيغة الإخراج:',
      hi: 'आउटपुट फॉर्मेट:',
    }[language] || 'Output Format:',
    resolutionScale: {
      en: 'Resolution Scale:',
      ur: 'ریزولوشن اسکیل:',
      ar: 'مقياس الدقة:',
      hi: 'रिज़ॉल्यूशन स्केल:',
    }[language] || 'Resolution Scale:',
    headerFooterTitle: {
      en: 'Header & Footer Customization (Text & Image Logo)',
      ur: 'ہیڈر اور فوٹر کی ترتیبات (متن اور تصویری لوگو)',
      ar: 'تخصيص الرأس والتذييل (النص وشعار الصورة)',
      hi: 'हेडर व फ़ूटर कस्टमाइज़ेशन (टेक्स्ट व इमेज लोगो)',
    }[language] || 'Header & Footer Customization',
    headerTextLabel: {
      en: 'Header Text (Use {page}, {total}, {date}):',
      ur: 'ہیڈر کا متن ({page}، {total}، {date} استعمال کریں):',
      ar: 'نص الترويسة (استخدم {page}، {total}، {date}):',
      hi: 'हेडर टेक्स्ट ({page}, {total}, {date} का उपयोग करें):',
    }[language] || 'Header Text:',
    footerTextLabel: {
      en: 'Footer Text (Use {page}, {total}, {date}):',
      ur: 'فوٹر کا متن ({page}، {total}، {date} استعمال کریں):',
      ar: 'نص التذييل (استخدم {page}، {total}، {date}):',
      hi: 'फ़ूटर टेक्स्ट ({page}, {total}, {date} का उपयोग करें):',
    }[language] || 'Footer Text:',
    headerImageLabel: {
      en: 'Header Image / Logo Stamp:',
      ur: 'ہیڈر امیج / لوگو اسٹیمپ:',
      ar: 'صورة الترويسة / الشعار:',
      hi: 'हेडर इमेज / लोगो स्टाम्प:',
    }[language] || 'Header Image / Logo:',
    footerImageLabel: {
      en: 'Footer Image / Stamp / Signature:',
      ur: 'فوٹر امیج / مہر / دستخط:',
      ar: 'صورة التذييل / الختم / التوقيع:',
      hi: 'फ़ूटर इमेज / स्टाम्प / हस्ताक्षर:',
    }[language] || 'Footer Image / Signature:',
    uploadLogo: {
      en: 'Upload Image Logo (PNG/JPG)',
      ur: 'لوگو امیج اپلوڈ کریں (PNG/JPG)',
      ar: 'تحميل شعار الصورة (PNG/JPG)',
      hi: 'लोगो इमेज अपलोड करें (PNG/JPG)',
    }[language] || 'Upload Image Logo',
    removeLogo: {
      en: 'Remove',
      ur: 'ہٹائیں',
      ar: 'إزالة',
      hi: 'हटाएं',
    }[language] || 'Remove',
    alignment: {
      en: 'Alignment:',
      ur: 'الائنمنٹ (پوزیشن):',
      ar: 'المحاذاة:',
      hi: 'अलाइनमेंट:',
    }[language] || 'Alignment:',
    fontSize: {
      en: 'Font Size:',
      ur: 'فونٹ سائز:',
      ar: 'حجم الخط:',
      hi: 'फ़ॉन्ट साइज़:',
    }[language] || 'Font Size:',
    fontColor: {
      en: 'Font Color:',
      ur: 'فونٹ کا رنگ:',
      ar: 'لون الخط:',
      hi: 'फ़ॉन्ट रंग:',
    }[language] || 'Font Color:',
    logoWidth: {
      en: 'Logo Width (px):',
      ur: 'لوگو کی چوڑائی (px):',
      ar: 'عرض الشعار (بكسل):',
      hi: 'लोगो चौड़ाई (px):',
    }[language] || 'Logo Width:',
    pageRangeLabel: {
      en: 'Apply to Pages:',
      ur: 'صفحات پر لاگو کریں:',
      ar: 'تطبيق على الصفحات:',
      hi: 'किन पन्नों पर लागू करें:',
    }[language] || 'Apply to Pages:',
    allPages: {
      en: 'All Pages',
      ur: 'تمام صفحات',
      ar: 'جميع الصفحات',
      hi: 'सभी पेज',
    }[language] || 'All Pages',
    firstPageOnly: {
      en: 'First Page Only',
      ur: 'صرف پہلا صفحہ',
      ar: 'الصفحة الأولى فقط',
      hi: 'केवल पहला पेज',
    }[language] || 'First Page Only',
    exceptFirstPage: {
      en: 'All Except First Page',
      ur: 'پہلے صفحے کے علاوہ تمام',
      ar: 'الكل ما عدا الصفحة الأولى',
      hi: 'पहले पेज को छोड़कर सभी',
    }[language] || 'Except First Page',
    watermarkType: {
      en: 'Watermark Stamp Type:',
      ur: 'واٹر مارک کی قسم:',
      ar: 'نوع العلامة المائية:',
      hi: 'वॉटरमार्क का प्रकार:',
    }[language] || 'Watermark Type:',
    watermarkText: {
      en: 'Text Watermark',
      ur: 'ٹیکسٹ واٹر مارک',
      ar: 'علامة نصية',
      hi: 'टेक्स्ट वॉटरमार्क',
    }[language] || 'Text Watermark',
    watermarkImage: {
      en: 'Image / Logo Stamp',
      ur: 'امیج / لوگو اسٹیمپ',
      ar: 'شعار / صورة مائية',
      hi: 'इमेज / लोगो स्टाम्प',
    }[language] || 'Image Watermark',
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900 dark:text-white">
          <Settings2 className="w-4 h-4 text-brand-500" />
          <span>{L.settingsTitle}</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
          {L.selectedFiles}
        </span>
      </div>

      {/* 1. UNIVERSAL MB & KB TARGET SIZE CONTROLLER */}
      {showTargetSizeSection && (
        <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{L.targetSizePreset}</span>
            </label>
            <span className="text-xs font-mono font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
              {options.targetKb
                ? `${options.targetKb >= 1000 ? (options.targetKb / 1024).toFixed(1) + ' MB' : options.targetKb + ' KB'} Target`
                : 'Adaptive Quality'}
            </span>
          </div>

          {/* Quick KB & MB Target Chips */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: '20 KB', kb: 20 },
              { label: '50 KB', kb: 50 },
              { label: '100 KB', kb: 100 },
              { label: '200 KB', kb: 200 },
              { label: '500 KB', kb: 500 },
              { label: '1 MB', kb: 1024 },
              { label: '2 MB', kb: 2048 },
              { label: '5 MB', kb: 5120 },
              { label: '10 MB', kb: 10240 },
              { label: '25 MB', kb: 25600 },
              { label: '50 MB', kb: 51200 },
              { label: 'Auto', kb: 0 },
            ].map((preset) => {
              const isSelected = preset.kb === 0 ? !options.targetKb : options.targetKb === preset.kb;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (preset.kb === 0) {
                      updateOption('targetKb', null);
                      updateOption('targetSizeLimit', 'auto');
                      updateOption('quality', 0.8);
                    } else {
                      updateOption('targetKb', preset.kb);
                      updateOption('targetSizeLimit', preset.kb >= 1024 ? `${Math.round(preset.kb / 1024)}mb` : `${preset.kb}kb`);
                      if (totalBytes > 0) {
                        const targetQuality = Math.max(0.15, Math.min(0.95, (preset.kb * 1024) / totalBytes));
                        updateOption('quality', targetQuality);
                      }
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-black border transition-all active:scale-95 text-center ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 ring-2 ring-brand-500/30'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Numeric KB / MB Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              {L.enterTargetValue}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 350"
                value={options.customNumValue || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateOption('customNumValue', e.target.value);
                  if (!isNaN(val) && val > 0) {
                    const unit = options.customNumUnit || 'kb';
                    const targetKb = unit === 'mb' ? val * 1024 : val;
                    updateOption('targetKb', targetKb);
                    updateOption('targetSizeLimit', unit === 'mb' ? `${val}mb` : `${val}kb`);
                    if (totalBytes > 0) {
                      updateOption('quality', Math.max(0.15, Math.min(0.95, (targetKb * 1024) / totalBytes)));
                    }
                  }
                }}
                className="w-28 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
                {['kb', 'mb'].map((unit) => {
                  const isUnitSelected = (options.customNumUnit || 'kb') === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        updateOption('customNumUnit', unit);
                        const val = parseFloat(options.customNumValue);
                        if (!isNaN(val) && val > 0) {
                          const targetKb = unit === 'mb' ? val * 1024 : val;
                          updateOption('targetKb', targetKb);
                          updateOption('targetSizeLimit', unit === 'mb' ? `${val}mb` : `${val}kb`);
                        }
                      }}
                      className={`px-3 py-1 text-xs font-extrabold uppercase rounded-lg transition-all ${
                        isUnitSelected ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPRESSION QUALITY SLIDER */}
      {(isImageCompress || isPdfCompress) && (
        <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>{L.compressionStrength}</span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-extrabold text-sm">
              {Math.round((1 - (options.quality ?? 0.75)) * 100)}% {L.compressed} ({Math.round((options.quality ?? 0.75) * 100)}% {L.quality})
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.95}
            step={0.05}
            value={options.quality ?? 0.75}
            onChange={(e) => {
              updateOption('quality', parseFloat(e.target.value));
              updateOption('targetKb', null);
            }}
            className="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono font-medium">
            <span>{L.maxCompression}</span>
            <span>{L.balanced}</span>
            <span>{L.highQuality}</span>
          </div>
        </div>
      )}

      {/* 3. ADVANCED HEADER & FOOTER STUDIO CONTROLS (TEXT + IMAGE LOGO) */}
      {isPdfHeaderFooter && (
        <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-slate-800/90 border-2 border-brand-500/30 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-black text-brand-600 dark:text-brand-400">
            <Stamp className="w-4 h-4" />
            <span>{L.headerFooterTitle}</span>
          </div>

          {/* Header Controls */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-500" />
              <span>{L.headerTextLabel}</span>
            </h4>
            <input
              type="text"
              placeholder="e.g. OFFICIAL REPORT • {date} • Page {page} of {total}"
              value={options.headerText ?? 'OFFICIAL DOCUMENT'}
              onChange={(e) => updateOption('headerText', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            />

            {/* Header Image Logo Upload */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{L.headerImageLabel}</span>
                {options.headerImage && (
                  <button
                    type="button"
                    onClick={() => updateOption('headerImage', null)}
                    className="text-rose-500 hover:underline text-[11px] font-bold"
                  >
                    {L.removeLogo}
                  </button>
                )}
              </label>
              <input
                ref={headerImgInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleImageFileChange(e, 'headerImage')}
              />
              {options.headerImage ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={options.headerImage}
                    alt="Header Logo"
                    className="h-10 w-auto max-w-[80px] object-contain rounded-md border"
                  />
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      ✓ Image Logo Attached
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{L.logoWidth}</span>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={options.headerImageWidth || 60}
                        onChange={(e) => updateOption('headerImageWidth', parseInt(e.target.value))}
                        className="w-24 accent-brand-600"
                      />
                      <span className="text-[10px] font-mono">{options.headerImageWidth || 60}px</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => headerImgInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-brand-500" />
                  <span>{L.uploadLogo}</span>
                </button>
              )}
            </div>

            {/* Header Alignment & Color */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{L.alignment}</label>
                <div className="flex rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
                  {(['left', 'center', 'right'] as const).map((al) => (
                    <button
                      key={al}
                      type="button"
                      onClick={() => updateOption('headerAlign', al)}
                      className={`flex-1 py-1 text-xs font-bold capitalize rounded-lg transition-all ${
                        (options.headerAlign || 'center') === al
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      {al}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{L.fontSize}</label>
                <select
                  value={options.fontSize || 10}
                  onChange={(e) => updateOption('fontSize', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz} pt
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-500">{L.fontColor}</label>
                <input
                  type="color"
                  value={options.fontColor || '#1e293b'}
                  onChange={(e) => updateOption('fontColor', e.target.value)}
                  className="w-full h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-500" />
              <span>{L.footerTextLabel}</span>
            </h4>
            <input
              type="text"
              placeholder="e.g. Confidential Document • Page {page} of {total}"
              value={options.footerText ?? 'Page {page} of {total}'}
              onChange={(e) => updateOption('footerText', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            />

            {/* Footer Image Stamp Upload */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{L.footerImageLabel}</span>
                {options.footerImage && (
                  <button
                    type="button"
                    onClick={() => updateOption('footerImage', null)}
                    className="text-rose-500 hover:underline text-[11px] font-bold"
                  >
                    {L.removeLogo}
                  </button>
                )}
              </label>
              <input
                ref={footerImgInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleImageFileChange(e, 'footerImage')}
              />
              {options.footerImage ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={options.footerImage}
                    alt="Footer Logo"
                    className="h-10 w-auto max-w-[80px] object-contain rounded-md border"
                  />
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      ✓ Footer Image Stamp Attached
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{L.logoWidth}</span>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={options.footerImageWidth || 60}
                        onChange={(e) => updateOption('footerImageWidth', parseInt(e.target.value))}
                        className="w-24 accent-brand-600"
                      />
                      <span className="text-[10px] font-mono">{options.footerImageWidth || 60}px</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => footerImgInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-brand-500" />
                  <span>{L.uploadLogo}</span>
                </button>
              )}
            </div>

            {/* Footer Alignment */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{L.alignment}</label>
                <div className="flex rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
                  {(['left', 'center', 'right'] as const).map((al) => (
                    <button
                      key={al}
                      type="button"
                      onClick={() => updateOption('footerAlign', al)}
                      className={`flex-1 py-1 text-xs font-bold capitalize rounded-lg transition-all ${
                        (options.footerAlign || 'center') === al
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      {al}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{L.pageRangeLabel}</label>
                <select
                  value={options.pageRange || 'all'}
                  onChange={(e) => updateOption('pageRange', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="all">{L.allPages}</option>
                  <option value="first">{L.firstPageOnly}</option>
                  <option value="except-first">{L.exceptFirstPage}</option>
                  <option value="odd">Odd Pages Only</option>
                  <option value="even">Even Pages Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. WATERMARK CONTROLS (TEXT OR IMAGE STAMP) */}
      {isPdfWatermark && (
        <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-rose-500" />
              <span>{L.watermarkType}</span>
            </span>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => updateOption('watermarkType', 'text')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  (options.watermarkType || 'text') === 'text'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {L.watermarkText}
              </button>
              <button
                type="button"
                onClick={() => updateOption('watermarkType', 'image')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  options.watermarkType === 'image'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {L.watermarkImage}
              </button>
            </div>
          </div>

          {options.watermarkType === 'image' ? (
            <div className="space-y-3">
              <input
                ref={watermarkImgInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleImageFileChange(e, 'watermarkImage')}
              />
              {options.watermarkImage ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <img
                    src={options.watermarkImage}
                    alt="Watermark Stamp"
                    className="h-14 w-auto max-w-[120px] object-contain rounded-lg border"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Watermark Logo Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => updateOption('watermarkImage', null)}
                      className="text-xs text-rose-500 underline block"
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => watermarkImgInputRef.current?.click()}
                  className="w-full py-4 px-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <UploadCloud className="w-5 h-5 text-rose-500" />
                  <span>Upload Watermark Logo / Stamp (PNG/JPG)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Watermark Text:</label>
                <input
                  type="text"
                  value={options.text ?? 'CONFIDENTIAL'}
                  onChange={(e) => updateOption('text', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Opacity ({Math.round((options.opacity ?? 0.3) * 100)}%):
                </label>
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.05}
                  value={options.opacity ?? 0.3}
                  onChange={(e) => updateOption('opacity', parseFloat(e.target.value))}
                  className="w-full accent-rose-600 mt-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. PDF ROTATE CONTROLS */}
      {isPdfRotate && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rotation Angle:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '90', label: '90° Clockwise' },
              { id: '180', label: '180° Flip' },
              { id: '270', label: '270° Counter' },
            ].map((deg) => (
              <button
                key={deg.id}
                type="button"
                onClick={() => updateOption('angle', deg.id)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                  (options.angle || '90') === deg.id
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{deg.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. PDF SPLIT & EXTRACT CONTROLS */}
      {isPdfSplit && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Split Method:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Split All Pages' },
                { id: 'range', label: 'Specific Page Range' },
                { id: 'odd-even', label: 'Odd / Even' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateOption('splitMode', m.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border ${
                    (options.splitMode || 'all') === m.id
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {options.splitMode === 'range' && (
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Page Range (e.g. 1-3, 5, 8-10):
              </label>
              <input
                type="text"
                placeholder="1-3, 5"
                value={options.pageRange || ''}
                onChange={(e) => updateOption('pageRange', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          )}
        </div>
      )}

      {/* 7. IMAGE TO PDF CONTROLS */}
      {isImageToPdf && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Orientation:</label>
            <select
              value={options.orientation || 'portrait'}
              onChange={(e) => updateOption('orientation', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Margin:</label>
            <select
              value={options.margin || 'none'}
              onChange={(e) => updateOption('margin', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="none">No Margin</option>
              <option value="small">Small Margin</option>
              <option value="large">Big Margin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Size:</label>
            <select
              value={options.pageSize || 'a4'}
              onChange={(e) => updateOption('pageSize', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="a4">A4 Standard</option>
              <option value="letter">US Letter</option>
              <option value="fit">Fit to Image</option>
            </select>
          </div>
        </div>
      )}

      {/* Fallback Custom Tool Options if tool defined them */}
      {tool.options && tool.options.length > 0 && !isImageCompress && !isPdfCompress && !isPdfHeaderFooter && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {tool.options.map((opt) => (
            <div key={opt.id} className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {opt.label}
              </label>
              {opt.type === 'select' && (
                <select
                  value={options[opt.id] || opt.defaultValue}
                  onChange={(e) => updateOption(opt.id, e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {opt.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              {opt.type === 'text' && (
                <input
                  type="text"
                  value={options[opt.id] ?? opt.defaultValue ?? ''}
                  placeholder={opt.placeholder}
                  onChange={(e) => updateOption(opt.id, e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
