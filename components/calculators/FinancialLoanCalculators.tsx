'use client';

import React, { useState } from 'react';
import { Coins, BadgePercent, TrendingUp, Tag, Receipt, Calculator, RotateCcw, Zap, ArrowRight, PieChart as PieIcon, Layers } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { triggerHaptic } from '@/lib/motion/motion-system';

const FINANCE_LOCALES = {
  en: {
    tabs: {
      emi: 'Loan & EMI',
      gst: 'GST & Sales Tax',
      discount: 'Discount & Sale',
      margin: 'Profit Margin & Markup',
      compound: 'Compound Interest',
    },
    emi: {
      title: 'EMI & Loan Repayment Calculator',
      loanAmount: 'Loan Amount',
      interestRate: 'Interest Rate (% per annum)',
      tenureYears: 'Tenure (Years)',
      tenureMonths: 'Tenure (Months)',
      monthlyEmi: 'Monthly EMI',
      totalInterest: 'Total Interest Payable',
      totalPayment: 'Total Payment (Principal + Interest)',
      principalRatio: 'Principal',
      interestRatio: 'Interest',
    },
    gst: {
      title: 'GST / VAT / Sales Tax Calculator',
      baseAmount: 'Initial Amount',
      gstRate: 'GST Rate (%)',
      taxMode: 'Tax Calculation Mode',
      exclusive: 'Add GST (Exclusive)',
      inclusive: 'Remove GST (Inclusive)',
      netAmount: 'Net Amount',
      gstAmount: 'GST / Tax Amount',
      grossAmount: 'Total / Gross Amount',
      cgstSgst: 'Split (CGST 50% + SGST 50%)',
    },
    discount: {
      title: 'Discount & Shopping Savings',
      originalPrice: 'Original Price',
      discountPercent: 'Discount (%)',
      extraTax: 'Additional Tax Rate (%)',
      finalPrice: 'Final Price to Pay',
      youSave: 'You Save',
    },
    margin: {
      title: 'Profit Margin & Markup Calculator',
      costPrice: 'Cost Price (CP)',
      sellingPrice: 'Selling Price (SP)',
      grossProfit: 'Gross Profit',
      profitMargin: 'Profit Margin',
      markup: 'Markup Percentage',
    },
    compound: {
      title: 'Compound Interest & Investment Growth',
      principal: 'Initial Principal',
      annualRate: 'Annual Interest Rate (%)',
      years: 'Time Period (Years)',
      frequency: 'Compounding Frequency',
      freqAnnually: 'Annually (1/yr)',
      freqSemi: 'Semi-Annually (2/yr)',
      freqQuarterly: 'Quarterly (4/yr)',
      freqMonthly: 'Monthly (12/yr)',
      futureValue: 'Future Maturity Value',
      compoundInterest: 'Compound Interest Earned',
    },
  },
  ur: {
    tabs: {
      emi: 'قرضہ اور قسط (EMI)',
      gst: 'جی ایس ٹی اور ٹیکس (GST)',
      discount: 'رعایت اور بچت (Discount)',
      margin: 'منافع کا مارجن (Margin)',
      compound: 'مرکب منافع (Compound)',
    },
    emi: {
      title: 'قرض کی ماہانہ قسط (EMI) کیلکولیٹر',
      loanAmount: 'قرض کی رقم',
      interestRate: 'شرح سود (% سالانہ)',
      tenureYears: 'مدت (سال)',
      tenureMonths: 'مدت (مہینے)',
      monthlyEmi: 'ماہانہ قسط (EMI)',
      totalInterest: 'کل قابل ادائیگی سود',
      totalPayment: 'کل ادائیگی (اصل زر + سود)',
      principalRatio: 'اصل زر',
      interestRatio: 'سود',
    },
    gst: {
      title: 'جی ایس ٹی / ٹیکس کیلکولیٹر',
      baseAmount: 'ابتدائی رقم',
      gstRate: 'جی ایس ٹی شرح (%)',
      taxMode: 'ٹیکس کا طریقہ کار',
      exclusive: 'جی ایس ٹی شامل کریں (Exclusive)',
      inclusive: 'جی ایس ٹی نکالیں (Inclusive)',
      netAmount: 'خالص رقم (Net)',
      gstAmount: 'ٹیکس کی رقم (Tax)',
      grossAmount: 'کل رقم (Gross)',
      cgstSgst: 'تقسیم (CGST 50% + SGST 50%)',
    },
    discount: {
      title: 'رعایت اور بچت کیلکولیٹر',
      originalPrice: 'اصل قیمت',
      discountPercent: 'رعایت کی شرح (%)',
      extraTax: 'اضافی ٹیکس (%)',
      finalPrice: 'حتمی قابل ادا قیمت',
      youSave: 'آپ کی کل بچت',
    },
    margin: {
      title: 'منافع کا مارجن اور مارک اپ',
      costPrice: 'لاگت کی قیمت (Cost)',
      sellingPrice: 'فروخت کی قیمت (Sale)',
      grossProfit: 'کل خالص منافع',
      profitMargin: 'منافع کا مارجن (%)',
      markup: 'مارک اپ فیصد (%)',
    },
    compound: {
      title: 'مرکب شرح منافع اور سرمایہ کاری',
      principal: 'ابتدائی سرمایہ',
      annualRate: 'سالانہ شرح منافع (%)',
      years: 'مدت (سال)',
      frequency: 'حساب کی مدت',
      freqAnnually: 'سالانہ (1 بار)',
      freqSemi: 'شعبہ سالانہ (2 بار)',
      freqQuarterly: 'سہ ماہی (4 بار)',
      freqMonthly: 'ماہانہ (12 بار)',
      futureValue: 'حتمی کل رقم',
      compoundInterest: 'کل حاصل شدہ منافع',
    },
  },
  ar: {
    tabs: {
      emi: 'القروض والأقساط',
      gst: 'الضريبة المضافة',
      discount: 'الخصومات والعروض',
      margin: 'هامش الربح',
      compound: 'الفائدة المركبة',
    },
    emi: {
      title: 'حاسبة القروض والأقساط الشهرية',
      loanAmount: 'مبلغ القرض',
      interestRate: 'نسبة الفائدة (% سنوياً)',
      tenureYears: 'المدة (سنوات)',
      tenureMonths: 'المدة (أشهر)',
      monthlyEmi: 'القسط الشهري',
      totalInterest: 'إجمالي الفوائد',
      totalPayment: 'المبلغ الإجمالي للسداد',
      principalRatio: 'المبلغ الأصلي',
      interestRatio: 'الفوائد',
    },
    gst: {
      title: 'حاسبة ضريبة القيمة المضافة (VAT)',
      baseAmount: 'المبلغ الأساسي',
      gstRate: 'نسبة الضريبة (%)',
      taxMode: 'نوع الحساب',
      exclusive: 'إضافة الضريبة (غير شامل)',
      inclusive: 'خصم الضريبة (شامل)',
      netAmount: 'المبلغ الصافي',
      gstAmount: 'مبلغ الضريبة',
      grossAmount: 'المبلغ الإجمالي',
      cgstSgst: 'تفصيل الضريبة',
    },
    discount: {
      title: 'حاسبة الخصم والتوفير',
      originalPrice: 'السعر الأصلي',
      discountPercent: 'نسبة الخصم (%)',
      extraTax: 'الضريبة الإضافية (%)',
      finalPrice: 'السعر النهائي للدفع',
      youSave: 'مبلغ التوفير',
    },
    margin: {
      title: 'حاسبة هامش الربح والزيادة',
      costPrice: 'سعر التكلفة',
      sellingPrice: 'سعر البيع',
      grossProfit: 'إجمالي الربح',
      profitMargin: 'هامش الربح (%)',
      markup: 'نسبة الزيادة (%)',
    },
    compound: {
      title: 'حاسبة الأرباح المركبة والاستثمار',
      principal: 'رأس المال المبدئي',
      annualRate: 'العائد السنوي (%)',
      years: 'المدة (سنوات)',
      frequency: 'دورة الحساب',
      freqAnnually: 'سنوياً',
      freqSemi: 'نصف سنوياً',
      freqQuarterly: 'ربع سنوياً',
      freqMonthly: 'شهرياً',
      futureValue: 'القيمة الإجمالية المستقبلية',
      compoundInterest: 'إجمالي الأرباح',
    },
  },
  hi: {
    tabs: {
      emi: 'ऋण और ईएमआई (EMI)',
      gst: 'जीएसटी और टैक्स (GST)',
      discount: 'छूट और बचत (Discount)',
      margin: 'लाभ मार्जिन (Profit)',
      compound: 'चक्रवृद्धि ब्याज (Compound)',
    },
    emi: {
      title: 'लोन और ईएमआई (EMI) कैलकुलेटर',
      loanAmount: 'ऋण राशि (Loan Amount)',
      interestRate: 'ब्याज दर (% प्रति वर्ष)',
      tenureYears: 'अवधि (वर्ष)',
      tenureMonths: 'अवधि (महीने)',
      monthlyEmi: 'मासिक ईएमआई (Monthly EMI)',
      totalInterest: 'कुल देय ब्याज',
      totalPayment: 'कुल भुगतान (मूलधन + ब्याज)',
      principalRatio: 'मूलधन',
      interestRatio: 'ब्याज',
    },
    gst: {
      title: 'जीएसटी (GST) और टैक्स कैलकुलेटर',
      baseAmount: 'प्रारंभिक राशि',
      gstRate: 'जीएसटी दर (%)',
      taxMode: 'टैक्स गणना का प्रकार',
      exclusive: 'जीएसटी जोड़ें (Exclusive)',
      inclusive: 'जीएसटी घटाएं (Inclusive)',
      netAmount: 'शुद्ध राशि (Net Amount)',
      gstAmount: 'जीएसटी राशि (Tax Amount)',
      grossAmount: 'कुल राशि (Gross Total)',
      cgstSgst: 'विभाजन (CGST 50% + SGST 50%)',
    },
    discount: {
      title: 'छूट और बचत कैलकुलेटर',
      originalPrice: 'मूल मूल्य (Original Price)',
      discountPercent: 'छूट की दर (%)',
      extraTax: 'अतिरिक्त टैक्स (%)',
      finalPrice: 'अंतिम देय मूल्य',
      youSave: 'आपकी कुल बचत',
    },
    margin: {
      title: 'लाभ मार्जिन और मार्कअप कैलकुलेटर',
      costPrice: 'लागत मूल्य (Cost Price)',
      sellingPrice: 'बिक्री मूल्य (Selling Price)',
      grossProfit: 'कुल सकल लाभ',
      profitMargin: 'लाभ मार्जिन (%)',
      markup: 'मार्कअप दर (%)',
    },
    compound: {
      title: 'चक्रवृद्धि ब्याज और निवेश कैलकुलेटर',
      principal: 'प्रारंभिक मूलधन',
      annualRate: 'वार्षिक ब्याज दर (%)',
      years: 'अवधि (वर्ष)',
      frequency: 'चक्रवृद्धि आवृत्ति',
      freqAnnually: 'वार्षिक (1/वर्ष)',
      freqSemi: 'अर्ध-वार्षिक (2/वर्ष)',
      freqQuarterly: 'त्रैमासिक (4/वर्ष)',
      freqMonthly: 'मासिक (12/वर्ष)',
      futureValue: 'परिपक्वता पर कुल राशि',
      compoundInterest: 'कुल अर्जित ब्याज',
    },
  },
};

