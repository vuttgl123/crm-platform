import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'table';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card' }) => {
  if (variant === 'page') {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6 animate-pulse" data-testid="loading-skeleton">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="h-32 bg-slate-200 rounded-lg"></div>
          <div className="h-32 bg-slate-200 rounded-lg"></div>
          <div className="h-32 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 animate-pulse" data-testid="loading-skeleton">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      <div className="h-8 bg-slate-200 rounded w-full"></div>
    </div>
  );
};
