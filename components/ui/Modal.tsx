'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
  fullScreen?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
  showCloseButton = true,
  fullScreen = false,
}: ModalProps) {
  const showHeader = Boolean(title) || showCloseButton;
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center',
            fullScreen ? 'items-stretch p-0' : 'items-center p-6'
          )}
        >
          {/* Backdrop - видимый, кликабельный для закрытия */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute inset-0',
              fullScreen ? 'bg-transparent' : 'bg-black/60 backdrop-blur-sm'
            )}
            onClick={fullScreen ? undefined : onClose}
          />

          {/* Modal content - уменьшенный размер */}
          <motion.div
            initial={fullScreen ? false : { opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={fullScreen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
            transition={fullScreen ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative z-10 overflow-hidden',
              fullScreen
                ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0 bg-transparent'
                : 'w-full max-w-sm max-h-[70vh] rounded-2xl border border-border bg-background-card shadow-2xl',
              className
            )}
          >
            {/* Header with title and close button */}
            {showHeader && (
              <div className="flex items-center justify-between p-4 border-b border-border">
                {title ? (
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              ) : (
                <div />
              )}
                {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-full hover:bg-background-elevated transition-colors"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              </div>
            )}

            {/* Content */}
            <div
              className={cn(
                fullScreen
                  ? showHeader
                    ? 'overflow-y-auto max-h-[calc(100vh-4rem)]'
                    : 'h-full'
                  : 'overflow-y-auto max-h-[calc(70vh-4rem)]'
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
