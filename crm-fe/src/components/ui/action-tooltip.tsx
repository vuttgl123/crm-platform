import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActionTooltipProps {
  /** Nội dung hiển thị trong tooltip */
  label: string;
  /** Element trigger — thường là một <Button> */
  children: React.ReactNode;
  /** Hướng hiển thị tooltip, mặc định "top" */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Delay trước khi tooltip xuất hiện (ms), mặc định 300 */
  delayDuration?: number;
}

/**
 * ActionTooltip — wrapper chuẩn toàn hệ thống cho tooltip trên icon-only action buttons.
 *
 * Thay thế hoàn toàn cách dùng native `title=""` và inline TooltipProvider/Tooltip boilerplate.
 *
 * @example
 * ```tsx
 * <ActionTooltip label="Chỉnh sửa">
 *   <Button variant="ghost" size="icon" onClick={handleEdit}>
 *     <Edit className="w-3.5 h-3.5" />
 *   </Button>
 * </ActionTooltip>
 * ```
 */
export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  children,
  side = 'top',
  delayDuration = 300,
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
