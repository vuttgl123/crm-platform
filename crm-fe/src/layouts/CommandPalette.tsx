import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Layers, Clock } from 'lucide-react';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { useAuth } from '@/core/session/useAuth';
import { canAccessRoute } from '@/core/permissions/evaluator';
import { NavigationItem } from '@/types/navigation';
import { useTranslation } from 'react-i18next';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { session } = useAuth();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const isVi = !i18n.language || i18n.language.startsWith('vi');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state trigger
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allItems: { item: NavigationItem; groupTitle: string }[] = [];
  NAVIGATION_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (canAccessRoute(item, session)) {
        allItems.push({
          item,
          groupTitle: isVi ? group.titleVi : group.titleEn,
        });
      }
    });
  });

  const filtered = allItems.filter(({ item, groupTitle }) => {
    const title = isVi ? item.titleVi : item.titleEn;
    const q = query.toLowerCase().trim();
    return title.toLowerCase().includes(q) || groupTitle.toLowerCase().includes(q);
  });

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
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

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Không tìm thấy chức năng phù hợp hoặc bạn không có quyền truy cập.
            </div>
          ) : (
            filtered.map(({ item, groupTitle }) => {
              const title = isVi ? item.titleVi : item.titleEn;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600">
                        {title}
                      </div>
                      <div className="text-xs text-slate-500">{groupTitle}</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Sắp ra mắt
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
          <span>Dùng phím ↑ ↓ để di chuyển, Enter để chọn</span>
          <span className="font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">ESC để đóng</span>
        </div>
      </div>
    </div>
  );
};
