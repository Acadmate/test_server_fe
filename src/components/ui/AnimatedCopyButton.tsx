"use client";
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedCopyButtonProps {
  textToCopy: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AnimatedCopyButton({ 
  textToCopy, 
  className = "h-8 w-8",
  variant = "ghost",
  size = "icon"
}: AnimatedCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // Reset back to copy icon after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      disabled={copied}
    >
      <div className="relative w-4 h-4">
        {/* Copy Icon */}
        <Copy 
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            copied 
              ? 'opacity-0 scale-75 rotate-90' 
              : 'opacity-100 scale-100 rotate-0'
          }`} 
        />
        
        {/* Check Icon */}
        <Check 
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 text-green-500 ${
            copied 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-75 rotate-90'
          }`} 
        />
      </div>
    </Button>
  );
} 