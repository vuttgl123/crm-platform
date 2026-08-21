import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CommandPalette } from './CommandPalette';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Read sidebar persistence from cookies
  const defaultOpen = !document.cookie.includes('sidebar:state=collapsed');

  // Handle global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="font-sans text-slate-900 flex h-screen w-full bg-[#f8fafc] overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden">
          <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
          <main id="main-content" className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-(--breakpoint-2xl) w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </SidebarProvider>
  );
};
