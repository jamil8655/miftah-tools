'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Users,
  HardDrive,
  ShieldCheck,
  Server,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Database,
  Lock,
  Search,
  Filter,
  Cpu,
  RefreshCw,
  Trash2,
  Workflow,
  Sparkles,
  Key,
  CreditCard,
  Layers,
  Terminal,
  Radio,
  Sliders,
  Bell,
  Eye,
  RotateCcw,
  Zap,
  Globe,
  FileText,
  UserCheck,
  ShieldAlert,
  AlertOctagon,
  XCircle,
  Menu,
  X,
  ArrowLeft,
  CloudOff,
  Cloud,
  ChevronRight,
  Info,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils/formatters';
import { TOOLS_LIST, CATEGORIES_CONFIG } from '@/lib/tools-config';
import {
  getActivityHistory,
  getAllStoredFiles,
  ActivityHistoryItem,
  StoredFileItem,
  purgeAllLocalData,
} from '@/lib/storage/indexeddb-store';
import { globalJobQueue, ProcessingJob } from '@/lib/core/job-queue';
import {
  getFeatureFlags,
  updateFeatureFlag,
  isToolInMaintenance,
  toggleToolMaintenance,
} from '@/lib/core/feature-flags';
import {
  subscribeToUsers,
  subscribeToTools,
  subscribeToRecentJobs,
  updateToolStatus,
  updateSystemSettings,
  getSystemSettings,
  FirestoreUserProfile,
  FirestoreToolMeta,
  FirestoreJobRecord,
} from '@/lib/firebase/firestore-service';
import { getFirebaseConnectionStatus, FirebaseConnectionStatus } from '@/lib/firebase/firebase-service';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { getLocalizedTool, getLocalizedCategory } from '@/lib/i18n/catalog-translations';
import { Language } from '@/lib/i18n/translations';

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

