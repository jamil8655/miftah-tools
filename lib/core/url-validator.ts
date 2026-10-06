'use client';

/**
 * Miftah Tools Centralized URL & SSRF Validation Engine
 * Protects against Server-Side Request Forgery (SSRF), private LAN scanning,
 * cloud metadata exposure (169.254.169.254), loopback addresses, and dangerous protocols.
 */

// Forbidden IP patterns and internal hostname identifiers
const FORBIDDEN_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'wpad',
];

const PRIVATE_IP_RANGES = [
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,                    // 192.168.0.0/16
  /^127\./,                         // 127.0.0.0/8
  /^169\.254\./,                    // 169.254.0.0/16 Link-Local
  /^fc00:/i,                        // IPv6 Unique Local Address
  /^fe80:/i,                        // IPv6 Link-Local Address
];

/**
 * Validates whether a given URL is safe for public requests.
 */
export function isSafePublicUrl(rawUrl: string): { safe: boolean; reason?: string; parsedUrl?: URL } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'Empty or invalid URL.' };
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, reason: 'Malformed URL structure.' };
  }

  // 1. Enforce HTTPS / HTTP protocol only
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { safe: false, reason: `Unsafe protocol: ${parsed.protocol}. Only HTTPS is permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Block loopback and metadata hostnames
  if (FORBIDDEN_HOSTNAMES.includes(hostname)) {
    return { safe: false, reason: 'Access to loopback, local network, or cloud metadata is prohibited.' };
  }

  // 3. Block private IP ranges
  for (const regex of PRIVATE_IP_RANGES) {
    if (regex.test(hostname)) {
      return { safe: false, reason: 'Access to private internal network addresses is prohibited.' };
    }
  }

  // 4. Block dangerous local TLDs
  if (
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.arpa')
  ) {
    return { safe: false, reason: 'Access to local or corporate internal domains is prohibited.' };
  }

  return { safe: true, parsedUrl: parsed };
}
