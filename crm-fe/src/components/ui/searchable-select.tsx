import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  popoverWidth?: string | number;
  disabled?: boolean;
  clearable?: boolean;
  renderOption?: (option: SearchableSelectOption, isSelected: boolean) => React.ReactNode;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  value,
  onValueChange,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Nhập để tìm kiếm...',
  emptyText = 'Không tìm thấy kết quả phù hợp.',
  className,
  triggerClassName,
  popoverClassName,
  popoverWidth,
  disabled = false,
  clearable = false,
  renderOption,
}) => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query)) ||
        (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  React.useEffect(() => {
    if (open) {
      setSearchQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
  };

  return (
    <div className={cn('relative inline-block w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between h-9 px-3 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-900',
              !value && 'text-slate-500 font-normal',
              disabled && 'opacity-50 cursor-not-allowed',
              triggerClassName
            )}
          >
            <span className="truncate flex items-center gap-2">
              {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              {selectedOption?.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </span>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {clearable && value && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded-sm hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
              <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          style={popoverWidth ? { width: popoverWidth } : undefined}
          className={cn(
            'p-0 z-50 rounded-[4px] border border-slate-200 bg-white shadow-lg text-slate-900 w-[var(--radix-popover-trigger-width)] min-w-[200px]',
            popoverClassName
          )}
        >
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70 rounded-t-[3px]">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 border-none outline-none focus:outline-none focus:border-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none p-0 shadow-none ring-0"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-slate-500">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-[3px] text-xs transition-colors flex items-center justify-between gap-2',
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100',
                      option.disabled && 'opacity-50 cursor-not-allowed bg-transparent'
                    )}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {option.icon && <span className="shrink-0">{option.icon}</span>}
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-[11px] text-slate-400 font-normal truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {option.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-slate-100 text-slate-600 font-mono font-medium shrink-0 border border-slate-200/60">
                            {option.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
