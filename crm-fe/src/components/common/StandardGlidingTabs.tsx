import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType;
  badgeCount?: number;
  badgeLabel?: string;
  disabled?: boolean;
}

export interface StandardGlidingTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  containerClassName?: string;
}

export function StandardGlidingTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  containerClassName,
}: StandardGlidingTabsProps<T>): JSX.Element {
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs]);

  // Handle window resizing to keep indicator aligned
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      className={cn(
        'relative flex items-center gap-1 border-b border-slate-200 bg-white px-2 rounded-[4px] shadow-2xs overflow-x-auto select-none',
        containerClassName
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              'relative z-10 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors rounded-t-[3px] focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
              isActive
                ? 'text-blue-600 bg-blue-50/40 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium',
              className
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'w-3.5 h-3.5 transition-colors shrink-0',
                  isActive ? 'text-blue-600' : 'text-slate-400'
                )}
                aria-hidden="true"
              />
            )}
            <span>{tab.label}</span>

            {tab.badgeCount !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-[2px] font-bold border',
                  isActive
                    ? 'bg-blue-100/80 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                )}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}

      {/* Smooth Gliding Active Tab Indicator Bar */}
      <span
        className="absolute bottom-0 h-[2.5px] bg-blue-600 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-t-sm z-20 pointer-events-none"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  );
}

export default StandardGlidingTabs;
