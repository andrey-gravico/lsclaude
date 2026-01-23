'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { TELEGRAM_LINK } from '@/lib/constants';

export default function CTASection() {
  const handleClick = () => {
    // Yandex.Metrika tracking - only if initialized
    if (typeof window !== 'undefined') {
      const win = window as unknown as { ym?: (id: number, action: string, goal: string) => void };
      if (win.ym) {
        // ID will be set when Metrika is configured
        // win.ym(YOUR_ID, 'reachGoal', 'cta_click');
      }
    }
    window.open(TELEGRAM_LINK, '_blank');
  };

  return (
    <section id="cta" className="snap-section section-padding flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full text-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-text-primary">
            Готова научиться делать мощный визуал?
          </h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            Курс короткий, без воды, много практики.
            <br />
            <span className="text-accent font-medium">Места ограничены.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Button size="lg" onClick={handleClick} breathing>
            Записаться
          </Button>
        </motion.div>

        {/* Decorative */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 flex justify-center items-center gap-4 text-text-muted text-sm"
        >
          <span className="w-8 h-px bg-border" />
          <span>4 дня интенсива в Крыму</span>
          <span className="w-8 h-px bg-border" />
        </motion.div>
      </div>
    </section>
  );
}
