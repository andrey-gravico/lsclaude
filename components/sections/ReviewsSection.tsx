'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import VoiceMessage from '@/components/ui/VoiceMessage';
import Modal from '@/components/ui/Modal';
import { VOICE_REVIEWS, TEXT_REVIEWS } from '@/lib/constants';

export default function ReviewsSection() {
  const [isTextReviewsOpen, setIsTextReviewsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
  };

  return (
    <section id="reviews" className="snap-section section-padding flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-text-primary">Отзывы</h2>
          <p className="text-text-secondary mt-2">Что говорят ученики о курсе</p>
        </motion.div>

        {/* Voice Reviews with stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-4"
        >
          {VOICE_REVIEWS.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <VoiceMessage src={review.src} name={review.name} duration={review.duration} />
            </motion.div>
          ))}
        </motion.div>

        {/* Link to text reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <button onClick={() => setIsTextReviewsOpen(true)} className="inline-flex items-center gap-2 text-accent hover:underline font-medium">
            <span>Другие отзывы</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Text Reviews Modal */}
      <Modal isOpen={isTextReviewsOpen} onClose={() => setIsTextReviewsOpen(false)} title="Отзывы учеников" fullScreen>
        <div className="p-4 grid grid-cols-1 gap-4">
          {TEXT_REVIEWS.map((review) => (
            <button key={review.id} onClick={() => setSelectedImage(review.src)} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
              <Image src={review.src} alt="Отзыв" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
            </button>
          ))}
        </div>
      </Modal>

      {/* Full Image Modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} showCloseButton fullScreen>
        {selectedImage && (
          <div className="relative w-full h-full bg-background flex items-center justify-center">
            <Image src={selectedImage} alt="Отзыв" fill className="object-contain" sizes="100vw" unoptimized />
          </div>
        )}
      </Modal>
    </section>
  );
}
