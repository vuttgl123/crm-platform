import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EditorialContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Enterprise Editorial Container:
 * 1200px max-width bounded by 2 continuous 1px #E7E5E4 vertical rails running down the page.
 */
export const EditorialContainer: React.FC<EditorialContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('editorial-container', className)} {...props}>
      {children}
    </div>
  );
};

export default EditorialContainer;
