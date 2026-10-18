'use client';

/**
 * Generates a high-resolution, adaptive-friendly 192x192 icon for Android Home Screen Shortcuts
 */
export function generateToolShortcutIcon(
  toolId: string,
  toolName: string,
  category: string = 'utility'
): string {
  if (typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const id = (toolId || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // 1. Determine Gradient Colors based on tool category and action
    let colorStart = '#0284c7';
    let colorEnd = '#1d4ed8';

    if (id.includes('word') || id.includes('docx')) {
      colorStart = '#2563eb';
      colorEnd = '#1e40af';
    } else if (id.includes('compress')) {
      colorStart = '#f59e0b';
      colorEnd = '#d97706';
    } else if (id.includes('split')) {
      colorStart = '#10b981';
      colorEnd = '#047857';
    } else if (id.includes('merge')) {
      colorStart = '#06b6d4';
      colorEnd = '#0e7490';
    } else if (id.includes('edit')) {
      colorStart = '#8b5cf6';
      colorEnd = '#6d28d9';
    } else if (id.includes('ocr') || id.includes('extract')) {
      colorStart = '#ec4899';
      colorEnd = '#be185d';
    } else if (id.includes('scan') || id.includes('camera')) {
      colorStart = '#0ea5e9';
      colorEnd = '#0284c7';
    } else if (id.includes('voice') || id.includes('speech')) {
      colorStart = '#f97316';
      colorEnd = '#c2410c';
    } else if (id.includes('qr') || id.includes('bar')) {
      colorStart = '#6366f1';
      colorEnd = '#4338ca';
    } else if (cat === 'pdf') {
      colorStart = '#ef4444';
      colorEnd = '#b91c1c';
    }

    // 2. Draw Rounded Squircle Background
    const r = 40;
    const x = 8;
    const y = 8;
    const w = 176;
    const h = 176;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();

    // Fill Gradient
    const grad = ctx.createLinearGradient(0, 0, 192, 192);
    grad.addColorStop(0, colorStart);
    grad.addColorStop(1, colorEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 192, 192);

    // Subtle inner glossy highlight
    const gloss = ctx.createLinearGradient(0, 0, 0, 96);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, 192, 96);

    ctx.restore();

    // 3. Central Icon Glyph / Label
    let glyph = 'PDF';
    if (id.includes('word') || id.includes('docx')) glyph = 'DOC';
    else if (id.includes('compress')) glyph = 'ZIP';
    else if (id.includes('split')) glyph = 'SPLIT';
    else if (id.includes('merge')) glyph = 'MERGE';
    else if (id.includes('edit')) glyph = 'EDIT';
    else if (id.includes('scan') || id.includes('camera')) glyph = 'SCAN';
    else if (id.includes('ocr')) glyph = 'OCR';
    else if (id.includes('voice') || id.includes('speech')) glyph = 'VOICE';
    else if (id.includes('qr')) glyph = 'QR';
    else if (id.includes('image')) glyph = 'IMG';
    else {
      // Pick first two letters of tool name
      glyph = (toolName || 'TOOL').substring(0, 4).toUpperCase();
    }

    // Draw White Centered Monogram Pill
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.roundRect(32, 50, 128, 64, 16);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillText(glyph, 96, 82);
    ctx.restore();

    // 4. Bottom Branding Tag: "MIFTAH"
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('MIFTAH TOOLS', 96, 142);
    ctx.restore();

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Failed to generate tool shortcut icon:', e);
    return '';
  }
}