export function FinancialLoanCalculators() {
  const { language } = useI18n();
  const loc = FINANCE_LOCALES[language as keyof typeof FINANCE_LOCALES] || FINANCE_LOCALES.en;

  const [activeTab, setActiveTab] = useState<'emi' | 'gst' | 'discount' | 'margin' | 'compound'>('emi');

  // EMI States
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  // GST States
  const [gstAmount, setGstAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstMode, setGstMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  // Discount States
  const [origPrice, setOrigPrice] = useState<number>(2500);
  const [discountPct, setDiscountPct] = useState<number>(20);
  const [extraTaxRate, setExtraTaxRate] = useState<number>(0);

  // Margin States
  const [costPrice, setCostPrice] = useState<number>(800);
  const [sellingPrice, setSellingPrice] = useState<number>(1200);

  // Compound Interest States
  const [principal, setPrincipal] = useState<number>(100000);
  const [compRate, setCompRate] = useState<number>(10);
  const [compYears, setCompYears] = useState<number>(5);
  const [compFrequency, setCompFrequency] = useState<number>(12); // monthly

  // EMI Calculations
  const calculateEmi = () => {
    const P = Math.max(0, loanAmount);
    const r = Math.max(0, interestRate) / (12 * 100);
    const n = Math.max(1, tenureYears * 12);
    if (r === 0) {
      const emi = P / n;
      return { emi, totalPayment: P, totalInterest: 0, n };
    }
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    return { emi, totalPayment, totalInterest, n };
  };

  const emiRes = calculateEmi();
  const principalPct = emiRes.totalPayment > 0 ? (loanAmount / emiRes.totalPayment) * 100 : 100;
  const interestPct = emiRes.totalPayment > 0 ? (emiRes.totalInterest / emiRes.totalPayment) * 100 : 0;

  // GST Calculations
  const calculateGst = () => {
    const amt = Math.max(0, gstAmount);
    const rate = Math.max(0, gstRate);
    if (gstMode === 'exclusive') {
      const tax = (amt * rate) / 100;
      const total = amt + tax;
      return { net: amt, tax, total, cgst: tax / 2, sgst: tax / 2 };
    } else {
      const net = (amt * 100) / (100 + rate);
      const tax = amt - net;
      return { net, tax, total: amt, cgst: tax / 2, sgst: tax / 2 };
    }
  };
  const gstRes = calculateGst();

  // Discount Calculations
  const calculateDiscount = () => {
    const p = Math.max(0, origPrice);
    const disc = (p * Math.max(0, discountPct)) / 100;
    const priceAfterDisc = p - disc;
    const tax = (priceAfterDisc * Math.max(0, extraTaxRate)) / 100;
    const finalToPay = priceAfterDisc + tax;
    const totalSaved = disc;
    return { finalToPay, totalSaved, priceAfterDisc };
  };
  const discRes = calculateDiscount();

  // Margin Calculations
  const calculateMargin = () => {
    const cp = Math.max(0, costPrice);
    const sp = Math.max(0, sellingPrice);
    const gross = sp - cp;
    const margin = sp > 0 ? (gross / sp) * 100 : 0;
    const markup = cp > 0 ? (gross / cp) * 100 : 0;
    return { gross, margin, markup };
  };
  const marginRes = calculateMargin();

  // Compound Interest Calculations
  const calculateCompound = () => {
    const P = Math.max(0, principal);
    const r = Math.max(0, compRate) / 100;
    const t = Math.max(0, compYears);
    const n = Math.max(1, compFrequency);
    const futureVal = P * Math.pow(1 + r / n, n * t);
    const totalInterest = futureVal - P;
    return { futureVal, totalInterest };
  };
  const compRes = calculateCompound();

  const handleTabChange = (tab: any) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'emi', label: loc.tabs.emi, icon: Coins },
          { id: 'gst', label: loc.tabs.gst, icon: Receipt },
          { id: 'discount', label: loc.tabs.discount, icon: Tag },
          { id: 'margin', label: loc.tabs.margin, icon: TrendingUp },
          { id: 'compound', label: loc.tabs.compound, icon: BadgePercent },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. EMI & LOAN REPAYMENT */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-600" />
              <span>{loc.emi.title}</span>
            </h3>

            {/* Loan Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{loc.emi.loanAmount}</span>
                <span className="font-mono text-brand-600 dark:text-brand-400 text-sm">
                  {loanAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="10000000"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold font-mono"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{loc.emi.interestRate}</span>
                <span className="font-mono text-brand-600 dark:text-brand-400 text-sm">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold font-mono"
              />
            </div>

            {/* Tenure in Years */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{loc.emi.tenureYears}</span>
                <span className="font-mono text-brand-600 dark:text-brand-400 text-sm">
                  {tenureYears} Y ({tenureYears * 12} M)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50">
                <span className="text-xs text-brand-600 dark:text-brand-400 font-bold block">
                  {loc.emi.monthlyEmi}
                </span>
                <span className="text-3xl font-black text-brand-700 dark:text-brand-300 font-mono">
                  ₹{Math.round(emiRes.emi).toLocaleString()}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">{loc.emi.totalInterest}</span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                    ₹{Math.round(emiRes.totalInterest).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">{loc.emi.totalPayment}</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    ₹{Math.round(emiRes.totalPayment).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Split Ratio Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-emerald-600">{loc.emi.principalRatio}: {principalPct.toFixed(1)}%</span>
                <span className="text-rose-600">{loc.emi.interestRatio}: {interestPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div style={{ width: `${principalPct}%` }} className="h-full bg-emerald-500" />
                <div style={{ width: `${interestPct}%` }} className="h-full bg-rose-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GST & TAX */}
      {activeTab === 'gst' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              <span>{loc.gst.title}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.gst.baseAmount}</label>
              <input
                type="number"
                value={gstAmount}
                onChange={(e) => setGstAmount(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>

            {/* GST Rate Preset Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.gst.gstRate}</label>
              <div className="flex flex-wrap gap-2">
                {[5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGstRate(rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      gstRate === rate
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value) || 0)}
                className="w-full mt-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>

            {/* Mode: Exclusive vs Inclusive */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.gst.taxMode}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGstMode('exclusive')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    gstMode === 'exclusive'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {loc.gst.exclusive}
                </button>
                <button
                  type="button"
                  onClick={() => setGstMode('inclusive')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    gstMode === 'inclusive'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {loc.gst.inclusive}
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 flex flex-col justify-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                {loc.gst.grossAmount}
              </span>
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                ₹{gstRes.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 font-bold">{loc.gst.netAmount}</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                  ₹{gstRes.net.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 font-bold">{loc.gst.gstAmount}</span>
                <span className="font-mono font-black text-brand-600 dark:text-brand-400">
                  ₹{gstRes.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-bold">{loc.gst.cgstSgst}</span>
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">
                  ₹{gstRes.cgst.toFixed(2)} + ₹{gstRes.sgst.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DISCOUNT & SAVINGS */}
      {activeTab === 'discount' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>{loc.discount.title}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.discount.originalPrice}</label>
              <input
                type="number"
                value={origPrice}
                onChange={(e) => setOrigPrice(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.discount.discountPercent}</label>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 25, 30, 50, 70].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscountPct(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      discountPct === d
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {d}% Off
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                className="w-full mt-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.discount.extraTax}</label>
              <input
                type="number"
                value={extraTaxRate}
                onChange={(e) => setExtraTaxRate(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 flex flex-col justify-center">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">
                {loc.discount.finalPrice}
              </span>
              <span className="text-3xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                ₹{discRes.finalToPay.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                {loc.discount.youSave}
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                ₹{discRes.totalSaved.toFixed(2)} ({discountPct}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFIT MARGIN & MARKUP */}
      {activeTab === 'margin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>{loc.margin.title}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.margin.costPrice}</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.margin.sellingPrice}</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 flex flex-col justify-center">
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50">
              <span className="text-xs text-teal-600 dark:text-teal-400 font-bold block">
                {loc.margin.grossProfit}
              </span>
              <span className={`text-3xl font-black font-mono ${marginRes.gross >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-rose-600'}`}>
                ₹{marginRes.gross.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-bold block">{loc.margin.profitMargin}</span>
                <span className={`text-xl font-black font-mono ${marginRes.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {marginRes.margin.toFixed(2)}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-bold block">{loc.margin.markup}</span>
                <span className={`text-xl font-black font-mono ${marginRes.markup >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {marginRes.markup.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMPOUND INTEREST */}
      {activeTab === 'compound' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-brand-600" />
              <span>{loc.compound.title}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.compound.principal}</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.compound.annualRate}</label>
                <input
                  type="number"
                  step="0.1"
                  value={compRate}
                  onChange={(e) => setCompRate(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.compound.years}</label>
                <input
                  type="number"
                  value={compYears}
                  onChange={(e) => setCompYears(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.compound.frequency}</label>
              <select
                value={compFrequency}
                onChange={(e) => setCompFrequency(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200"
              >
                <option value={1}>{loc.compound.freqAnnually}</option>
                <option value={2}>{loc.compound.freqSemi}</option>
                <option value={4}>{loc.compound.freqQuarterly}</option>
                <option value={12}>{loc.compound.freqMonthly}</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 flex flex-col justify-center">
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50">
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold block">
                {loc.compound.futureValue}
              </span>
              <span className="text-3xl font-black text-brand-700 dark:text-brand-300 font-mono">
                ₹{Math.round(compRes.futureVal).toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                {loc.compound.compoundInterest}
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                +₹{Math.round(compRes.totalInterest).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
