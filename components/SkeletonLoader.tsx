import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'list';
  count?: number;
}

export default function SkeletonLoader({
  className = '',
  variant = 'rect',
  count = 1
}: SkeletonProps) {
  const items = Array.from({ length: count });

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'circle':
        return 'h-12 w-12 rounded-full';
      case 'card':
        return 'h-32 w-full rounded-xl';
      case 'list':
        return 'h-16 w-full rounded-lg';
      case 'rect':
      default:
        return 'h-8 w-full rounded-md';
    }
  };

  const baseClass = `shimmer-bg ${getVariantClasses()} ${className}`;

  if (count > 1) {
    return (
      <div className="space-y-3 w-full animate-fade-in">
        {items.map((_, index) => (
          <div
            key={index}
            className={baseClass}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClass} animate-fade-in`} />;
}
