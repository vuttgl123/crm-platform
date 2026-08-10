/**
 * Centralized locale-aware formatters for dates, times, numbers, and currency.
 * Defaults to Vietnamese formatting (vi-VN) with fallback support.
 */

export function formatDate(
  dateValue: string | Date | undefined | null,
  locale: string = 'vi-VN'
): string {
  if (!dateValue) return '—';
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatDateTime(
  dateValue: string | Date | undefined | null,
  locale: string = 'vi-VN'
): string {
  if (!dateValue) return '—';
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatCurrency(
  amount: number | undefined | null,
  currencyCode: string = 'VND',
  locale: string = 'vi-VN'
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

export function formatNumber(
  value: number | undefined | null,
  locale: string = 'vi-VN'
): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}
