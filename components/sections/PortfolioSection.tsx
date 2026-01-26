'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ABOUT_TEACHER, IMAGES, PORTFOLIO_CATEGORIES, TELEGRAM_LINK } from '@/lib/constants';
import type { PortfolioCategory, PortfolioHighlight, PortfolioHighlightItem } from '@/lib/constants';
import { scrollToSection } from '@/lib/utils';

const IMAGE_DURATION_MS = 5000;
const HOLD_DELAY_MS = 280;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function PortfolioSection() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<PortfolioCategory | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<PortfolioHighlight | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimeout = useRef<number | null>(null);
  const isHolding = useRef(false);
  const wasPlaying = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  const lastPointerTimestampMs = useRef(0);
  const currentTimestampMs = useRef(0);

  const imageAccumulatedMs = useRef(0);
  const imageStartMs = useRef(0);
  const activeHighlightRef = useRef<PortfolioHighlight | null>(null);
  const activeItemIndexRef = useRef(0);

  const isViewerOpen = Boolean(activeCategory && activeHighlight);

  const activeItem: PortfolioHighlightItem | null = useMemo(() => {
    if (!activeHighlight) return null;
    return activeHighlight.items[activeItemIndex] ?? null;
  }, [activeHighlight, activeItemIndex]);

  useEffect(() => {
    activeHighlightRef.current = activeHighlight;
  }, [activeHighlight]);

  useEffect(() => {
    activeItemIndexRef.current = activeItemIndex;
  }, [activeItemIndex]);

  const resetViewerState = useCallback(() => {
    setProgress(0);
    setIsPaused(false);
    isHolding.current = false;
    wasPlaying.current = false;
    hasMoved.current = false;
    pointerStart.current = null;
    lastPointerTimestampMs.current = 0;
    currentTimestampMs.current = 0;
    imageAccumulatedMs.current = 0;
    imageStartMs.current = 0;
  }, []);

  const openHighlight = (category: PortfolioCategory, highlight: PortfolioHighlight) => {
    setActiveCategory(category);
    setActiveHighlight(highlight);
    setActiveItemIndex(0);
    resetViewerState();
  };

  const closeHighlight = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      videoRef.current = null;
    }
    if (holdTimeout.current) {
      window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    isHolding.current = false;
    wasPlaying.current = false;
    pointerStart.current = null;
    hasMoved.current = false;
    setIsPaused(false);
    setProgress(0);
    setActiveItemIndex(0);
    setActiveHighlight(null);
    setActiveCategory(null);
    imageAccumulatedMs.current = 0;
    imageStartMs.current = 0;
  }, []);

  const goNext = useCallback(() => {
    const highlight = activeHighlightRef.current;
    const index = activeItemIndexRef.current;
    if (!highlight) return;
    if (index >= highlight.items.length - 1) {
      closeHighlight();
      return;
    }
    resetViewerState();
    setActiveItemIndex((prev) => prev + 1);
  }, [closeHighlight, resetViewerState]);

  const goPrev = useCallback(() => {
    const index = activeItemIndexRef.current;
    if (index <= 0) return;
    resetViewerState();
    setActiveItemIndex((prev) => prev - 1);
  }, [resetViewerState]);

  const pausePlayback = () => {
    if (isPaused) return;
    setIsPaused(true);
    if (activeItem?.type === 'image') {
      const nowMs = Math.max(lastPointerTimestampMs.current, currentTimestampMs.current);
      if (imageStartMs.current === 0) {
        imageStartMs.current = nowMs;
      }
      imageAccumulatedMs.current += nowMs - imageStartMs.current;
    } else if (activeItem?.type === 'video') {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
    }
  };

  const resumePlayback = () => {
    if (!isPaused) return;
    setIsPaused(false);
    if (activeItem?.type === 'image') {
      const nowMs = Math.max(lastPointerTimestampMs.current, currentTimestampMs.current);
      imageStartMs.current = nowMs;
    } else if (activeItem?.type === 'video') {
      const video = videoRef.current;
      if (video && wasPlaying.current) {
        const playPromise = video.play();
        if (playPromise) playPromise.catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (!isViewerOpen) return;
    if (!activeItem) return;

    let rafId = 0;
    const tick = (timestampMs: number) => {
      currentTimestampMs.current = timestampMs;
      if (!isViewerOpen || !activeHighlight) return;
      if (!activeItem) return;

      if (activeItem.type === 'image') {
        if (imageStartMs.current === 0) {
          imageStartMs.current = timestampMs;
        }
        const elapsed = isPaused ? imageAccumulatedMs.current : imageAccumulatedMs.current + (timestampMs - imageStartMs.current);
        const nextProgress = clamp(elapsed / IMAGE_DURATION_MS, 0, 1);
        setProgress(nextProgress);
        if (!isPaused && nextProgress >= 1) {
          goNext();
          return;
        }
      } else {
        const video = videoRef.current;
        if (video && Number.isFinite(video.duration) && video.duration > 0) {
          const nextProgress = clamp(video.currentTime / video.duration, 0, 1);
          setProgress(nextProgress);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeHighlight, activeItem, isPaused, isViewerOpen, activeItemIndex, goNext]);

  useEffect(() => {
    if (!isViewerOpen) return;
    if (activeItem?.type !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [activeItem?.id, activeItem?.type, isViewerOpen]);

  const handlePressStart = (event: PointerEvent<HTMLDivElement>) => {
    lastPointerTimestampMs.current = event.timeStamp;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    hasMoved.current = false;

    const video = videoRef.current;
    wasPlaying.current = Boolean(video && !video.paused);

    if (holdTimeout.current) {
      window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }

    holdTimeout.current = window.setTimeout(() => {
      isHolding.current = true;
      pausePlayback();
    }, HOLD_DELAY_MS);
  };

  const handlePressMove = (event: PointerEvent<HTMLDivElement>) => {
    lastPointerTimestampMs.current = event.timeStamp;
    if (!pointerStart.current) return;
    if (isHolding.current) return;

    const deltaX = Math.abs(event.clientX - pointerStart.current.x);
    const deltaY = event.clientY - pointerStart.current.y;

    if (deltaY > 60 && Math.abs(deltaY) > deltaX) {
      hasMoved.current = true;
      if (holdTimeout.current) {
        window.clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      closeHighlight();
    }
  };

  const handlePressEnd = (event: PointerEvent<HTMLDivElement>) => {
    lastPointerTimestampMs.current = event.timeStamp;
    if (holdTimeout.current) {
      window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }

    if (!pointerStart.current) return;

    pointerStart.current = null;

    if (hasMoved.current) {
      hasMoved.current = false;
      isHolding.current = false;
      return;
    }

    if (isHolding.current) {
      isHolding.current = false;
      resumePlayback();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const isLeft = event.clientX < rect.left + rect.width / 2;
    if (isLeft) goPrev();
    else goNext();
  };

  const handlePressCancel = () => {
    if (holdTimeout.current) {
      window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    pointerStart.current = null;
    hasMoved.current = false;
    if (isHolding.current) {
      isHolding.current = false;
      resumePlayback();
    }
  };

  return (
    <section id="portfolio" className="snap-section section-padding flex flex-col">
      {/* === HEADER (копия из ProgramSection) === */}
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

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 px-0 py-3">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="relative w-28 h-28 flex-shrink-0 group"
            aria-label="Обо мне"
          >
            <svg className="absolute inset-0 w-full h-full circular-text" viewBox="0 0 100 100">
              <defs>
                <path
                  id="circlePathPortfolio"
                  d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
                />
              </defs>
              <text className="text-[7.0px] fill-text-secondary uppercase tracking-[0.40em]">
                <textPath href="#circlePathPortfolio">• ОБО МНЕ • ОБО МНЕ • ОБО МНЕ</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-border bg-background-card overflow-hidden group-hover:border-accent transition-all">
                <img src="/images/ava.png" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </button>

          <div className="flex-1 flex flex-col gap-1 -mt-6">
            <p className="text-[13px] font-semibold text-text-primary font-montserrat">
              Снимай | Монтируй | <span className="slow-shimmer font-bold">Удивляй</span>
            </p>
            <h2 className="text-[22px] font-bold text-text-primary font-montserrat">Портфолио</h2>
            <p className="text-xs text-text-secondary">Мои лучшие кейсы.</p>
          </div>
        </div>

        <div className="flex w-full justify-end pb-4 -mt-6">
          <div className="flex items-center gap-3 px-2">
            <Button onClick={() => window.open(TELEGRAM_LINK, '_blank')} className="text-xs py-1 px-3 w-auto">
              Записаться
            </Button>
            <Button variant="outline" onClick={() => scrollToSection('faq')} className="text-xs py-1 px-3 w-auto">
              Ответы на вопросы
            </Button>
          </div>
        </div>

        <div className="border-t border-border px-0 w-screen -mx-4" />

        <div className="flex-1 flex flex-col gap-6 pt-5 pb-24">
          {PORTFOLIO_CATEGORIES.map((category) => (
            <div key={category.id} className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-text-primary font-montserrat text-center">
                {category.title}
              </h3>

              <div className="flex justify-between px-2">
                {category.highlights.map((highlight) => (
                  <button
                    key={highlight.id}
                    onClick={() => openHighlight(category, highlight)}
                    className="flex flex-col items-center gap-1 w-16"
                  >
                    <div className="w-16 h-16 rounded-full border border-border bg-background-card overflow-hidden transition-all hover:border-accent">
                      <Image
                        src={highlight.coverSrc}
                        alt={highlight.label}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <span
                      className="text-[10px] leading-[12px] text-text-secondary text-center w-16"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {highlight.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} title="Обо мне">
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border">
              <Image src={IMAGES.avatar} alt={ABOUT_TEACHER.name} fill className="object-cover" unoptimized />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">{ABOUT_TEACHER.name}</h3>
              <p className="text-sm text-text-secondary">{ABOUT_TEACHER.role}</p>
            </div>
          </div>

          <p className="text-text-secondary whitespace-pre-line leading-relaxed text-sm">{ABOUT_TEACHER.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {ABOUT_TEACHER.stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-background-card border border-border">
                <p className="text-xl font-bold text-accent">{stat.value}</p>
                <p className="text-[10px] text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button fullWidth onClick={() => window.open(TELEGRAM_LINK, '_blank')}>
              Написать в Telegram
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isViewerOpen} onClose={closeHighlight} fullScreen showCloseButton={false}>
        {isViewerOpen && activeCategory && activeHighlight && activeItem && (
          <div className="relative w-full h-full bg-black">
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0"
                >
                  {activeItem.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={activeItem.src}
                      poster={activeItem.posterSrc}
                      className="w-full h-full object-cover"
                      playsInline
                      preload="auto"
                      onEnded={goNext}
                    />
                  ) : (
                    <Image
                      src={activeItem.src}
                      alt=""
                      fill
                      className="object-cover select-none"
                      sizes="100vw"
                      unoptimized
                      draggable={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/70 via-black/25 to-transparent z-20 pointer-events-none" />

            <div className="absolute top-0 left-0 right-0 z-40 pt-2 safe-top px-3 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1">
                  {activeHighlight.items.map((_, index) => {
                    const barProgress = index < activeItemIndex ? 1 : index === activeItemIndex ? progress : 0;
                    return (
                      <div key={index} className="flex-1 h-[2px] bg-white/25 overflow-hidden rounded-full">
                        <div className="h-full bg-white" style={{ width: `${clamp(barProgress, 0, 1) * 100}%` }} />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={closeHighlight}
                  className="w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm border border-white/15 flex items-center justify-center pointer-events-auto"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{activeCategory.title}</div>
                <div className="text-sm text-white/85">{activeHighlight.label}</div>
              </div>
            </div>

            <div
              className="absolute inset-0 z-30"
              onPointerDown={(event) => {
                event.preventDefault();
                handlePressStart(event);
              }}
              onPointerMove={handlePressMove}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressCancel}
              onPointerCancel={handlePressCancel}
              style={{
                touchAction: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            />
          </div>
        )}
      </Modal>
    </section>
  );
}
