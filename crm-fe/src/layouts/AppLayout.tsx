import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex w-full bg-slate-50 text-slate-900 font-sans">
      {/* Clean Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

        {/* Mock Mode Banner */}
        {env.useMocks && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 text-xs text-blue-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span>
                {t(
                  'common.mockModeNotice',
                  'Ứng dụng đang chạy ở chế độ Mock Data (dữ liệu mô phỏng). Không có kết nối cơ sở dữ liệu thực.'
                )}
              </span>
            </div>
            <span className="font-mono text-[10px] bg-blue-100 px-1.5 py-0.5 rounded font-medium">
              VUM Mock Service
            </span>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 px-4 md:px-8 py-6 w-full max-w-[1920px] mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
