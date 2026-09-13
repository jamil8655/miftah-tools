/**
 * Clean and robust HTML sanitization utility to prevent XSS attacks.
 * Strips script tags, event handlers (onclick, onerror, onload, etc.),
 * javascript: / vbscript: / unsafe data: URIs, and dangerous elements (iframe, object, embed).
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  return dirtyHtml
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove dangerous tags
    .replace(/<\/?(?:iframe|object|embed|applet|form|base|meta|link)[^>]*>/gi, '')
    // Remove inline event handlers (onerror, onclick, onload, etc.)
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: and vbscript: URIs
    .replace(/(?:href|src|action)\s*=\s*['"]?\s*(?:javascript|vbscript):[^'">\s]*/gi, '')
    // Remove data: URLs on src unless safe image formats
    .replace(/src\s*=\s*['"]?data:(?!image\/(?:png|jpeg|jpg|webp|gif|svg\+xml))[^'">\s]*/gi, '');
}
