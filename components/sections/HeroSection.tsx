'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ABOUT_TEACHER, TELEGRAM_LINK, IMAGES } from '@/lib/constants';
import { scrollToSection } from '@/lib/utils';

export default function HeroSection() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <section
      id="hero"
      className="snap-section section-padding flex flex-col"
    >
      {/* === HEADER PILL (уменьшенный шрифт, без центральной иконки) === */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-2 safe-top"
      >
        <div className="pt-4 flex items-center justify-between pr-5">
          {/* Right - точка + текст */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[8px] md:text-[9px] font-medium text-text-primary uppercase tracking-wider">
              Курс по мобильной съёмке
            </span>
          </div>

                    {/* Left - стрелка + @username */}
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[8px] md:text-[9px] font-medium text-text-secondary hover:text-accent transition-colors uppercase tracking-wider"
          >
            <span className="text-xs">‹</span>
            @LITTLESVETA
          </a>
        </div>
      </motion.header>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {/* === Иконка "обо мне" + TITLE в одном контейнере === */}
        <div className="flex items-center justify-between mb-4">
          {/* TITLE справа */}
          <div className="text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[22px] font-semibold md:text-2xl font-bold font-montserrat text-text-primary leading-tight"
            >
              Снимай | Монтируй
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl font-bold md:text-4xl font-bold font-montserrat leading-tight"
            >
              <span className="slow-shimmer"> Удивляй</span>
            </motion.h1>
          </div>
          
          {/* Иконка "обо мне" слева */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => setIsAboutOpen(true)}
              className="relative w-28 h-28 group"
              aria-label="Обо мне"
            >
              {/* Круговой вращающийся текст */}
              <svg
                className="absolute inset-0 w-full h-full circular-text"
                viewBox="0 0 100 100"
              >
                <defs>
                  <path
                    id="circlePath"
                    d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
                  />
                </defs>
                <text className="text-[7.0px] fill-text-secondary uppercase tracking-[0.40em]">
                  <textPath href="#circlePath">
                    • ОБО МНЕ • ОБО МНЕ • ОБО МНЕ
                  </textPath>
                </text>
              </svg>
              {/* Центральная иконка */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-border bg-background-card flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all overflow-hidden">
                <img src="/images/ava.png" alt="Avatar" className="w-full h-full object-cover"/>
                </div>
              </div>
            </button>
          </motion.div>


        </div>

        {/* === BEFORE/AFTER SLIDER (уменьшенный) === */}
        <div className="w-full max-w-[380px] mx-auto">
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay: 0.5 }}
    className="h-[320px]"
  >
    <BeforeAfterSlider
      beforeImage="/images/do.jpg"
      afterImage="/images/posle.jpg"
      beforeLabel="До"
      afterLabel="После"
      className="h-full"
    />
  </motion.div>
</div>

        {/* === UTP (новый текст) === */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-text-secondary leading-relaxed">
            Такой результат будет уже на <span className="text-accent font-medium">2 день</span> обучения
          </p>
        </motion.div>

        {/* === CTA BUTTON (75% ширины) === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-5 flex justify-center"
        >
          <Button size="sm" onClick={() => scrollToSection('program')} className="btn-75">
            Программа курса
          </Button>
        </motion.div>

          {/* Scroll hint removed */}
        <div className="mt-auto h-10" />
      </div>

      {/* === ABOUT MODAL === */}
      <Modal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="Обо мне"
      >
        <div className="p-5">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border">
              <Image
                src={IMAGES.avatar}
                alt={ABOUT_TEACHER.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                {ABOUT_TEACHER.name}
              </h3>
              <p className="text-sm text-text-secondary">{ABOUT_TEACHER.role}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary whitespace-pre-line leading-relaxed text-sm">
            {ABOUT_TEACHER.description}
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {ABOUT_TEACHER.stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-3 rounded-xl bg-background-card border border-border"
              >
                <p className="text-xl font-bold text-accent">{stat.value}</p>
                <p className="text-[10px] text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6">
            <Button
              fullWidth
              onClick={() => window.open(TELEGRAM_LINK, '_blank')}
            >
              Написать в Telegram
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
