import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Online Tools & Utilities Directory',
  description: 'Explore 220+ free high-performance client-side digital tools: PDF conversion, image manipulation, OCR text extraction, media tools, and developer utilities.',
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
