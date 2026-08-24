import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAccountOptionsQuery, useContactAccountQuery } from '../hooks/contactQueries';
import { Building2, Check, ChevronsUpDown, Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactAccountPickerProps {
  value?: string | null;
  onChange: (accountId: string | null) => void;
  disabled?: boolean;
}

export const ContactAccountPicker: React.FC<ContactAccountPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: options = [], isLoading: isLoadingOptions } = useAccountOptionsQuery(searchTerm);
  const { data: selectedAccount, isLoading: isLoadingSelected } = useContactAccountQuery(value);

  const selectedDisplayName =
    selectedAccount?.displayName ||
    options.find((opt) => opt.id === value)?.displayName ||
    (value ? `Account (${value.slice(0, 8)}…)` : null);

  const handleSelect = (accountId: string) => {
    if (value === accountId) {
      onChange(null);
    } else {
      onChange(accountId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-8 text-xs font-normal bg-white border-slate-200 rounded-[3px] hover:bg-slate-50',
            !value && 'text-slate-400'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLoadingSelected ? (
              <span className="text-slate-400 inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading account…
              </span>
            ) : (
              <span className="truncate">
                {selectedDisplayName || 'Select linked account (optional)…'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {value && !disabled && (
              <span
                role="button"
                onClick={handleClear}
                className="p-0.5 rounded-[2px] hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                title="Unlink account"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0 shadow-lg border-slate-200 rounded-[4px]" align="start">
        <div className="p-2 border-b border-slate-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by name or number…"
            className="h-8 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 shadow-none rounded-[3px]"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-[220px] overflow-y-auto p-1 text-xs">
          {isLoadingOptions ? (
            <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching accounts…</span>
            </div>
          ) : options.length === 0 ? (
            <div className="py-4 text-center text-slate-400 italic">
              No matching accounts found
            </div>
          ) : (
            options.map((acc) => {
              const isSelected = value === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelect(acc.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left transition-colors',
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate">{acc.displayName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {acc.accountNumber}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
