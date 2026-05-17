import { ReactNode } from 'react';

export interface AppConfig {
  id: string;
  title: string;
  icon: JSX.Element;
  component: React.FC<{ windowId?: string }>;
  defaultWidth?: number;
  defaultHeight?: number;
  backgroundColor?: string;
}

export interface OSWindow {
  id: string;
  appId: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
