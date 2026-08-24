import * as React from 'react';
import {
  format,
  parse,
  isValid,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from 'date-fns';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date...',
  className,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  // Parse current selected date
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const parsed = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  }, [value]);

  // Current browsing month in calendar
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (selectedDate) return selectedDate;
    return new Date();
  });

  // Sync currentMonth when value changes externally
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // Days in current month grid
  const days = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Offset for the first day of the week (Monday = 0 ... Sunday = 6)
  const firstDayOfWeek = (startOfMonth(currentMonth).getDay() + 6) % 7;

  const handleSelectDate = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    onChange?.(formatted);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handleToday = () => {
    const today = new Date();
    handleSelectDate(today);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={cn('truncate', !selectedDate && 'text-slate-400')}>
              {selectedDate
                ? format(selectedDate, 'MMM d, yyyy')
                : placeholder}
            </span>
          </div>

          {selectedDate && !disabled && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear selected date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[280px] p-3 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 font-sans"
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </span>

          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekdays Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEKDAYS.map((wd, i) => (
            <span
              key={wd}
              className={cn(
                'text-[10px] font-semibold py-1 select-none',
                i >= 5 ? 'text-rose-500' : 'text-slate-400'
              )}
            >
              {wd}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8" />
          ))}

          {/* Month Days */}
          {days.map((d) => {
            const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
            const isCurrToday = isToday(d);

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => handleSelectDate(d)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all select-none',
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : isCurrToday
                    ? 'bg-blue-50 text-blue-700 font-bold hover:bg-blue-100'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleToday}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline px-1 py-0.5"
          >
            Today
          </button>

          {selectedDate && (
            <button
              type="button"
              onClick={() => {
                onChange?.('');
                setOpen(false);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:underline px-1 py-0.5"
            >
              Clear date
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
