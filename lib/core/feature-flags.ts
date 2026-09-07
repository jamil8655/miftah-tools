'use client';

// Miftah Tools Dynamic Feature Flags & Maintenance Mode Architecture
// Allows remote and local control over tool availability, maintenance notices, and experimental features with safe fallbacks.

export interface FeatureFlagsState {
  smartWorkflows: boolean;
  batchProcessing2: boolean;
  aiOcrEngine: boolean;
  mediaDownloader: boolean;
  developerToolkit: boolean;
  privacyCenter: boolean;
  pdfEditorPro: boolean;
  globalMaintenance: boolean;
  disabledTools: string[];
}

const DEFAULT_FLAGS: FeatureFlagsState = {
  smartWorkflows: true,
  batchProcessing2: true,
  aiOcrEngine: true,
  mediaDownloader: true,
  developerToolkit: true,
  privacyCenter: true,
  pdfEditorPro: true,
  globalMaintenance: false,
  disabledTools: [],
};

const STORAGE_KEY = 'nexora_feature_flags';

export function getFeatureFlags(): FeatureFlagsState {
  if (typeof window === 'undefined') return DEFAULT_FLAGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FLAGS;
    return { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_FLAGS;
  }
}

export function updateFeatureFlag<K extends keyof FeatureFlagsState>(key: K, value: FeatureFlagsState[K]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getFeatureFlags();
    const updated = { ...current, [key]: value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export function isToolInMaintenance(toolId: string): boolean {
  const flags = getFeatureFlags();
  if (flags.globalMaintenance) return true;
  return flags.disabledTools.includes(toolId);
}

export function toggleToolMaintenance(toolId: string): boolean {
  const flags = getFeatureFlags();
  const exists = flags.disabledTools.includes(toolId);
  const updatedList = exists
    ? flags.disabledTools.filter((id) => id !== toolId)
    : [...flags.disabledTools, toolId];

  updateFeatureFlag('disabledTools', updatedList);
  return !exists;
}
