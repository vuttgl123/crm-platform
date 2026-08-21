import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getAuthorizedCommandItems } from '@/core/navigation/routeResolver';
import { NAVIGATION_GROUP_DEFINITIONS } from '@/config/navigationConfig';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import { AppRouteManifestItem } from '@/types/navigation';
import { getNavigationIcon } from '@/config/navigationIcons';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { session } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems = getAuthorizedCommandItems(session);

  const getGroupTitle = (item: AppRouteManifestItem) => {
    if (!item.groupId) return t('common.appName', 'VUM CRM');
    const groupDef = NAVIGATION_GROUP_DEFINITIONS.find(g => g.id === item.groupId);
    return groupDef ? t(groupDef.titleKey) : '';
  };

  const filtered = commandItems.filter(item => {
    const title = t(item.titleKey);
    const groupTitle = getGroupTitle(item);
    const q = query.toLowerCase().trim();
    return title.toLowerCase().includes(q) || groupTitle.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex].path);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      {/* Overlay click handler */}
      <div className="fixed inset-0" onClick={onClose} />
      
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh] relative z-10"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder', 'Tìm kiếm chức năng, menu (Ctrl+K)...')}
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              {t('common.noResults', 'Không tìm thấy chức năng phù hợp hoặc bạn không có quyền truy cập.')}
            </div>
          ) : (
            filtered.map((item, index) => {
              const title = t(item.titleKey);
              const groupTitle = getGroupTitle(item);
              const Icon = getNavigationIcon(item.iconName);
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors group",
                    isSelected ? "bg-slate-100" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      isSelected ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                      )}>
                        {title}
                      </div>
                      <div className="text-xs text-slate-500">{groupTitle}</div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
          <span>Use ↑ ↓ to navigate, Enter to select</span>
          <span className="font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