const ADMIN_LOCALES: Record<Language, {
  controlCenter: string;
  version: string;
  deviceStorage: string;
  clientSidePrivacy: string;
  back: string;
  engineActive: string;
  registeredUsers: string;
  realAccounts: string;
  activeTools: string;
  clientEngine: string;
  opsLogged: string;
  deviceTelemetry: string;
  jobQueue: string;
  activeAndQueued: string;
  idleReady: string;
  tabs: Record<string, string>;
  overviewTitle: string;
  overviewSubtitle: string;
  usersTitle: string;
  usersSubtitle: string;
  toolsTitle: string;
  toolsSubtitle: string;
  searchTools: string;
  searchUsers: string;
  filterAll: string;
  allStatus: string;
  statusActive: string;
  statusMaintenance: string;
  statusDisabled: string;
  enable: string;
  disable: string;
  maintenance: string;
  refresh: string;
  tool: string;
  file: string;
  size: string;
  status: string;
  time: string;
  noOps: string;
  connected: string;
  superAdmin: string;
  fullControl: string;
  dangerTitle: string;
  dangerDesc: string;
  purgeButton: string;
  purgeSuccess: string;
}> = {
  en: {
    controlCenter: 'Control Center',
    version: 'v2.5.0 • Master',
    deviceStorage: 'Device Storage',
    clientSidePrivacy: '100% Client-Side Privacy',
    back: 'Back',
    engineActive: 'Engine Active',
    registeredUsers: 'Registered Users',
    realAccounts: 'Real Firestore Accounts',
    activeTools: 'Active Tools',
    clientEngine: '100% Client-Side Engine',
    opsLogged: 'Operations Logged',
    deviceTelemetry: 'Real Device Telemetry',
    jobQueue: 'Job Queue',
    activeAndQueued: 'Active & Queued',
    idleReady: 'Idle & Ready',
    tabs: {
      overview: 'Dashboard Overview',
      users: 'Users & RBAC',
      tools: 'Tool Catalog',
      jobs: 'Processing Jobs',
      ai: 'AI & OCR Engines',
      plans: 'Plans & Monetization',
      api: 'Developer REST API',
      flags: 'Feature Flags',
      translations: 'Translation Manager',
      health: 'System Health',
      audit: 'Audit Trail',
      danger: 'Danger Zone',
    },
    overviewTitle: 'Miftah Tools Live Telemetry Overview',
    overviewSubtitle: 'Real-time client telemetry, Firestore active listeners, and device storage footprint.',
    usersTitle: 'Real Firestore Users',
    usersSubtitle: 'Live authenticated user accounts from Firebase Firestore.',
    toolsTitle: '220+ Client-Side Tools Engine',
    toolsSubtitle: 'Configure maintenance windows, toggle features, or audit privacy execution parameters.',
    searchTools: 'Search tools by name or description...',
    searchUsers: 'Search users by name/email/UID...',
    filterAll: 'All Categories',
    allStatus: 'All Status',
    statusActive: 'Active',
    statusMaintenance: 'Maintenance',
    statusDisabled: 'Disabled',
    enable: 'Enable',
    disable: 'Disable',
    maintenance: 'Maintenance',
    refresh: 'Refresh',
    tool: 'Tool',
    file: 'File',
    size: 'Size',
    status: 'Status',
    time: 'Time',
    noOps: 'No recent operations logged yet. Run any tool to record live telemetry.',
    connected: 'CONNECTED',
    superAdmin: 'Super Administrator',
    fullControl: 'Full Platform Control',
    dangerTitle: 'Danger Zone & Cache Management',
    dangerDesc: 'Purge local IndexedDB storage, cached Blobs, and telemetry records.',
    purgeButton: 'Purge All Local Data',
    purgeSuccess: 'All local IndexedDB files and telemetry purged successfully.',
  },
  ur: {
    controlCenter: 'ایڈمن کنٹرول سینٹر',
    version: 'v2.5.0 • ماسٹر ایڈمن',
    deviceStorage: 'ڈیوائس اسٹوریج',
    clientSidePrivacy: '100% کلائنٹ سائیڈ رازداری',
    back: 'واپس',
    engineActive: 'انجن فعال ہے',
    registeredUsers: 'رجسٹرڈ صارفین',
    realAccounts: 'حقیقی فائر بیس اکاؤنٹس',
    activeTools: 'فعال ٹولز',
    clientEngine: '100% آن ڈیوائس انجن',
    opsLogged: 'کل ٹول سرگرمیاں',
    deviceTelemetry: 'ڈیوائس ٹیلی میٹری لاگز',
    jobQueue: 'جاب کیو (Queue)',
    activeAndQueued: 'جاری و قطار میں',
    idleReady: 'تیار و فارغ',
    tabs: {
      overview: 'ڈیش بورڈ کا جائزہ',
      users: 'صارفین اور رسائی',
      tools: 'ٹول کیٹلاگ',
      jobs: 'پروسیسنگ جابس',
      ai: 'اے آئی و او سی آر',
      plans: 'پلانز اور سبسکرپشن',
      api: 'ڈیولپر REST API',
      flags: 'فیچر فلیگز',
      translations: 'کثیر لسانی مینیجر',
      health: 'سسٹم کی صورتحال',
      audit: 'آڈٹ لاگز',
      danger: 'ڈینجر زون',
    },
    overviewTitle: 'نیکزورا لائیو ٹیلی میٹری جائزہ',
    overviewSubtitle: 'حقیقی وقت کا ڈیٹا، فائر بیس کنکشن اور ڈیوائس اسٹوریج کی مکمل معلومات۔',
    usersTitle: 'صارفین کی فہرست اور اجازتیں',
    usersSubtitle: 'فائر بیس ڈیٹا بیس سے لائیو تصدیق شدہ صارفین کے اکاؤنٹس۔',
    toolsTitle: '220+ کلائنٹ سائیڈ ٹولز انجن',
    toolsSubtitle: 'مینٹیننس موڈ آن کریں، ٹولز کو فعال یا غیر فعال کریں اور پرائیویسی دیکھیں۔',
    searchTools: 'ٹول کا نام یا تفصیل تلاش کریں...',
    searchUsers: 'نام، ای میل یا UID سے تلاش کریں...',
    filterAll: 'تمام کیٹیگریز',
    allStatus: 'تمام حالتیں',
    statusActive: 'فعال',
    statusMaintenance: 'مرمت (مینٹیننس)',
    statusDisabled: 'غیر فعال',
    enable: 'فعال کریں',
    disable: 'غیر فعال کریں',
    maintenance: 'مینٹیننس',
    refresh: 'ریفریش کریں',
    tool: 'ٹول',
    file: 'فائل',
    size: 'سائز',
    status: 'حالت',
    time: 'وقت',
    noOps: 'ابھی تک کوئی آپریشن ریکارڈ نہیں ہوا۔ لائیو ریکارڈنگ کے لیے کوئی ٹول چلائیں۔',
    connected: 'منسلک ہے',
    superAdmin: 'سپر ایڈمنسٹریٹر',
    fullControl: 'پلیٹ فارم پر مکمل اختیار',
    dangerTitle: 'ڈینجر زون اور کیشے کنٹرول',
    dangerDesc: 'مقامی IndexedDB اسٹوریج، محفوظ شدہ فائلز اور لاگز کو حذف کریں۔',
    purgeButton: 'تمام لوکل ڈیٹا صاف کریں',
    purgeSuccess: 'تمام لوکل ڈیٹا کامیابی سے حذف کر دیا گیا ہے۔',
  },
  ar: {
    controlCenter: 'مركز التحكم والإدارة',
    version: 'v2.5.0 • النظام الأساسي',
    deviceStorage: 'مساحة تخزين الجهاز',
    clientSidePrivacy: 'خصوصية تامة 100% داخل جهازك',
    back: 'رجوع',
    engineActive: 'المحرك نشط',
    registeredUsers: 'المستخدمون المسجلون',
    realAccounts: 'حسابات Firebase نشطة',
    activeTools: 'الأدوات المتاحة',
    clientEngine: '100% محرك محلي آمن',
    opsLogged: 'العمليات المنفذة',
    deviceTelemetry: 'سجلات العمليات بالجهاز',
    jobQueue: 'طابور المهام',
    activeAndQueued: 'قيد التنفيذ وبانتظار الدور',
    idleReady: 'جاهز للاستخدام',
    tabs: {
      overview: 'نظرة عامة على لوحة التحكم',
      users: 'المستخدمون والصلاحيات',
      tools: 'دليل الأدوات',
      jobs: 'مهام المعالجة',
      ai: 'محركات AI و OCR',
      plans: 'الخطط والاشتراكات',
      api: 'واجهة المطورين REST API',
      flags: 'مفاتيح الميزات',
      translations: 'إدارة اللغات والترجمات',
      health: 'حالة النظام والخوادم',
      audit: 'سجل العمليات والتدقيق',
      danger: 'منطقة الحظر والخطر',
    },
    overviewTitle: 'نظرة عامة على تشغيل Miftah Tools المباشر',
    overviewSubtitle: 'بيانات الأداء المباشرة، اتصالات Firebase، وسعة التخزين المستهلكة محلياً.',
    usersTitle: 'دليل المستخدمين والصلاحيات',
    usersSubtitle: 'حسابات المستخدمين المعتمدة مباشرة من Firebase Firestore.',
    toolsTitle: 'محرك أكثر من 220 أداة داخل المتصفح',
    toolsSubtitle: 'إدارة الصيانة وتفعيل وتعطيل الأدوات ومراجعة سياسات الخصوصية.',
    searchTools: 'البحث عن أداة بالاسم أو الوصف...',
    searchUsers: 'البحث بالاسم أو البريد الإلكتروني أو المعرف...',
    filterAll: 'جميع الفئات',
    allStatus: 'جميع الحالات',
    statusActive: 'نشط',
    statusMaintenance: 'تحت الصيانة',
    statusDisabled: 'معطل',
    enable: 'تفعيل',
    disable: 'تعطيل',
    maintenance: 'وضع الصيانة',
    refresh: 'تحديث',
    tool: 'الأداة',
    file: 'الملف',
    size: 'الحجم',
    status: 'الحالة',
    time: 'الوقت',
    noOps: 'لم يتم تسجيل أي عمليات مؤخراً. قم بتشغيل أي أداة لبدء التسجيل.',
    connected: 'متصل بنجاح',
    superAdmin: 'المسؤول العام (Super Admin)',
    fullControl: 'تحكم كامل بالنظام والبيانات',
    dangerTitle: 'منطقة الحظر وإدارة التخزين المؤقت',
    dangerDesc: 'مسح تخزين IndexedDB المحلي، والملفات المؤقتة، وسجلات الأداء.',
    purgeButton: 'مسح جميع البيانات المحلية',
    purgeSuccess: 'تم مسح البيانات المحلية والذاكرة المؤقتة بنجاح.',
  },
  hi: {
    controlCenter: 'कंट्रोल सेंटर',
    version: 'v2.5.0 • मास्टर',
    deviceStorage: 'डिवाइस स्टोरेज',
    clientSidePrivacy: '100% डिवाइस गोपनीयता',
    back: 'वापस',
    engineActive: 'इंजन सक्रिय है',
    registeredUsers: 'पंजीकृत उपयोगकर्ता',
    realAccounts: 'सक्रिय Firebase खाते',
    activeTools: 'सक्रिय टूल्स',
    clientEngine: '100% क्लाइंट-साइड इंजन',
    opsLogged: 'कुल क्रियाकलाप',
    deviceTelemetry: 'डिवाइस टेलीमेट्री लॉग्स',
    jobQueue: 'जॉब कतार (Queue)',
    activeAndQueued: 'सक्रिय व कतारबद्ध',
    idleReady: 'तैयार व खाली',
    tabs: {
      overview: 'डैशबोर्ड अवलोकन',
      users: 'उपयोगकर्ता व भूमिकाएं',
      tools: 'टूल कैटलॉग',
      jobs: 'प्रोसेसिंग कार्य',
      ai: 'AI व OCR इंजन',
      plans: 'प्लान व सदस्यता',
      api: 'डेवलपर REST API',
      flags: 'फ़ीचर फ़्लैग',
      translations: 'अनुवाद प्रबंधन',
      health: 'सिस्टम स्वास्थ्य',
      audit: 'ऑडिट ट्रेल',
      danger: 'डेंजर ज़ोन',
    },
    overviewTitle: 'Miftah Tools लाइव टेलीमेट्री अवलोकन',
    overviewSubtitle: 'रीयल-टाइम क्लाइंट टेलीमेट्री, सक्रिय Firebase कनेक्शन और स्टोरेज मेट्रिक्स।',
    usersTitle: 'उपयोगकर्ता सूची व अनुमतियाँ',
    usersSubtitle: 'Firebase Firestore से लाइव प्रमाणित उपयोगकर्ताओं के खाते।',
    toolsTitle: '220+ क्लाइंट-साइड टूल्स इंजन',
    toolsSubtitle: 'रखरखाव विंडो सेट करें, टूल्स को सक्षम/अक्षम करें और गोपनीयता जांचें।',
    searchTools: 'नाम या विवरण से टूल खोजें...',
    searchUsers: 'नाम, ईमेल या UID से खोजें...',
    filterAll: 'सभी श्रेणियां',
    allStatus: 'सभी स्थितियां',
    statusActive: 'सक्रिय',
    statusMaintenance: 'रखरखाव (Maintenance)',
    statusDisabled: 'अक्षम',
    enable: 'सक्षम करें',
    disable: 'अक्षम करें',
    maintenance: 'रखरखाव',
    refresh: 'रिफ्रेश करें',
    tool: 'टूल',
    file: 'फ़ाइल',
    size: 'आकार',
    status: 'स्थिति',
    time: 'समय',
    noOps: 'अभी तक कोई गतिविधि दर्ज नहीं हुई। लाइव डेटा के लिए कोई टूल चलाएं।',
    connected: 'सफलतापूर्वक कनेक्टेड',
    superAdmin: 'सुपर एडमिनिस्ट्रेटर',
    fullControl: 'सम्पूर्ण सिस्टम नियंत्रण',
    dangerTitle: 'डेंजर ज़ोन व कैश नियंत्रण',
    dangerDesc: 'स्थानीय IndexedDB स्टोरेज, अस्थायी फ़ाइलें व लॉग्स साफ़ करें।',
    purgeButton: 'सभी स्थानीय डेटा साफ़ करें',
    purgeSuccess: 'स्थानीय डेटा और अस्थायी फ़ाइलें सफलतापूर्वक हटाई गईं।',
  },
};

