'use client';

// Miftah Tools Centralized Standardized Error System
// Safely transforms technical errors into clean, user-friendly messages while keeping internal diagnostics secure.

export type MiftahErrorCode =
  | 'INVALID_FILE'
  | 'INVALID_PDF'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'NETWORK_ERROR'
  | 'PROCESSING_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'PERMISSION_DENIED'
  | 'API_UNAVAILABLE'
  | 'STORAGE_ERROR';

export interface MiftahErrorDetail {
  code: MiftahErrorCode;
  message: string;
  actionableHint: string;
  technicalInfo?: string;
  timestamp: number;
}

export const ERROR_MESSAGES: Record<MiftahErrorCode, { message: string; hint: string }> = {
  INVALID_FILE: {
    message: 'The selected file is corrupted or cannot be read.',
    hint: 'Please check that the file opens correctly on your device and try uploading again.',
  },
  INVALID_PDF: {
    message: 'The PDF file is malformed, password-protected, or damaged.',
    hint: 'If password-protected, unlock the document first before processing.',
  },
  FILE_TOO_LARGE: {
    message: 'This file exceeds the maximum allowed processing size (500MB).',
    hint: 'Please choose a smaller file or use our Image/PDF Compressor first.',
  },
  UNSUPPORTED_FORMAT: {
    message: 'This file format is not supported for this tool.',
    hint: 'Please check the supported format list displayed on the upload area.',
  },
  NETWORK_ERROR: {
    message: 'Your internet connection was interrupted.',
    hint: 'Check your connection and click Retry to resume.',
  },
  PROCESSING_ERROR: {
    message: 'An error occurred during file transformation.',
    hint: 'Click the Retry button or try selecting an alternative output preset.',
  },
  TIMEOUT: {
    message: 'The processing operation timed out.',
    hint: 'For very large files, try splitting the document into smaller chunks.',
  },
  RATE_LIMITED: {
    message: 'Too many requests sent in a short period.',
    hint: 'Please wait a few moments before submitting another request.',
  },
  PERMISSION_DENIED: {
    message: 'Access to this operation or feature is restricted.',
    hint: 'Ensure you have proper access privileges or verify your account.',
  },
  API_UNAVAILABLE: {
    message: 'The external processing service is temporarily unreachable.',
    hint: 'Our failover engine is switching to a secondary cluster. Please retry in a few seconds.',
  },
  STORAGE_ERROR: {
    message: 'Local browser storage quota exceeded.',
    hint: 'Visit the Privacy Center to purge temporary cached files and free up space.',
  },
};

/**
 * Normalizes any caught exception into a standardized MiftahErrorDetail.
 */
export function normalizeError(err: any, fallbackCode: MiftahErrorCode = 'PROCESSING_ERROR'): MiftahErrorDetail {
  const errString = (err?.message || String(err || '')).toLowerCase();

  let code: MiftahErrorCode = fallbackCode;

  if (errString.includes('size') || errString.includes('too large') || errString.includes('413')) {
    code = 'FILE_TOO_LARGE';
  } else if (errString.includes('network') || errString.includes('fetch') || errString.includes('offline')) {
    code = 'NETWORK_ERROR';
  } else if (errString.includes('pdf') && (errString.includes('invalid') || errString.includes('corrupt') || errString.includes('password'))) {
    code = 'INVALID_PDF';
  } else if (errString.includes('rate') || errString.includes('429') || errString.includes('limit')) {
    code = 'RATE_LIMITED';
  } else if (errString.includes('storage') || errString.includes('quota')) {
    code = 'STORAGE_ERROR';
  }

  const def = ERROR_MESSAGES[code] || ERROR_MESSAGES.PROCESSING_ERROR;

  return {
    code,
    message: def.message,
    actionableHint: def.hint,
    technicalInfo: process.env.NODE_ENV === 'development' ? err?.message : undefined,
    timestamp: Date.now(),
  };
}
