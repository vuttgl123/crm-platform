import React from 'react';
import { cn } from '@/lib/utils';

export interface EditorialEyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Signature Eyebrow Label:
 * 12px, uppercase, letter-spacing 0.08em, weight 500, muted color #A8A29E,
 * with a 4px square accent dot #1D4ED8 standing in front.
 */
export const EditorialEyebrow: React.FC<EditorialEyebrowProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={cn('editorial-eyebrow mb-4', className)} {...props}>
      {children}
    </p>
  );
};

export default EditorialEyebrow;
