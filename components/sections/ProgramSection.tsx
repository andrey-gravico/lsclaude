'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ABOUT_TEACHER, TELEGRAM_LINK, PROGRAM_WEEKS, IMAGES } from '@/lib/constants';
import type { ProgramWeekItem } from '@/lib/constants';
import { scrollToSection } from '@/lib/utils';

export default function ProgramSection() {
  const [activeWeek, setActiveWeek] = useState(0);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProgramWeekItem | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (selectedMedia?.type === 'video') {
      setIsVideoPaused(false);
      const video = modalVideoRef.current;
      if (video) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {});
        }
      }
    }
  }, [selectedMedia]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeWeek < PROGRAM_WEEKS.length - 1) {
      setActiveWeek((prev) => prev + 1);
    } else if (direction === 'right' && activeWeek > 0) {
      setActiveWeek((prev) => prev - 1);
    }
  };

  return (
    <section id="program" className="snap-section section-padding flex flex-col">
      {/* === HEADER (копия из HeroSection) === */}
      <header className="pt-2 safe-top">
        <div className="pt-4 pl-3 pr-4 flex items-center justify-between">
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[8px] md:text-[9px] font-medium text-text-secondary hover:text-accent transition-colors uppercase tracking-wider"
          >
            <span className="text-xs">‹</span>
            @LITTLESVETA
          </a>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[8px] md:text-[9px] font-medium text-text-primary uppercase tracking-wider">
              Курс по мобильной съёмке
            </span>
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col">
        {/* === Аватар + Кнопки в одной строке === */}
        <div className="flex items-center gap-3 px-0 py-3">
          {/* Аватар с круговым текстом "Обо мне" */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="relative w-28 h-28 flex-shrink-0 group"
            aria-label="Обо мне"
          >
            <svg
              className="absolute inset-0 w-full h-full circular-text"
              viewBox="0 0 100 100"
            >
              <defs>
                <path
                  id="circlePathProgram"
                  d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
                />
              </defs>
              <text className="text-[7.0px] fill-text-secondary uppercase tracking-[0.40em]">
                <textPath href="#circlePathProgram">
                  • ОБО МНЕ • ОБО МНЕ • ОБО МНЕ
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-border bg-background-card overflow-hidden group-hover:border-accent transition-all">
                <img
                  src="/images/ava.png"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </button>

{/* ТЕКСТЫ ПРОГРАММЫ (перенесены к аватару) */}
<div className="flex-1 flex flex-col gap-1 -mt-6">
  <p className="text-[13px] font-semibold text-text-primary font-montserrat">
    Снимай | Монтируй | <span className="slow-shimmer font-bold">Удивляй</span>
  </p>
  <h2 className="text-[22px] font-bold text-text-primary font-montserrat">
    Программа курса
  </h2>
  <p className="text-xs text-text-secondary">
    Каждый день = результат
  </p>
</div>
        </div>

        {/* КНОПКИ (перенесены вниз) */}
<div className="flex w-full justify-end pb-4 -mt-6">
  <div className="flex items-center gap-3 px-2">
    <Button
      onClick={() => window.open(TELEGRAM_LINK, '_blank')}
      className="text-xs py-1 px-3 w-auto"
    >
      Записаться
    </Button>
    <Button
      variant="outline"
      onClick={() => scrollToSection('faq')}
      className="text-xs py-1 px-3 w-auto"
    >
      Ответы на вопросы
    </Button>
  </div>
</div>


        {/* === Табы недель === */}
        <div className="flex justify-around items-center border-t border-border px-0 w-screen -mx-4">
          {PROGRAM_WEEKS.map((week, index) => (
            <button
              key={week.week}
              onClick={() => setActiveWeek(index)}
              className="relative flex-1 pt-4 pb-2 flex justify-center"
            >
              <img
                src={week.icon}
                alt={`Неделя ${week.week}`}
                className={`w-8 h-8 transition-opacity ${
                  activeWeek === index ? 'opacity-100' : 'opacity-50'
                }`}
              />
              {/* Анимированная линия */}
              <motion.div
                className="absolute bottom-0 left-1/2 h-0.5 bg-white"
                initial={false}
                animate={{
                  width: activeWeek === index ? '60%' : '0%',
                  x: '-50%',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </button>
          ))}
        </div>

        {/* === Свайпаемая сетка контента === */}
        <div ref={sliderRef} className="flex-1 overflow-hidden w-screen -mx-4">
          <motion.div
            className="flex h-full"
            initial={false}
            animate={{ x: -activeWeek * sliderWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: -sliderWidth * (PROGRAM_WEEKS.length - 1), right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) handleSwipe('right');
              else if (info.offset.x < -50) handleSwipe('left');
            }}
          >
            {PROGRAM_WEEKS.map((week) => (
              <div
                key={week.week}
                className="min-w-full h-full"
              >
                {/* Сетка 3x2 */}
                <div className="grid grid-cols-3 h-full gap-px">
                  {week.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={item.src ? () => setSelectedMedia(item) : undefined}
                      className={`relative aspect-[3/4] bg-background-card overflow-hidden ${item.src ? 'cursor-pointer' : ''}`}
                    >
                      {item.src ? (
                        item.type === 'video' ? (
                          <video
                            src={item.src}
                            poster={item.poster}
                            className="w-full h-full object-cover pointer-events-none"
                            preload="auto"
                            playsInline
                          />
                        ) : (
                          <Image
                            src={item.src}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )
                      ) : (
                        /* Заглушка */
                        <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                          <svg
                            className="w-8 h-8 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-[10px]">.png</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* === ABOUT MODAL (та же что в HeroSection) === */}
      <Modal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="Обо мне"
      >
        <div className="p-5">
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
          <p className="text-text-secondary whitespace-pre-line leading-relaxed text-sm">
            {ABOUT_TEACHER.description}
          </p>
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

      {/* === MEDIA MODAL (увеличенный контент) === */}
      <Modal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        showCloseButton
        fullScreen
      >
        {selectedMedia && (
          <div className="relative w-full h-full bg-background flex items-center justify-center">
            <div className="relative w-[80vw] h-[80vh]">
              {selectedMedia.type === 'video' ? (
                <video
                  ref={modalVideoRef}
                  src={selectedMedia.src}
                  className="w-full h-full object-contain"
                  controls={isVideoPaused}
                  autoPlay
                  preload="auto"
                  playsInline
                  onPlay={() => setIsVideoPaused(false)}
                  onPause={() => setIsVideoPaused(true)}
                  onEnded={() => setIsVideoPaused(true)}
                />
              ) : (
                <Image
                  src={selectedMedia.src}
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
