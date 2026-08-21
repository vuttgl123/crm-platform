import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as = 'h2',
  className,
}: SectionHeadingProps): ReactElement {
  const HeadingTag = as;

  return (
    <div
      className={cn(
        'space-y-3 mb-10 sm:mb-14',
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl',
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#085AC0] bg-[#EAF2FC] px-3 py-1 rounded-full">
          {eyebrow}
        </span>
      )}
      <HeadingTag
        className={cn(
          'text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#07182B] landing-display leading-tight',
          as === 'h1' && 'text-3xl sm:text-4xl lg:text-5xl'
        )}
      >
        {title}
      </HeadingTag>
      {description && (
        <p className="text-base sm:text-lg text-[#52647A] leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
