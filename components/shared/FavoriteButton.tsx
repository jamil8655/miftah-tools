'use client';

import React from 'react';
import { AddToHomeButton, AddToHomeButtonProps } from './AddToHomeButton';

export interface FavoriteButtonProps {
  toolId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'pill' | 'button';
  directNavigate?: boolean;
}

export function FavoriteButton(props: FavoriteButtonProps) {
  return <AddToHomeButton {...props} />;
}
