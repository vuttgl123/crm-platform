import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EditorialContainer } from './EditorialContainer';

export interface EditorialSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  isDark?: boolean;
  contained?: boolean;
}

/**
 * Enterprise Editorial Section:
 * Separated horizontally by a 1px #E7E5E4 top border intersecting the continuous vertical rails.
 */
export const EditorialSection: React.FC<EditorialSectionProps> = ({
  children,
  id,
  className,
  containerClassName,
  isDark = false,
  contained = true,
  ...props
}) => {
  return (
    <section
      id={id}
      className={cn(
        'editorial-section',
        isDark && 'editorial-dark-region',
        className
      )}
      {...props}
    >
      {contained ? (
        <EditorialContainer className={containerClassName}>
          {children}
        </EditorialContainer>
      ) : (
        children
      )}
    </section>
  );
};

export default EditorialSection;
