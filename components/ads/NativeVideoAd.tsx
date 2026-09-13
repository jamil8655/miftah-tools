'use client';

import React from 'react';
import { AdSlot } from './AdSlot';

export function NativeVideoAd({ className = '' }: { className?: string }) {
  return <AdSlot placement="in-feed" className={className} format="rectangle" />;
}

