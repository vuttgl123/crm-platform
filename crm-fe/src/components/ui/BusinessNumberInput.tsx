import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface BusinessNumberInputProps {
  id?: string;
  label?: string;
  value: string; // Raw numeric string e.g. "350000000000"
  onChange: (rawValue: string) => void;
  placeholder?: string;
  unitSuffix?: string; // e.g. "USD", "employees"
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * Utility to convert numbers to short, concise business reading
 * e.g., 500,000,000,000 -> 500 Billion USD
 * e.g., 5,091,000,000 -> 5.09 Billion USD
 * e.g., 2,500 -> 2,500 employees
 */
export function formatBusinessReading(numStr?: string | number | null, unitSuffix = ''): string {
  if (numStr === undefined || numStr === null || numStr === '') return '';
  const num = typeof numStr === 'number' ? numStr : parseFloat(numStr.toString().replace(/[^0-9.-]+/g, ''));
  if (isNaN(num) || num === 0) return '';

  if (num >= 1_000_000_000_000) {
    const trillion = num / 1_000_000_000_000;
    const formatted = Number.isInteger(trillion)
      ? new Intl.NumberFormat('en-US').format(trillion)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(trillion);
    return `${formatted} Trillion ${unitSuffix}`.trim();
  }

  if (num >= 1_000_000_000) {
    const billion = num / 1_000_000_000;
    const formatted = Number.isInteger(billion)
      ? new Intl.NumberFormat('en-US').format(billion)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(billion);
    return `${formatted} Billion ${unitSuffix}`.trim();
  }

  if (num >= 1_000_000) {
    const million = num / 1_000_000;
    const formatted = Number.isInteger(million)
      ? new Intl.NumberFormat('en-US').format(million)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(million);
    return `${formatted} Million ${unitSuffix}`.trim();
  }

  if (num >= 1_000 && unitSuffix !== 'employees') {
    const thousand = num / 1_000;
    const formatted = Number.isInteger(thousand)
      ? new Intl.NumberFormat('en-US').format(thousand)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(thousand);
    return `${formatted} Thousand ${unitSuffix}`.trim();
  }

  return `${new Intl.NumberFormat('en-US').format(num)} ${unitSuffix}`.trim();
}

/**
 * Backward compatibility alias
 */
export const formatVietnameseReading = formatBusinessReading;

/**
 * Format string with thousand separators (en-US locale: 500,000,000,000)
 */
export function formatThousandSeparator(numStr: string): string {
  if (!numStr) return '';
  const cleanStr = numStr.replace(/[^0-9]/g, '');
  if (!cleanStr) return '';
  return new Intl.NumberFormat('en-US').format(parseInt(cleanStr, 10));
}

export const BusinessNumberInput: React.FC<BusinessNumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  unitSuffix = '',
  disabled = false,
  icon,
}) => {
  const numericValue = value ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : 0;
  const formattedThousandStr = formatThousandSeparator(value);
  const businessReadingText = numericValue > 0 ? formatBusinessReading(value, unitSuffix) : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawDigits);
  };

  return (
    <div className="space-y-1.5 font-sans">
      {label && (
        <Label htmlFor={id} className="text-xs font-semibold flex items-center gap-1.5 text-slate-800">
          {icon}
          <span>{label}</span>
        </Label>
      )}

      <Input
        id={id}
        type="text"
        value={formattedThousandStr}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder={placeholder || 'Enter amount or quantity...'}
        className="text-xs font-mono font-bold transition-all bg-white text-slate-900 border-slate-200"
      />

      {/* Dynamic Reading Preview Badge Below Input */}
      {numericValue > 0 && (
        <div className="flex items-center gap-2 pt-0.5">
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 font-normal text-[11px] gap-1 px-2 py-0.5"
          >
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Scale: </span>
            <strong className="font-semibold text-blue-700">{businessReadingText}</strong>
          </Badge>
        </div>
      )}
    </div>
  );
};
