import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeading({
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
        'mb-12 sm:mb-16',
        align === 'center' ? 'text-center mx-auto max-w-[42rem]' : 'max-w-[42rem]',
        className
      )}
    >
      {/* NO EYEBROW ALLOWED IN ANTI-SLOP SAAS */}
      <HeadingTag
        className={cn(
          'h-section text-[--color-ink] landing-display',
          as === 'h1' && 'h-hero'
        )}
      >
        {title}
      </HeadingTag>
      
      {description && (
        <p className="mt-5 text-base sm:text-lg text-[--color-ink-muted] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
