import React from 'react';
import { cn } from '../../lib/utils';

interface ParchmentWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export const ParchmentWrapper: React.FC<ParchmentWrapperProps> = ({ 
  children, 
  className,
  variant = 'light' 
}) => {
  return (
    <div className={cn(
      "relative p-6 rounded-sm overflow-hidden transition-all",
      variant === 'light' ? "parchment-texture text-zinc-900 medieval-border" : "bg-[#1a1814] border border-[#3a3022] text-[#e0d8c3] backdrop-blur-md",
      className
    )}>
      {/* Decorative Ornaments */}
      {variant === 'light' && (
        <>
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-ink/20" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-ink/20" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-ink/20" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-ink/20" />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
