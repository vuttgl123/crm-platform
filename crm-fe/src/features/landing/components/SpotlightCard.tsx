import React, { useRef, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  tone = 'light',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--mouse-x', '-500px');
    cardRef.current.style.setProperty('--mouse-y', '-500px');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'lp-spotlight-card lp-spotlight-border rounded-[4px] border transition-all duration-300',
        tone === 'dark'
          ? 'border-slate-800 bg-slate-900/90 text-slate-100'
          : 'border-[var(--lp-line)] bg-white text-[var(--lp-ink)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
