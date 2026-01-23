'use client';

import { motion } from 'framer-motion';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';
import { PROGRAM_DAYS, TELEGRAM_LINK } from '@/lib/constants';

export default function ProgramSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', damping: 20, stiffness: 100 },
    },
  };

  const accordionItems = PROGRAM_DAYS.map((day) => ({
    id: day.day,
    title: `День ${day.day}. ${day.title}`,
    subtitle: day.subtitle,
    content: (
      <ul className="space-y-2">
        {day.lessons.map((lesson, i) => (
          <li key={i} className="flex items-start gap-3 text-text-secondary">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-medium">
              {i + 1}
            </span>
            <span className="pt-0.5">{lesson}</span>
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <section id="program" className="snap-section section-padding flex flex-col pt-6 pb-20">
      <div className="max-w-lg mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-text-primary">
            Программа на 4 дня
          </h2>
          <p className="text-text-secondary mt-2">Каждый день = результат</p>
        </motion.div>

        {/* Accordion with stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
        >
          <Accordion items={accordionItems} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button size="lg" onClick={() => window.open(TELEGRAM_LINK, '_blank')}>
            Записаться
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
