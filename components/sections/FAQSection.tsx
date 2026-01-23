'use client';

import { useState } from 'react';
import { motion, type Variants } from "framer-motion";
import Modal from '@/components/ui/Modal';
import { FAQ_ITEMS } from '@/lib/constants';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
  };

  return (
    <section id="faq" className="snap-section section-padding flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-text-primary">Частые вопросы</h2>
          <p className="text-text-secondary mt-2">Ответы на популярные вопросы</p>
        </motion.div>

        {/* FAQ Cards with stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="grid grid-cols-1 gap-3"
        >
          {FAQ_ITEMS.map((item, index) => (
            <motion.button
              key={index}
              variants={itemVariants}
              onClick={() => setSelectedFAQ(item)}
              className="w-full p-4 rounded-xl bg-background-card border border-border text-left hover:border-accent/50 hover:bg-background-elevated transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-text-primary group-hover:text-accent transition-colors">{item.question}</span>
                <svg className="w-5 h-5 text-text-secondary flex-shrink-0 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* FAQ Answer Modal */}
      <Modal isOpen={!!selectedFAQ} onClose={() => setSelectedFAQ(null)} title={selectedFAQ?.question}>
        <div className="p-5">
          <p className="text-text-secondary leading-relaxed">{selectedFAQ?.answer}</p>
        </div>
      </Modal>
    </section>
  );
}
