'use client';

// Miftah Tools In-Browser High-Capacity Storage Manager (IndexedDB + LocalStorage Hybrid)
// Compliant with Zero-Data-Loss, TTL Auto-Expiration, and Zero Stale Cache Architecture.

export interface StoredFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  blobUrl?: string;
  dataUrl?: string;
  toolUsed: string;
  createdAt: number;
  expiresAt: number; // TTL timestamp
  isFavorite: boolean;
  category: string;
  dimensions?: string;
  pageCount?: number;
}

export interface ActivityHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  category: string;
  fileName: string;
  fileSize: number;
  status: 'Completed' | 'Processing' | 'Failed' | 'Cancelled';
  durationMs: number;
  timestamp: number;
  resultSummary?: string;
  downloadUrl?: string;
}

export interface WorkflowStep {
  id: string;
  toolId: string;
  toolName: string;
  options: Record<string, any>;
  status: 'Waiting' | 'Processing' | 'Completed' | 'Failed';
  error?: string;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  steps: WorkflowStep[];
  isTemplate?: boolean;
}

const DB_NAME = 'nexora_tools_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window undefined'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('createdAt', 'createdAt', { unique: false });
          fileStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }
        if (!db.objectStoreNames.contains('history')) {
          const histStore = db.createObjectStore('history', { keyPath: 'id' });
          histStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('workflows')) {
          const wfStore = db.createObjectStore('workflows', { keyPath: 'id' });
          wfStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

// ==================== 1. MY FILES STORE ====================
export async function saveProcessedFile(item: Omit<StoredFileItem, 'id' | 'createdAt' | 'expiresAt' | 'isFavorite'>): Promise<StoredFileItem> {
  try {
    const db = await getDB();
    const id = 'file_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const now = Date.now();
    const newItem: StoredFileItem = {
      ...item,
      id,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24-hour default TTL
      isFavorite: false,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const req = store.put(newItem);
      req.onsuccess = () => resolve(newItem);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save file in IndexedDB:', err);
    throw err;
  }
}

export async function getAllStoredFiles(): Promise<StoredFileItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const req = store.getAll();
      req.onsuccess = () => {
        const now = Date.now();
        // Filter out expired items
        const valid = (req.result || []).filter((f: StoredFileItem) => f.expiresAt > now || f.isFavorite);
        resolve(valid.sort((a, b) => b.createdAt - a.createdAt));
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

export async function deleteStoredFile(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

export async function toggleFileFavorite(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const item = getReq.result as StoredFileItem;
        if (item) {
          item.isFavorite = !item.isFavorite;
          store.put(item);
          resolve(item.isFavorite);
        } else {
          resolve(false);
        }
      };
      getReq.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

// ==================== 2. PROCESSING HISTORY ====================
export async function logActivity(item: Omit<ActivityHistoryItem, 'id' | 'timestamp'>): Promise<ActivityHistoryItem> {
  try {
    const db = await getDB();
    const id = 'act_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const newActivity: ActivityHistoryItem = {
      ...item,
      id,
      timestamp: Date.now(),
    };

    return new Promise((resolve) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.put(newActivity);
      resolve(newActivity);
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
    return {
      ...item,
      id: 'fallback_' + Date.now(),
      timestamp: Date.now(),
    };
  }
}

export async function getActivityHistory(limit = 50): Promise<ActivityHistoryItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as ActivityHistoryItem[];
        resolve(list.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit));
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

export async function clearActivityHistory(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('history', 'readwrite');
    tx.objectStore('history').clear();
  } catch (err) {}
}

// ==================== 3. SMART SAVED WORKFLOWS ====================
export const DEFAULT_WORKFLOW_TEMPLATES: SavedWorkflow[] = [
  {
    id: 'wf_passport_studio',
    name: 'Government Exam & Passport Suite',
    description: 'Remove background ➔ 3.5x4.5cm India/Visa Crop ➔ Add DOP Name Strip ➔ Generate 8-Photo 4x6" Sheet.',
    category: 'image',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 's1', toolId: 'background-remover', toolName: 'AI Background Cutout', options: { tolerance: 30 }, status: 'Waiting' },
      { id: 's2', toolId: 'passport-photo-maker', toolName: 'Passport Cropper & Name Strip', options: { preset: 'in-passport' }, status: 'Waiting' },
      { id: 's3', toolId: 'image-compressor', toolName: 'Exact Size Compression (< 50KB)', options: { targetSize: '50kb' }, status: 'Waiting' },
    ],
  },
  {
    id: 'wf_pdf_optimizer',
    name: 'Official PDF Document Package',
    description: 'Compress PDF ➔ Stamp Confidential Watermark ➔ Number Pages ➔ Export Ready File.',
    category: 'pdf',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 'p1', toolId: 'compress-pdf', toolName: 'Smart PDF Compression', options: { strength: 'medium' }, status: 'Waiting' },
      { id: 'p2', toolId: 'pdf-page-numbers', toolName: 'Add Header/Footer Page Numbers', options: { format: 'Page X of Y' }, status: 'Waiting' },
      { id: 'p3', toolId: 'watermark-pdf', toolName: 'Confidential Watermark Stamp', options: { text: 'CONFIDENTIAL' }, status: 'Waiting' },
    ],
  },
  {
    id: 'wf_web_image_polish',
    name: 'Web & E-Commerce Product Image',
    description: 'Remove Background ➔ Resize to 1200x1200px ➔ Convert to WebP Lossless.',
    category: 'image',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
    steps: [
      { id: 'w1', toolId: 'background-remover', toolName: 'Transparent Background Cutout', options: { bgColor: 'transparent' }, status: 'Waiting' },
      { id: 'w2', toolId: 'image-resizer', toolName: 'Resize to 1200x1200px', options: { width: 1200, height: 1200 }, status: 'Waiting' },
      { id: 'w3', toolId: 'image-converter', toolName: 'Convert to Next-Gen WebP', options: { targetFormat: 'image/webp' }, status: 'Waiting' },
    ],
  },
];

export async function getSavedWorkflows(): Promise<SavedWorkflow[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('workflows', 'readonly');
      const store = tx.objectStore('workflows');
      const req = store.getAll();
      req.onsuccess = () => {
        const userWfs = (req.result || []) as SavedWorkflow[];
        // Combine user workflows with default templates
        const combined = [...userWfs, ...DEFAULT_WORKFLOW_TEMPLATES.filter((t) => !userWfs.some((u) => u.id === t.id))];
        resolve(combined.sort((a, b) => b.updatedAt - a.updatedAt));
      };
      req.onerror = () => resolve(DEFAULT_WORKFLOW_TEMPLATES);
    });
  } catch (err) {
    return DEFAULT_WORKFLOW_TEMPLATES;
  }
}

export async function saveWorkflow(wf: SavedWorkflow): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('workflows', 'readwrite');
    tx.objectStore('workflows').put({
      ...wf,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save workflow:', err);
  }
}

export async function deleteWorkflow(id: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('workflows', 'readwrite');
    tx.objectStore('workflows').delete(id);
  } catch (err) {}
}

// 1-Click Complete Storage Purge (No Stale Data Rule)
export async function purgeAllLocalData(): Promise<void> {
  try {
    const db = await getDB();
    const tx1 = db.transaction('files', 'readwrite');
    tx1.objectStore('files').clear();

    const tx2 = db.transaction('history', 'readwrite');
    tx2.objectStore('history').clear();

    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  } catch (err) {}
}
