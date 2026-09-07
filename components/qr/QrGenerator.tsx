'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Phone,
  PhoneCall,
  Globe,
  MessageSquare,
  Sparkles,
  Check,
  Copy,
  Share2,
  Wifi,
  FileText,
  Mail,
  Palette,
  Eye,
  Smartphone,
} from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';
import { triggerHaptic } from '@/lib/motion/motion-system';
import { shareFileNative, isNativeAndroid } from '@/lib/native/android-bridge';
import { useI18n } from '@/lib/i18n/i18n-context';

export type QrType = 'phone' | 'whatsapp' | 'url' | 'text' | 'wifi' | 'sms' | 'email';

export function QrGenerator() {
  const { language, isRTL } = useI18n();

  // Mode Selection - Default to Direct Phone Number as requested
  const [type, setType] = useState<QrType>('phone');

  // Input States
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+91 98765 43210');
  const [whatsappMsg, setWhatsappMsg] = useState<string>('Hello! I scanned your QR code.');
  const [url, setUrl] = useState<string>('https://jamil8655.github.io/nexora-tools');
  const [text, setText] = useState<string>('Miftah Tools — 220+ Client-Side Digital Utilities');
  const [wifiSsid, setWifiSsid] = useState<string>('MyHome_WiFi');
  const [wifiPass, setWifiPass] = useState<string>('SecurePassword123');
  const [wifiSec, setWifiSec] = useState<string>('WPA');
  const [smsNumber, setSmsNumber] = useState<string>('+91 98765 43210');
  const [smsMsg, setSmsMsg] = useState<string>('Hi there!');
  const [emailTo, setEmailTo] = useState<string>('contact@miftahtools.app');
  const [emailSubj, setEmailSubj] = useState<string>('Inquiry via QR Code');

  // Styling
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrSize, setQrSize] = useState<number>(320);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Compute Raw QR Payload based on selected type
  const getPayload = (): string => {
    switch (type) {
      case 'phone': {
        const clean = phoneNumber.replace(/[\s\-\(\)]/g, '');
        return clean.startsWith('+') || clean.startsWith('tel:') ? `tel:${clean.replace('tel:', '')}` : `tel:${clean}`;
      }
      case 'whatsapp': {
        const clean = whatsappNumber.replace(/[\s\-\(\)\+]/g, '');
        return `https://wa.me/${clean}?text=${encodeURIComponent(whatsappMsg)}`;
      }
      case 'url': {
        const clean = url.trim();
        return clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`;
      }
      case 'wifi':
        return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;
      case 'sms': {
        const clean = smsNumber.replace(/[\s\-\(\)]/g, '');
        return `smsto:${clean}:${smsMsg}`;
      }
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubj)}`;
      case 'text':
      default:
        return text || 'Miftah Tools';
    }
  };

  // Generate QR Code on any input change
  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      setIsGenerating(true);
      const payload = getPayload();
      try {
        const dataUrl = await QRCode.toDataURL(payload || 'Miftah Tools', {
          width: qrSize,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'M',
        });
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('QR Generation failed:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };

    generate();
    return () => {
      isCancelled = true;
    };
  }, [
    type,
    phoneNumber,
    whatsappNumber,
    whatsappMsg,
    url,
    text,
    wifiSsid,
    wifiPass,
    wifiSec,
    smsNumber,
    smsMsg,
    emailTo,
    emailSubj,
    fgColor,
    bgColor,
    qrSize,
  ]);

  // Actions
  const handleDownloadPng = async () => {
    if (!qrDataUrl) return;
    triggerHaptic('medium');
    const res = await fetch(qrDataUrl);
    const blob = await res.blob();
    downloadSingleFile(blob, `miftah-qr-${type}.png`);
  };

  const handleDownloadSvg = async () => {
    triggerHaptic('medium');
    const payload = getPayload();
    try {
      const svgString = await QRCode.toString(payload || 'Miftah Tools', {
        type: 'svg',
        color: {
          dark: fgColor,
          light: bgColor,
        },
        margin: 2,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      downloadSingleFile(blob, `miftah-qr-${type}.svg`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) return;
    triggerHaptic('light');
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback copy text
      navigator.clipboard.writeText(getPayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareQr = async () => {
    if (!qrDataUrl) return;
    triggerHaptic('medium');
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `qr-${type}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Miftah Tools QR Code',
          text: `QR Code for ${type.toUpperCase()}: ${getPayload()}`,
        });
      } else {
        handleDownloadPng();
      }
    } catch (e) {
      console.warn('Share not supported, falling back to download:', e);
      handleDownloadPng();
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-in fade-in duration-300"
    >
      {/* Settings & Input Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Type Selection Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>
              {language === 'ur'
                ? 'QR کوڈ کی قسم منتخب کریں'
                : language === 'ar'
                ? 'اختر نوع رمز QR'
                : language === 'hi'
                ? 'QR कोड का प्रकार चुनें'
                : 'Select QR Code Type'}
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'phone',
                label: language === 'ur' ? 'فون نمبر' : language === 'ar' ? 'رقم الهاتف' : language === 'hi' ? 'फ़ोन नंबर' : 'Phone Call',
                icon: Phone,
                desc: 'Direct Dial (tel:)',
                popular: true,
              },
              {
                id: 'whatsapp',
                label: 'WhatsApp',
                icon: MessageSquare,
                desc: 'Direct Chat',
              },
              {
                id: 'url',
                label: language === 'ur' ? 'ویب سائٹ لنک' : language === 'ar' ? 'رابط الموقع' : language === 'hi' ? 'वेबसाइट लिंक' : 'Website URL',
                icon: Globe,
                desc: 'https://...',
              },
              {
                id: 'text',
                label: language === 'ur' ? 'سادہ ٹیکسٹ' : language === 'ar' ? 'نص / رقم' : language === 'hi' ? 'टेक्स्ट / नंबर' : 'Plain Text',
                icon: FileText,
                desc: 'Any note or ID',
              },
              {
                id: 'wifi',
                label: 'Wi-Fi',
                icon: Wifi,
                desc: 'Instant Connect',
              },
              {
                id: 'sms',
                label: 'SMS',
                icon: Smartphone,
                desc: 'Direct Message',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = type === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setType(tab.id as QrType);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col items-start gap-1 ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 dark:border-brand-500 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-md scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {tab.popular && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase">
                      Fast
                    </span>
                  )}
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold leading-tight">{tab.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">{tab.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Inputs Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          {/* 1. Phone Call QR */}
          {type === 'phone' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">
                  {language === 'ur'
                    ? 'اسکین کرنے پر فون فورا کال ڈائلر کھول دے گا۔'
                    : language === 'ar'
                    ? 'عند مسح الرمز سيفتح الهاتف لوحة الاتصال مباشرة.'
                    : language === 'hi'
                    ? 'स्कैन करते ही फ़ोन तुरंत सीधे कॉल डायलर खोल देगा।'
                    : 'Scanning this QR will instantly open the phone dialer to call this number directly.'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ur' ? 'فون نمبر درج کریں:' : language === 'ar' ? 'أدخل رقم الهاتف:' : language === 'hi' ? 'फ़ोन नंबर दर्ज करें:' : 'Phone Number (with country code):'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 pl-11 text-sm font-black rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-brand-500 focus:outline-none tracking-wider"
                  />
                  <Phone className="w-4 h-4 text-brand-600 dark:text-brand-400 absolute left-4 top-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* 2. WhatsApp Direct Chat QR */}
          {type === 'whatsapp' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ur' ? 'واٹس ایپ نمبر:' : language === 'ar' ? 'رقم الواتساب:' : language === 'hi' ? 'व्हाट्सएप नंबर:' : 'WhatsApp Number (with country code):'}
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ur' ? 'پہلے سے لکھا ہوا میسج (اختیاری):' : language === 'ar' ? 'رسالة تمهيدية (اختياري):' : language === 'hi' ? 'प्री-फ़िल्ड संदेश (वैकल्पिक):' : 'Pre-filled Message (Optional):'}
                </label>
                <textarea
                  rows={2}
                  value={whatsappMsg}
                  onChange={(e) => setWhatsappMsg(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* 3. Website URL QR */}
          {type === 'url' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'ur' ? 'ویب سائٹ لنک:' : language === 'ar' ? 'رابط الموقع الإلكتروني:' : language === 'hi' ? 'वेबसाइट लिंक:' : 'Website / URL:'}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* 4. Plain Text / Notes / ID QR */}
          {type === 'text' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'ur' ? 'کوئی بھی ٹیکسٹ، نمبر یا معلومات درج کریں:' : language === 'ar' ? 'أدخل أي نص أو رقم أو بيانات:' : language === 'hi' ? 'कोई भी टेक्स्ट, नंबर या संदेश दर्ज करें:' : 'Text, Custom Code, or Numbers:'}
              </label>
              <textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type any message, number, or note..."
                className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* 5. Wi-Fi QR */}
          {type === 'wifi' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Wi-Fi Network Name (SSID):</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Wi-Fi Password:</label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* 6. SMS QR */}
          {type === 'sms' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Recipient Phone Number:</label>
                <input
                  type="tel"
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">SMS Body:</label>
                <input
                  type="text"
                  value={smsMsg}
                  onChange={(e) => setSmsMsg(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Colors & Styling */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">QR Pattern Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-white border border-slate-200 p-0.5"
                />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">Background Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-white border border-slate-200 p-0.5"
                />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live QR Output & Download Column */}
      <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center space-y-6 text-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Real-time Live Generated</span>
        </div>

        {/* QR Code Container */}
        <div className="p-4 rounded-3xl bg-white shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Generated QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl transition-transform duration-200"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 animate-pulse">
              <QrCode className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Scanned Data Quick Preview */}
        <div className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-left space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Scanned Output:</span>
          <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
            {getPayload()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG Image (High-Res)</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              SVG Vector
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareQr}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
