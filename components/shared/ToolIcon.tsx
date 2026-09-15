'use client';

import React from 'react';
import { FileText, Image as ImageIcon, Minimize2, ScanText, Binary, QrCode, Zap, ShieldCheck, ArrowRight, Search, CheckCircle2, Lock, Unlock, ChevronRight, PenTool, Layers, Bookmark, Code2, Type, Fingerprint, Combine, Split, FileImage, RotateCw, Stamp, Hash, Tag, FileCode, Repeat, ArrowRightLeft, Maximize2, FlipHorizontal, Table, GitCompare, ListFilter, Scale, Activity, Percent, Clock, Palette, KeyRound, Barcode, Brain, HardDrive, Cpu, Sliders, Scissors, FileStack, FolderArchive, FileSpreadsheet, FileArchive, Crop, FileCheck, Eye, EyeOff, FilePlus, FileMinus, Wrench, Calculator, Workflow, Download, Upload, RefreshCw, Folder, SlidersHorizontal, Terminal, Film, Video, Music, Volume2, FastForward, Key, Shield, Calendar, ArrowUpDown, Shuffle, Settings2, FileSignature, Bot, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  // Document & PDF Operations
  Combine: Combine,
  Split: Split,
  Minimize2: Minimize2,
  Minimize: Minimize2,
  FileImage: FileImage,
  Image: ImageIcon,
  ImageIcon: ImageIcon,
  RotateCw: RotateCw,
  Stamp: Stamp,
  Hash: Hash,
  Tag: Tag,
  FileText: FileText,
  FileCode: FileCode,
  Repeat: Repeat,
  ArrowRightLeft: ArrowRightLeft,
  Maximize2: Maximize2,
  FlipHorizontal: FlipHorizontal,
  ShieldCheck: ShieldCheck,
  Shield: Shield,
  Table: Table,
  Type: Type,
  GitCompare: GitCompare,
  ListFilter: ListFilter,
  Binary: Binary,
  Scale: Scale,
  Activity: Activity,
  Percent: Percent,
  Code2: Code2,
  Clock: Clock,
  Palette: Palette,
  Fingerprint: Fingerprint,
  KeyRound: KeyRound,
  Key: Key,
  ScanText: ScanText,
  QrCode: QrCode,
  Sparkles: Zap,
  Star: Bookmark,
  Zap: Zap,
  Bookmark: Bookmark,
  Layers: Layers,
  Scissors: Scissors,
  FileStack: FileStack,
  Brain: Brain,
  Bot: Bot,
  Cpu: Cpu,
  Sliders: Sliders,
  SlidersHorizontal: SlidersHorizontal,
  Crop: Crop,
  Lock: Lock,
  Unlock: Unlock,
  FolderArchive: FolderArchive,
  FileSpreadsheet: FileSpreadsheet,
  FileArchive: FileArchive,
  FileCheck: FileCheck,
  Eye: Eye,
  EyeOff: EyeOff,
  FilePlus: FilePlus,
  FileMinus: FileMinus,
  Wrench: Wrench,
  Calculator: Calculator,
  Workflow: Workflow,
  Download: Download,
  Upload: Upload,
  RefreshCw: RefreshCw,
  Folder: Folder,
  PenTool: PenTool,
  Terminal: Terminal,
  Film: Film,
  Video: Video,
  Music: Music,
  Volume2: Volume2,
  FastForward: FastForward,
  Calendar: Calendar,
  ArrowUpDown: ArrowUpDown,
  Shuffle: Shuffle,
  Settings2: Settings2,
  FileSignature: FileSignature,
};

interface ToolIconProps {
  name: string;
  className?: string;
}

export function ToolIcon({ name, className = 'w-5 h-5' }: ToolIconProps) {
  // Check exact name match or case-insensitive match
  let IconComponent = ICON_MAP[name];

  if (!IconComponent && name) {
    const matchedKey = Object.keys(ICON_MAP).find(
      (k) => k.toLowerCase() === name.toLowerCase().replace(/[-_]/g, '')
    );
    if (matchedKey) {
      IconComponent = ICON_MAP[matchedKey];
    }
  }

  // Graceful standard fallback
  const FinalIcon = IconComponent || FileText;
  return <FinalIcon className={className} />;
}
