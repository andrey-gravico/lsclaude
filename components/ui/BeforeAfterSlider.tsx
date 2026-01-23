'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'До',
  afterLabel = 'После',
  className,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
    setShowHint(false);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) handleMove(e.touches[0].clientX);
  }, [handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-[3/4] rounded-2xl overflow-hidden before-after-slider',
        'select-none cursor-ew-resize border border-border',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* After Image (background) */}
      <div className="absolute inset-0">
        <Image src={afterImage} alt={afterLabel} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
        <span className="absolute top-4 right-4 px-3 py-1 bg-background/70 text-text-primary text-sm font-medium rounded-full backdrop-blur-sm border border-border">
          {afterLabel}
        </span>
      </div>

      {/* Before Image (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <Image src={beforeImage} alt={beforeLabel} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
        <span className="absolute top-4 left-4 px-3 py-1 bg-background/70 text-text-primary text-sm font-medium rounded-full backdrop-blur-sm border border-border">
          {beforeLabel}
        </span>
      </div>

      {/* Slider Handle */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-accent slider-handle" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-10 h-10 rounded-full bg-accent',
          'flex items-center justify-center shadow-lg',
          'transition-transform duration-150',
          isDragging && 'scale-110'
        )}>
          <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
          </svg>
        </div>
      </div>

    </div>
  );
}
