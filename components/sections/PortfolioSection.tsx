'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { PORTFOLIO_ITEMS, INSTAGRAM_LINK } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  id: string;
  title: string;
  thumbnail: string;
  items: { type: string; src: string }[];
}

export default function PortfolioSection() {
  const [selectedWork, setSelectedWork] = useState<PortfolioItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpen = (work: PortfolioItem) => {
    setSelectedWork(work);
    setCurrentIndex(0);
  };

  const handleClose = () => {
    setSelectedWork(null);
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    if (selectedWork) setCurrentIndex((prev) => (prev === 0 ? selectedWork.items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (selectedWork) setCurrentIndex((prev) => (prev === selectedWork.items.length - 1 ? 0 : prev + 1));
  };

  // Stagger с чередующимися направлениями
  const cardVariants = {
    hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -30 : 30 }),
    show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
  };

  return (
    <section id="portfolio" className="snap-section section-padding flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-text-primary">Портфолио</h2>
          <p className="text-text-secondary mt-1 text-sm">Съёмки для брендов</p>
        </motion.div>

        {/* Portfolio Grid - компактный для вместимости 3 элементов */}
        <div className="grid grid-cols-1 gap-2">
          {PORTFOLIO_ITEMS.map((work, index) => (
            <motion.button
              key={work.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleOpen(work)}
              className="relative aspect-[16/7] rounded-xl overflow-hidden group border border-border"
            >
              <Image src={work.thumbnail} alt={work.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-semibold text-sm">{work.title}</h3>
                <p className="text-white/70 text-xs mt-0.5">{work.items.length} фото</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Link to Instagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 text-center"
        >
          <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent hover:underline font-medium text-sm">
            <span>Все работы в Instagram</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Gallery Modal */}
      <Modal isOpen={!!selectedWork} onClose={handleClose} fullScreen>
        {selectedWork && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">{selectedWork.title}</h3>
              <p className="text-sm text-text-secondary">{currentIndex + 1} / {selectedWork.items.length}</p>
            </div>
            <div className="flex-1 relative bg-background flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="relative w-full h-full">
                  <Image src={selectedWork.items[currentIndex].src} alt={`${selectedWork.title} - ${currentIndex + 1}`} fill className="object-contain" sizes="100vw" unoptimized />
                </motion.div>
              </AnimatePresence>
              {selectedWork.items.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-card/80 backdrop-blur-sm flex items-center justify-center text-text-primary hover:bg-background-elevated transition-colors border border-border">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-card/80 backdrop-blur-sm flex items-center justify-center text-text-primary hover:bg-background-elevated transition-colors border border-border">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>
            {selectedWork.items.length > 1 && (
              <div className="p-4 flex justify-center gap-2">
                {selectedWork.items.map((_, index) => (
                  <button key={index} onClick={() => setCurrentIndex(index)} className={cn('w-2 h-2 rounded-full transition-colors', index === currentIndex ? 'bg-accent' : 'bg-border')} />
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
