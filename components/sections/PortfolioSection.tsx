'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { PORTFOLIO_CASES, TELEGRAM_LINK } from '@/lib/constants';
import type { PortfolioCase, PortfolioHighlightItem } from '@/lib/constants';

const IMAGE_DURATION_MS = 5000;
const HOLD_DELAY_MS = 280;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function PortfolioSection() {
  const [activeCase, setActiveCase] = useState<PortfolioCase | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimeout = useRef<number | null>(null);
  const isHolding = useRef(false);
  const wasPlaying = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  const swipeDirection = useRef<'prev' | 'next' | null>(null);
  const lastPointerTimestampMs = useRef(0);
  const currentTimestampMs = useRef(0);

  const imageAccumulatedMs = useRef(0);
  const imageStartMs = useRef(0);
  const activeCaseRef = useRef<PortfolioCase | null>(null);
  const activeItemIndexRef = useRef(0);

  const isViewerOpen = Boolean(activeCase);

  const portfolioCases = useMemo(() => PORTFOLIO_CASES, []);

  const activeItem: PortfolioHighlightItem | null = useMemo(() => {
    if (!activeCase) return null;
    return activeCase.items[activeItemIndex] ?? null;
  }, [activeCase, activeItemIndex]);

  useEffect(() => {
    activeCaseRef.current = activeCase;
  }, [activeCase]);

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

  const openCase = (portfolioCase: PortfolioCase) => {
    setActiveCase(portfolioCase);
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
    setActiveCase(null);
    imageAccumulatedMs.current = 0;
    imageStartMs.current = 0;
  }, []);

  const goNext = useCallback(() => {
    const highlight = activeCaseRef.current;
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
      if (!isViewerOpen || !activeCase) return;
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
  }, [activeCase, activeItem, isPaused, isViewerOpen, activeItemIndex, goNext]);

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
    swipeDirection.current = null;

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
      return;
    }

    if (deltaX > 60 && deltaX > Math.abs(deltaY) && !swipeDirection.current) {
      swipeDirection.current = event.clientX < pointerStart.current.x ? 'next' : 'prev';
      hasMoved.current = true;
      if (holdTimeout.current) {
        window.clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      pointerStart.current = null;
      if (swipeDirection.current === 'next') goNext();
      else goPrev();
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

    if (hasMoved.current || swipeDirection.current) {
      hasMoved.current = false;
      swipeDirection.current = null;
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
    swipeDirection.current = null;
    if (isHolding.current) {
      isHolding.current = false;
      resumePlayback();
    }
  };

  return (
    <section
      id="portfolio"
      className="snap-section section-padding flex flex-col bg-gradient-to-b from-[#0b0a0a] via-[#0d0c0b] to-[#090808]"
    >
      <div className="flex-1 flex flex-col">
        <div className="pt-6 px-4">
          <div className="text-center text-sm font-semibold text-text-primary font-montserrat">
            Снимай | Монтируй | <span className="slow-shimmer font-bold">Удивляй</span>
          </div>
          <h2 className="text-[26px] font-bold text-text-primary font-montserrat mt-2 text-center">Портфолио</h2>
        </div>

        <div className="mt-4 flex flex-col gap-4 pb-20">
          {portfolioCases
            .filter((item) => item.isHero)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => openCase(item)}
                className="relative w-[95vw] max-w-[430px] mx-auto aspect-[4/5] max-h-[33vh] rounded-[22px] overflow-hidden shadow-[0_22px_50px_rgba(0,0,0,0.55)] bg-black/40 transition-transform duration-300 ease-out active:translate-y-0.5"
              >
                <Image
                  src={item.coverSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80vw"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div
                  className={`absolute left-3 top-3 px-3 py-1 rounded-full text-[10px] font-semibold ${item.badgeClass}`}
                >
                  {item.badge}
                </div>
                <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between">
                  <div className="text-left">
                    <div className="text-[20px] font-semibold text-white">{item.label}</div>
                    <div className="text-[11px] text-white/65 mt-0.5">{item.subtitle}</div>
                  </div>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/10 text-white text-[12px] border border-white/25 backdrop-blur-sm">
                    Смотреть
                  </span>
                </div>
              </button>
            ))}

          <div className="w-[95vw] max-w-[430px] mx-auto flex items-start gap-4">
            {portfolioCases
              .filter((item) => !item.isHero)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => openCase(item)}
                  className="relative flex-1 aspect-[4/5] max-h-[30vh] rounded-[18px] overflow-hidden bg-black/40 shadow-[0_18px_38px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out hover:-translate-y-1 active:translate-y-0.5"
                >
                  <Image
                    src={item.coverSrc}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div
                    className={`absolute left-3 top-3 px-3 py-1 rounded-full text-[10px] font-semibold ${item.badgeClass}`}
                  >
                    {item.badge}
                  </div>
                  <div className="absolute left-3 bottom-3 text-[14px] font-semibold text-white">{item.label}</div>
                </button>
              ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isViewerOpen} onClose={closeHighlight} fullScreen showCloseButton={false}>
        {isViewerOpen && activeCase && activeItem && (
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
              <div className="flex items-center gap-1">
                {activeCase.items.map((_, index) => {
                  const barProgress = index < activeItemIndex ? 1 : index === activeItemIndex ? progress : 0;
                  return (
                    <div key={index} className="flex-1 h-[2px] bg-white/25 overflow-hidden rounded-full">
                      <div className="h-full bg-white" style={{ width: `${clamp(barProgress, 0, 1) * 100}%` }} />
                    </div>
                  );
                })}
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
