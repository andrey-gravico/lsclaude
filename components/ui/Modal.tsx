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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop - видимый, кликабельный для закрытия */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content - уменьшенный размер */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative z-10 bg-background-card border border-border rounded-2xl shadow-2xl',
              fullScreen
                ? 'w-[90vw] max-w-none h-[80vh] max-h-[80vh]'
                : 'w-full max-w-sm max-h-[70vh]',
              'overflow-hidden',
              className
            )}
          >
            {/* Header with title and close button */}
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

            {/* Content */}
            <div
              className={cn(
                'overflow-y-auto',
                fullScreen ? 'max-h-[calc(80vh-4rem)]' : 'max-h-[calc(70vh-4rem)]'
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
