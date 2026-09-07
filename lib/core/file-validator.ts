'use client';

// Miftah Tools Central File Validator & Security Guard
// Validates file signatures (magic bytes), MIME types, extensions, size limits, and sanitizes filenames.

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: string;
  sanitizedName?: string;
}

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB Default Limit

// Known File Signatures (Magic Bytes)
const MAGIC_SIGNATURES: { ext: string; mime: string; bytes: number[] }[] = [
  { ext: 'pdf', mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { ext: 'png', mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: 'jpg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { ext: 'jpeg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { ext: 'webp', mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  { ext: 'zip', mime: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK..
  { ext: 'mp3', mime: 'audio/mpeg', bytes: [0x49, 0x44, 0x33] }, // ID3
  { ext: 'gif', mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
];

/**
 * Sanitize filename to prevent directory traversal and script injection.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  // Strip path traversal characters, backslashes, forward slashes, and null bytes
  let clean = filename
    .replace(/^.*[\\\/]/, '')
    .replace(/\.\./g, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim();

  if (clean.length > 200) {
    const ext = clean.split('.').pop() || '';
    clean = clean.substring(0, 190) + (ext ? `.${ext}` : '');
  }
  return clean || 'file';
}

/**
 * Validates a file against allowed MIME types, max size, and true binary magic bytes.
 */
export async function validateFile(
  file: File,
  allowedMimes: string[] = ['*/*'],
  maxSize: number = MAX_FILE_SIZE_BYTES
): Promise<ValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. File Size Check
  if (file.size > maxSize) {
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds the allowed limit of ${maxMb}MB.`,
    };
  }

  // 2. Filename Check & Sanitization
  const sanitizedName = sanitizeFilename(file.name);

  // 3. Allowed MIME Wildcard
  if (allowedMimes.includes('*/*') || allowedMimes.length === 0) {
    return { valid: true, sanitizedName, detectedType: file.type };
  }

  // 4. MIME Type Prefix / Exact Check
  const mimeMatches = allowedMimes.some((m) => {
    if (m.endsWith('/*')) {
      const prefix = m.split('/')[0];
      return file.type.startsWith(`${prefix}/`);
    }
    return file.type === m || m.includes(file.type);
  });

  // 5. Binary Magic Bytes Inspection (First 16 bytes)
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (const sig of MAGIC_SIGNATURES) {
      if (sig.bytes.every((b, i) => bytes[i] === b)) {
        return {
          valid: true,
          detectedType: sig.mime,
          sanitizedName,
        };
      }
    }
  } catch (e) {
    // Fallback to standard MIME check if ArrayBuffer read fails
  }

  if (!mimeMatches) {
    return {
      valid: false,
      error: `Unsupported file format. Please upload: ${allowedMimes.join(', ')}`,
      sanitizedName,
    };
  }

  return {
    valid: true,
    sanitizedName,
    detectedType: file.type,
  };
}
