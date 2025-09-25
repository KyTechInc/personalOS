'use client';

import React, { useState } from 'react';
import MacOSDock from './ui/macos-dock';
import { AppItem, defaultApps } from '@/lib/dock-apps';


interface DockProps {
  apps?: AppItem[];
  onAppClick?: (appId: string) => void;
  openApps?: string[];
}

const DockDemo: React.FC<DockProps> = ({ apps = defaultApps, onAppClick, openApps: propOpenApps = ['finder', 'safari'] }) => {
  const [openApps, setOpenApps] = useState<string[]>(propOpenApps);

  const handleAppClick = (appId: string) => {
    setOpenApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
    onAppClick?.(appId);
  };

  return (
    <MacOSDock
      apps={apps}
      onAppClick={handleAppClick}
      openApps={openApps}
    />
  );
};

export default DockDemo;