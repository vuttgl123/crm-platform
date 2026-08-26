import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  tone?: 'light' | 'dark';
  id?: string;
  className?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  align = 'left',
  as = 'h2',
  tone = 'dark',
  id,
  className,
}: SectionHeadingProps): ReactElement {
  const HeadingTag = as;
  const isDark = tone === 'dark';

  return (
    <div
      className={cn(
        'mb-12 sm:mb-16',
        align === 'center' ? 'mx-auto max-w-[54rem] text-center' : 'max-w-[54rem]',
        className
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
          {eyebrow}
        </p>
      ) : null}

      <HeadingTag
        id={id}
        className={cn(
          'tracking-tight font-black uppercase leading-[1.05]',
          as === 'h1' ? 'text-5xl sm:text-7xl lg:text-8xl' : 'text-3xl sm:text-5xl lg:text-6xl',
          isDark ? 'text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]' : 'text-slate-900'
        )}
      >
        {title}
      </HeadingTag>

      {description ? (
        <p
          className={cn(
            'mt-5 text-base sm:text-lg leading-relaxed',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeading;
