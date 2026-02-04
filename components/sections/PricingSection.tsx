'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate, useDragControls } from 'framer-motion';
import TelegramConfirmModal from '@/components/ui/TelegramConfirmModal';
import { TELEGRAM_LINK } from '@/lib/constants';
import { cn } from '@/lib/utils';

const easeOutCubic: [number, number, number, number] = [0.33, 1, 0.68, 1];

const plans = [
  {
    id: 'basic',
    title: 'Базовый',
    price: '30 000 ₽',
    subtitle: 'Основная программа и практика в группе',
    bullets: ['3 недели обучения', 'Очные занятия', 'Практика на съёмках'],
  },
  {
    id: 'basic-plus',
    title: 'Базовый+',
    price: '38 000 ₽',
    subtitle: 'Обратная связь и поддержка на курсе',
    bullets: [
      'Тоже что и в тарифе "базовый"',
      'Дополнительные разборы',
      'Ответы на вопросы между занятиями',
      'Доп. урок по цветокорекции',
    ],
    badge: 'Выбор большинства',
  },
  {
    id: 'personal',
    title: 'Индивидуальный формат',
    price: '60 000 ₽',
    subtitle: 'Личная работа со мной',
    bullets: ['Индивидуальная программа', 'Гибкий график занятий', 'Разбор твоих задач'],
    footnote: '*Количество мест ограничено',
  },
];

const getRelativeIndex = (index: number, active: number, total: number) => {
  const raw = index - active;
  if (raw === 0) return 0;
  if (raw === 1 || raw === -(total - 1)) return 1;
  return -1;
};

export function PricingCarousel() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const dragX = useMotionValue(0);
  const dragControls = useDragControls();

  useLayoutEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.offsetWidth);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cardWidth = containerWidth ? Math.min(containerWidth * 0.82, 420) : 320;
  const cardOffset = cardWidth * 0.58;
  const swipeThreshold = Math.min(cardWidth * 0.2, 110);

  const goTo = useCallback((nextIndex: number) => {
    const total = plans.length;
    const normalized = (nextIndex + total) % total;
    setActiveIndex(normalized);
  }, []);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > swipeThreshold) {
      goTo(activeIndex - 1);
    } else if (info.offset.x < -swipeThreshold) {
      goTo(activeIndex + 1);
    }
    animate(dragX, 0, { duration: 0.45, ease: easeOutCubic });
  }, [activeIndex, dragX, goTo, swipeThreshold]);

  const handleCardClick = (index: number) => {
    if (index === activeIndex) return;
    goTo(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  };

  useEffect(() => {
    animate(dragX, 0, { duration: 0.35, ease: easeOutCubic });
  }, [activeIndex, dragX]);

  return (
    <div
      className="relative w-full flex-1 flex flex-col justify-center outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Карусель тарифов"
    >
      <motion.div
        ref={containerRef}
        className="relative w-full flex-1 flex items-center justify-center overflow-visible"
        drag="x"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: dragX, touchAction: 'pan-y', willChange: 'transform' }}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest('button')) return;
          dragControls.start(event);
        }}
      >
        {plans.map((plan, index) => {
          const position = getRelativeIndex(index, activeIndex, plans.length);
          const isActive = position === 0;
          const rotate = isActive ? 0 : position === -1 ? -6 : 6;
          const scale = isActive ? 1 : 0.92;
          const opacity = isActive ? 1 : 0.55;
          const x = position * cardOffset;
          const y = isActive ? 0 : 18;

          return (
            <motion.div
              key={plan.id}
              className={cn(
                'absolute left-1/2 top-1/2 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2',
                isActive ? 'z-30' : 'z-10'
              )}
              style={{ width: cardWidth }}
              animate={{ x, y, rotate, scale, opacity }}
              whileTap={{
                scale: isActive ? 1.02 : 0.96,
              }}
              transition={{ duration: 0.48, ease: easeOutCubic }}
            >
              <div
                className={cn(
                  'relative h-[66dvh] max-h-[560px] min-h-[460px] rounded-[26px] border border-white/12 bg-white/5 backdrop-blur-lg shadow-[0_8px_20px_rgba(0,0,0,0.35)] max-[360px]:h-[62dvh] max-[360px]:min-h-[420px]'
                )}
                onClick={() => handleCardClick(index)}
                role="button"
                tabIndex={-1}
                aria-label={`Выбрать тариф ${plan.title}`}
              >
                {plan.badge && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4FB9] text-white text-[11px] font-semibold px-4 py-1 shadow-[0_10px_26px_rgba(255,79,185,0.55)] border border-white/20">
                    {plan.badge}
                  </div>
                )}

                <div className="flex h-full flex-col px-6 pb-6 pt-10">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white text-center">{plan.title}</h3>
                    <div className="text-center">
                      <div className="text-[44px] leading-none font-semibold text-white max-[360px]:text-[38px]">
                        {plan.price}
                      </div>
                      <div className="mt-3 text-[13px] text-text-secondary max-[360px]:text-[12px]">
                        {plan.subtitle}
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {plan.bullets.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-[14px] text-white/90 max-[360px]:text-[12px]">
                          <span className="mt-[3px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
                            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                              <path
                                d="M2.2 6.4l2.2 2.2 5-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {plan.footnote && (
                      <div className="mt-3 text-[11px] text-text-secondary">{plan.footnote}</div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsConfirmOpen(true);
                      }}
                      className="mt-6 h-[52px] w-full rounded-[16px] bg-[#F5C4B4] text-black text-sm font-semibold shadow-[0_12px_24px_rgba(245,196,180,0.35)] active:scale-[0.99]"
                      aria-label="Хочу этот формат"
                    >
                      Хочу этот формат
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
          <span className="text-5xl text-white/90 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">‹</span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <span className="text-5xl text-white/90 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">›</span>
        </div>
      </motion.div>

      <TelegramConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          window.open(TELEGRAM_LINK, '_blank');
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="snap-section section-padding flex flex-col bg-gradient-to-b from-[#0b0a0a] via-[#0d0c0b] to-[#090808]"
    >
      <div className="flex-1 flex flex-col pt-6 pb-[calc(env(safe-area-inset-bottom,0)+64px)]">
        <div className="text-center text-sm font-semibold text-text-primary font-montserrat">
          Снимай | Монтируй | <span className="slow-shimmer font-bold">Удивляй</span>
        </div>
        <h2 className="text-[26px] font-bold text-text-primary font-montserrat mt-2 text-center">Прайс</h2>
        <div className="mt-4 flex-1 flex flex-col justify-center">
          <PricingCarousel />
        </div>
      </div>
    </section>
  );
}