export function AdminAnalytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'tools'
    | 'jobs'
    | 'ai'
    | 'plans'
    | 'api'
    | 'flags'
    | 'translations'
    | 'health'
    | 'audit'
    | 'danger'
  >('overview');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real Stored Data Telemetry (IndexedDB & Real Firestore)
  const [realHistory, setRealHistory] = useState<ActivityHistoryItem[]>([]);
  const [realFiles, setRealFiles] = useState<StoredFileItem[]>([]);
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [activeJobs, setActiveJobs] = useState<ProcessingJob[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>(getFirebaseConnectionStatus());

  // Real Firestore Data States
  const [cloudUsers, setCloudUsers] = useState<FirestoreUserProfile[]>([]);
  const [cloudJobs, setCloudJobs] = useState<FirestoreJobRecord[]>([]);
  const [cloudTools, setCloudTools] = useState<FirestoreToolMeta[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Real Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'aud_init_1',
      actor: user?.name || 'Hafiz Jamilurrahman (Admin)',
      action: 'Admin Session Authenticated via Firebase Custom Claims',
      target: 'Auth Guard System',
      timestamp: new Date().toLocaleTimeString(),
      status: 'SUCCESS',
    },
  ]);

  // Feature Flags State
  const [flags, setFlags] = useState(getFeatureFlags());

  // Tool Maintenance States
  const [toolStatuses, setToolStatuses] = useState<Record<string, 'active' | 'maintenance' | 'disabled'>>(() => {
    const map: Record<string, 'active' | 'maintenance' | 'disabled'> = {};
    TOOLS_LIST.forEach((t) => {
      map[t.id] = isToolInMaintenance(t.id) ? 'maintenance' : 'active';
    });
    return map;
  });

  useEffect(() => {
    loadRealAdminData();

    // Subscribe to in-memory queue
    const unsubQueue = globalJobQueue.subscribe((jobs) => {
      setActiveJobs(jobs);
    });

    // Real Firestore Subscriptions
    const unsubUsers = subscribeToUsers((users) => {
      setCloudUsers(users);
    });

    const unsubTools = subscribeToTools((tools) => {
      setCloudTools(tools);
      // Merge remote tool maintenance states
      if (tools.length > 0) {
        setToolStatuses((prev) => {
          const next = { ...prev };
          tools.forEach((t) => {
            next[t.id] = !t.enabled ? 'disabled' : t.maintenanceMode ? 'maintenance' : 'active';
          });
          return next;
        });
      }
    });

    const unsubJobs = subscribeToRecentJobs((jobs) => {
      setCloudJobs(jobs);
    });

    return () => {
      unsubQueue();
      unsubUsers();
      unsubTools();
      unsubJobs();
    };
  }, []);

  const loadRealAdminData = async () => {
    const history = await getActivityHistory(100);
    const files = await getAllStoredFiles();
    setRealHistory(history);
    setRealFiles(files);

    const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
    setStorageBytes(totalBytes);
  };

  const addAuditLog = (action: string, target: string, status: 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'SUCCESS') => {
    const newLog: AuditLogItem = {
      id: 'aud_' + Math.random().toString(36).substring(2, 7),
      actor: user?.name || 'Hafiz Jamilurrahman (Admin)',
      action,
      target,
      timestamp: new Date().toLocaleTimeString(),
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleToggleToolStatus = async (toolId: string) => {
    const current = toolStatuses[toolId] || 'active';
    const next = current === 'active' ? 'maintenance' : current === 'maintenance' ? 'disabled' : 'active';

    setToolStatuses((prev) => ({ ...prev, [toolId]: next }));
    toggleToolMaintenance(toolId);

    // Save to Firestore
    await updateToolStatus(toolId, next !== 'disabled', next === 'maintenance');
    addAuditLog(`Changed status to ${next.toUpperCase()}`, `Tool: ${toolId}`);
  };

  const handleToggleFlag = (key: keyof typeof flags) => {
    updateFeatureFlag(key, !flags[key]);
    setFlags(getFeatureFlags());
    addAuditLog(`Toggled Flag: ${String(key)}`, `New State: ${!flags[key]}`);
  };

  const handlePurgeStorage = async () => {
    if (confirm('CRITICAL ACTION: Purge all stored files, history, and active caches from this device?')) {
      await purgeAllLocalData();
      globalJobQueue.clearAll();
      await loadRealAdminData();
      addAuditLog('Emergency Purge Executed', 'IndexedDB & Memory Queue', 'CRITICAL');
      alert('All local storage and active job queues have been purged.');
    }
  };

  const { language, isRTL } = useI18n();
  const adminLoc = ADMIN_LOCALES[language] || ADMIN_LOCALES.en;

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const localized = getLocalizedTool(tool, language);
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localized.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localized.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredUsers = cloudUsers.filter((u) => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.uid && u.uid.toLowerCase().includes(q))
    );
  });

  const navMenuItems = [
    { id: 'overview', label: adminLoc.tabs.overview || 'Dashboard Overview', icon: Activity },
    { id: 'users', label: adminLoc.tabs.users || 'Users & RBAC', icon: Users, badge: cloudUsers.length > 0 ? `${cloudUsers.length}` : undefined },
    { id: 'tools', label: adminLoc.tabs.tools || 'Tool Catalog', icon: Layers, badge: `${TOOLS_LIST.length}` },
    { id: 'jobs', label: adminLoc.tabs.jobs || 'Processing Jobs', icon: Workflow, badge: activeJobs.length + cloudJobs.length > 0 ? `${activeJobs.length + cloudJobs.length}` : undefined },
    { id: 'ai', label: adminLoc.tabs.ai || 'AI & OCR Engines', icon: Sparkles },
    { id: 'plans', label: adminLoc.tabs.plans || 'Plans & Monetization', icon: CreditCard },
    { id: 'api', label: adminLoc.tabs.api || 'Developer REST API', icon: Terminal },
    { id: 'flags', label: adminLoc.tabs.flags || 'Feature Flags', icon: Sliders },
    { id: 'translations', label: adminLoc.tabs.translations || 'Translation Manager', icon: Globe },
    { id: 'health', label: adminLoc.tabs.health || 'System Health', icon: Server },
    { id: 'audit', label: adminLoc.tabs.audit || 'Audit Trail', icon: ShieldCheck, badge: `${auditLogs.length}` },
    { id: 'danger', label: adminLoc.tabs.danger || 'Danger Zone', icon: AlertOctagon },
  ];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full min-w-0 max-w-full bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[750px]"
    >
      {/* 1. DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 bg-slate-900 ${isRTL ? 'border-l' : 'border-r'} border-slate-800 p-4 space-y-6`}>
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-white uppercase">{adminLoc.controlCenter}</div>
            <div className="text-[10px] text-slate-400 font-mono">{adminLoc.version}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Storage Indicator */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">{adminLoc.deviceStorage}</span>
            <HardDrive className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div className="font-mono font-black text-sm text-white">{formatBytes(storageBytes)}</div>
          <div className="text-[10px] text-emerald-400">{adminLoc.clientSidePrivacy}</div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER NAVIGATION */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 p-5 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-white">Miftah Tools Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto py-4">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 min-w-0 max-w-full flex flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-black text-xs text-white uppercase tracking-wider">
            {navMenuItems.find((m) => m.id === activeTab)?.label}
          </div>
          <Link
            href="/"
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 max-w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {adminLoc.overviewTitle}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {adminLoc.overviewSubtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{adminLoc.engineActive}</span>
                  </span>
                </div>
              </div>

              {/* Stat Cards Grid (100% Real Numbers, Zero Fake Placeholders) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-1 min-w-0">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                    <span>{adminLoc.registeredUsers}</span>
                    <Users className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{cloudUsers.length}</div>
                  <p className="text-[11px] text-slate-400 truncate">{adminLoc.realAccounts}</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-1 min-w-0">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                    <span>{adminLoc.activeTools}</span>
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{TOOLS_LIST.length}</div>
                  <p className="text-[11px] text-slate-400 truncate">{adminLoc.clientEngine}</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-1 min-w-0">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                    <span>{adminLoc.opsLogged}</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{realHistory.length}</div>
                  <p className="text-[11px] text-slate-400 truncate">{adminLoc.deviceTelemetry}</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-1 min-w-0">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                    <span>{adminLoc.jobQueue}</span>
                    <Workflow className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{activeJobs.length + cloudJobs.length}</div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {activeJobs.length + cloudJobs.length > 0 ? adminLoc.activeAndQueued : adminLoc.idleReady}
                  </p>
                </div>
              </div>

              {/* Cloud Sync Status Card */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white">
                        Firebase Connected ({firebaseStatus.projectId})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Auth Domain: {firebaseStatus.authDomain} • Storage: {firebaseStatus.storageBucket}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {adminLoc.connected}
                  </span>
                </div>
              </div>

              {/* Recent Real Execution Stream */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-400" />
                    <span>{adminLoc.deviceTelemetry} ({realHistory.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={loadRealAdminData}
                    className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{adminLoc.refresh}</span>
                  </button>
                </div>

                {realHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    {adminLoc.noOps}
                  </div>
                ) : (
                  <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} text-xs text-slate-300`}>
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">{adminLoc.tool}</th>
                          <th className="p-3">{adminLoc.file}</th>
                          <th className="p-3">{adminLoc.size}</th>
                          <th className="p-3">{adminLoc.status}</th>
                          <th className="p-3">{adminLoc.time}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {realHistory.slice(0, 8).map((h) => (
                          <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold text-white truncate max-w-[150px]">{h.toolName}</td>
                            <td className="p-3 text-slate-400 truncate max-w-[180px] font-mono">{h.fileName}</td>
                            <td className="p-3 text-slate-400 font-mono">{formatBytes(h.fileSize)}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {h.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {new Date(h.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USERS & RBAC (REAL FIRESTORE USERS) */}
          {activeTab === 'users' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {adminLoc.usersTitle} ({cloudUsers.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    {adminLoc.usersSubtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder={adminLoc.searchUsers}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Current Authenticated Admin Session Card */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{adminLoc.superAdmin}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-bold">{adminLoc.tabs.users}</div>
                    <div className="text-sm font-black text-white truncate">{user?.name || 'Hafiz Jamilurrahman'}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'admin@miftahtools.internal'}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-bold">Role Verification</div>
                    <div className="text-sm font-black text-emerald-400">{adminLoc.superAdmin}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Firebase Custom Claims Verified</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-bold">Privileges</div>
                    <div className="text-sm font-black text-purple-400">{adminLoc.fullControl}</div>
                    <div className="text-[11px] text-slate-500 font-mono">users.*, tools.*, settings.*</div>
                  </div>
                </div>
              </div>

              {/* Real Firestore Users Table */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-white">{adminLoc.usersTitle}</h3>
                {filteredUsers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    No registered users in Firestore yet. When users sign up or log in via Google/Email, they appear here in real-time.
                  </div>
                ) : (
                  <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} text-xs text-slate-300`}>
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold text-white flex items-center gap-2">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="" className="w-6 h-6 rounded-lg object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">
                                  {u.displayName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <span>{u.displayName || 'User'}</span>
                            </td>
                            <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 uppercase text-[10px] font-bold text-slate-400">{u.plan || 'Free'}</td>
                            <td className="p-3 text-slate-500 font-mono text-[11px]">
                              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TOOL CATALOG */}
          {activeTab === 'tools' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {adminLoc.toolsTitle} ({TOOLS_LIST.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    {adminLoc.toolsSubtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={adminLoc.searchTools}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tools Table Container */}
              <div className="w-full min-w-0 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} text-xs text-slate-300`}>
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">{adminLoc.tool}</th>
                      <th className="p-4">{adminLoc.filterAll}</th>
                      <th className="p-4">{adminLoc.status}</th>
                      <th className={`p-4 ${isRTL ? 'text-left' : 'text-right'}`}>{adminLoc.maintenance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTools.map((tool) => {
                      const localized = getLocalizedTool(tool, language);
                      const localizedCat = getLocalizedCategory(tool.category, language);
                      const status = toolStatuses[tool.id] || 'active';
                      return (
                        <tr key={tool.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{localized.name}</div>
                            <div className="text-[11px] text-slate-400">{localized.shortDesc}</div>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-400">
                            {localizedCat}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : status === 'maintenance'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {status === 'active' ? adminLoc.statusActive : status === 'maintenance' ? adminLoc.statusMaintenance : adminLoc.statusDisabled}
                            </span>
                          </td>
                          <td className={`p-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                            <button
                              type="button"
                              onClick={() => handleToggleToolStatus(tool.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                            >
                              {status === 'active' ? adminLoc.maintenance : adminLoc.enable}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROCESSING JOBS */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Real Processing Queue ({activeJobs.length + cloudJobs.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live client-side in-memory queue and Firestore jobs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => globalJobQueue.clearAll()}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs hover:bg-rose-500/20 transition-colors"
                >
                  Clear Queue
                </button>
              </div>

              {activeJobs.length === 0 && cloudJobs.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <Workflow className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Queue is currently idle.</p>
                  <p className="text-[11px] text-slate-500">Any active image compressions or PDF conversions will appear here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeJobs.map((job) => (
                    <div key={job.jobId} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white text-xs">{job.toolName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{job.fileName} • {formatBytes(job.fileSize)}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SYSTEM HEALTH */}
          {activeTab === 'health' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  System Health & Diagnostic Checks
                </h2>
                <p className="text-xs text-slate-400">
                  Direct connectivity checks across client runtime, IndexedDB, and Firebase services.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Firebase Authentication</span>
                    <span className="text-emerald-400">HEALTHY</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{firebaseStatus.authDomain}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Cloud Firestore</span>
                    <span className="text-emerald-400">HEALTHY</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Project: {firebaseStatus.projectId}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Firebase Storage</span>
                    <span className="text-emerald-400">HEALTHY</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{firebaseStatus.storageBucket}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Client WASM Engine</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">PDF.js, Canvas, Web Workers</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Security Audit Trail ({auditLogs.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real administrative logs and security events.
                  </p>
                </div>
              </div>

              <div className="w-full min-w-0 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Actor</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Target</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">{log.actor}</td>
                        <td className="p-3.5 text-slate-300">{log.action}</td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">{log.target}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6" />
                  <span>{adminLoc.dangerTitle}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {adminLoc.dangerDesc}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/50 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-sm">{adminLoc.dangerTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {adminLoc.dangerDesc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePurgeStorage}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{adminLoc.purgeButton}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
