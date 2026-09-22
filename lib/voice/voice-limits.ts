/**
 * Miftah Tools - Voice to Text Free Usage & Limits Configuration
 */

export const VOICE_LIMITS = {
  // Max recording duration per single microphone session
  MAX_RECORDING_MINUTES: 10,
  // Max audio file duration per upload
  MAX_FILE_MINUTES: 10,
  // Max daily free transcription allowance per device/user
  DAILY_FREE_MINUTES: 30,
  // Max upload file size in Megabytes
  MAX_FILE_SIZE_MB: 50,
  // Supported MIME types and extensions
  SUPPORTED_MIME_TYPES: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'video/webm', // WebM audio recordings
  ],
  SUPPORTED_EXTENSIONS: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.flac'],
};

function getUtcTodayKey(): string {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `miftah_voice_usage_${year}_${month}_${day}`;
}

/**
 * Returns the total minutes transcribed today (UTC timezone)
 */
export function getDailyVoiceUsageMinutes(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = getUtcTodayKey();
    const stored = localStorage.getItem(key);
    return stored ? parseFloat(stored) || 0 : 0;
  } catch (_) {
    return 0;
  }
}

/**
 * Returns the remaining free minutes available for today
 */
export function getRemainingVoiceMinutes(): number {
  const used = getDailyVoiceUsageMinutes();
  return Math.max(0, parseFloat((VOICE_LIMITS.DAILY_FREE_MINUTES - used).toFixed(1)));
}

/**
 * Checks if a requested duration can be transcribed within daily limits
 */
export function canTranscribeDuration(durationSeconds: number): { allowed: boolean; reason?: string } {
  const durationMinutes = durationSeconds / 60;
  
  if (durationMinutes > VOICE_LIMITS.MAX_FILE_MINUTES) {
    return {
      allowed: false,
      reason: `Audio duration (${durationMinutes.toFixed(1)} min) exceeds the maximum allowed ${VOICE_LIMITS.MAX_FILE_MINUTES} minutes per file.`,
    };
  }

  const remaining = getRemainingVoiceMinutes();
  if (durationMinutes > remaining) {
    return {
      allowed: false,
      reason: `Insufficient daily allowance. You have ${remaining.toFixed(1)} minutes left today (requested ${durationMinutes.toFixed(1)} min). Daily limit resets at 00:00 UTC.`,
    };
  }

  return { allowed: true };
}

/**
 * Records newly used transcription minutes for today
 */
export function recordVoiceUsage(durationSeconds: number): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getUtcTodayKey();
    const current = getDailyVoiceUsageMinutes();
    const addedMinutes = Math.max(0.1, durationSeconds / 60);
    const total = parseFloat((current + addedMinutes).toFixed(2));
    localStorage.setItem(key, total.toString());
  } catch (_) {}
}
