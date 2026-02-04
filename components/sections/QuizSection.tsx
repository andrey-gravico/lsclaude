'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import TelegramConfirmModal from '@/components/ui/TelegramConfirmModal';
import { SWIPE_QUIZ_CARDS, TELEGRAM_LINK } from '@/lib/constants';

// Border slider animation for the gift block frame.
const borderSweepKeyframes = `
@property --a {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@keyframes borderSweep {
  0% { --a: 0deg; opacity: 0.15; }
  20% { opacity: 1; }
  50% { opacity: 0.35; }
  80% { opacity: 1; }
  100% { --a: 360deg; opacity: 0.15; }
}
`;


// Card face content used by top and next cards.
interface CardFaceProps {
  card: { id: number; question: string; image: string };
}

function CardFace({ card }: CardFaceProps) {
  return (
    <>
      <img
        src={card.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      <p className="absolute left-6 right-6 top-[78%] -translate-y-1/2 text-white text-2xl font-semibold leading-tight text-center pointer-events-none">
        {card.question}
      </p>
    </>
  );
}

// Result Card Component
function GlitterExplosion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = canvas.getBoundingClientRect();
      if (rect.width == 0 || rect.height == 0) {
        raf = requestAnimationFrame(setup);
        return;
      }
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const origin = { x: rect.width / 2, y: rect.height * 0.72 };
      const colors = ['#f5c4b4', '#ffd7b0', '#fff2e6'];

      const makeDust = () => ({
        x: origin.x + (Math.random() - 0.5) * 1.2,
        y: origin.y + (Math.random() - 0.5) * 1.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(12 + Math.random() * 6),
        size: Math.random() * 0.35 + 0.12,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        burst: false,
        life: 1.8 + Math.random() * 0.7,
      });

      const makeSparkle = () => ({
        x: origin.x + (Math.random() - 0.5) * 1.0,
        y: origin.y + (Math.random() - 0.5) * 1.0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(13 + Math.random() * 6),
        size: Math.random() * 0.55 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        burst: false,
        life: 1.8 + Math.random() * 0.7,
      });

      type Particle = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
        rotation: number;
        vr: number;
        burst: boolean;
        life: number;
      };

      const dust: Particle[] = Array.from({ length: 2800 }).map(makeDust);
      const sparkles: Particle[] = Array.from({ length: 520 }).map(makeSparkle);

      const startTime = performance.now();
      const gravity = 0.32;
      const drag = 0.993;

      const drawParticle = (
        context: CanvasRenderingContext2D,
        p: Particle,
        alpha: number,
        rotate: boolean
      ) => {
        context.save();
        context.translate(p.x, p.y);
        if (rotate) context.rotate(p.rotation);
        context.globalAlpha = alpha;
        context.fillStyle = p.color;
        context.beginPath();
        context.ellipse(0, 0, p.size, p.size * 0.7, rotate ? p.rotation : 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      };

      const update = (p: Particle, t: number, isSparkle: boolean) => {
        if (!p.burst && t >= 0.55) {
          p.burst = true;
          const angle = Math.random() * Math.PI * 2;
          const speed = (isSparkle ? 7 : 5.5) + Math.random() * (isSparkle ? 6 : 5);
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
        }

        const postBurst = p.burst ? 1 : 1.1;
        p.vy += gravity * postBurst;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * postBurst;
        p.y += p.vy * postBurst;
        p.rotation += p.vr;
        p.life -= 0.018;

        if (p.life <= 0 || p.y > rect.height + 40 || p.x < -40 || p.x > rect.width + 40) {
          return 0;
        }

        const shimmer = 0.6 + 0.4 * Math.sin(t * 5 + p.rotation * 1.3);
        const alpha = (isSparkle ? 0.95 : 0.6) * shimmer;
        drawParticle(ctx, p, alpha, isSparkle);
        return 1;
      };

      const render = (now: number) => {
        const t = (now - startTime) / 1000;
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.globalCompositeOperation = 'lighter';

        let aliveMoving = 0;
        dust.forEach((p) => {
          aliveMoving += update(p, t, false);
        });
        sparkles.forEach((p) => {
          aliveMoving += update(p, t, true);
        });

        if (aliveMoving > 0) {
          requestAnimationFrame(render);
        }
      };

      requestAnimationFrame(render);
    };

    setup();

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        setup();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-40 mix-blend-screen"
    />
  );
}

interface ResultCardProps {
  yesCount: number;
  timerText: string;
  onCTA: () => void;
  animKey: number;
}

function ResultCard({ yesCount, timerText, onCTA, animKey }: ResultCardProps) {
  const isHigh = yesCount === 7;
  const isMid = yesCount >= 3 && yesCount <= 6;
  const resultText = isHigh
    ? 'Тебе 100% будет комфортно на этом курсе'
    : isMid
      ? 'Этот формат тебе действительно откликается!'
      : 'Тебе важны спокойный темп и понятная подача. Именно так выстроен этот курс';
  const discount = isHigh ? '1000 ₽' : isMid ? '1000 ₽' : '1500 ₽';
  const [showHint] = useState(true);

  return (
    // Result card wrapper + 3D context.
    <div className="relative w-full h-full [perspective:1200px] [transform-style:preserve-3d]">
      <motion.div
        key={animKey}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: [0.7, 1, 1.05, 1], opacity: 1 }}
        transition={{
          scale: { duration: 2.3, times: [0, 0.78, 0.9, 1], ease: 'easeOut' },
          opacity: { duration: 0.3 },
        }}
        style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center', willChange: 'transform' }}
        className="relative w-full h-full"
      >
        {/* 3D spin layer (front/back faces). */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 1080 }}
          transition={{ duration: 2.1, ease: 'easeOut' }}
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          className="absolute inset-0 rounded-[24px] shadow-xl"
        >
          {/* Front face (content) */}
          <div
            className="absolute inset-0 rounded-[24px] bg-background-card border border-border p-5 flex flex-col items-center text-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transformStyle: 'preserve-3d', transform: 'translateZ(4px)' }}
          >
            {/* Result text */}
            <div className="pt-10">
              <p className="text-lg font-semibold text-text-primary leading-snug">{resultText}</p>
            </div>

            {/* Discount block centered (doesn't push CTA) */}
            <div className="absolute left-1/2 top-[40%] w-full max-w-[260px] -translate-x-1/2 -translate-y-1/2">
              {/* Discount block + timer + hint */}
              <div className="relative w-full rounded-2xl p-[1px]">
                {/* moving slider along the frame */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl p-[1px] animate-[borderSweep_5s_linear_infinite]"
                  style={{
                    '--a': '0deg',
                    background:
                      'conic-gradient(from var(--a), rgba(255,255,255,0) 0deg, rgba(245,196,180,0.95) 16deg, rgba(255,255,255,0.2) 26deg, rgba(255,255,255,0) 48deg, rgba(255,255,255,0) 180deg, rgba(245,196,180,0.95) 196deg, rgba(255,255,255,0.2) 206deg, rgba(255,255,255,0) 228deg)',
                    WebkitMask:
                      'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  } as React.CSSProperties}
                />
                <div className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl px-4 py-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Твой подарок</span>
                  <span className="text-xs text-text-secondary">{timerText}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-4xl font-bold text-white">{discount}</span>
                  {isHigh && (
                    <span className="text-[10px] px-2 py-1 rounded-full border border-emerald-400/60 text-emerald-300">
                      Приоритет
                    </span>
                  )}
                </div>
                {showHint && (
                  <div className="mt-2 text-[11px] text-text-secondary">
                    Делай скрин скидки и отправляй боту для фиксации
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* CTA button pinned to bottom */}
            <div className="absolute bottom-7 left-1/2 w-full max-w-[260px] -translate-x-1/2">
              <button
                onClick={onCTA}
                className="w-full rounded-2xl bg-[#27A7E7] text-white py-3 flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(39,167,231,0.35)]"
              >
                <img src="/images/icons/review.png" alt="" className="w-6 h-6" draggable={false} />
                Зафиксировать подарок
              </button>

            </div>
          </div>

        {/* Back face (card back) */}
        <div
          className="absolute inset-0 rounded-[24px] bg-background-card border border-border"
          style={{ transform: 'rotateY(180deg) translateZ(4px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-6 rounded-[18px] border border-white/15" />
          <div className="absolute inset-10 rounded-[14px] border border-white/10" />
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function QuizSection() {
  useEffect(() => {
    if (document.getElementById('border-sweep-style')) return;
    const style = document.createElement('style');
    style.id = 'border-sweep-style';
    style.textContent = borderSweepKeyframes;
    document.head.appendChild(style);
  }, []);
  const [cards, setCards] = useState([...SWIPE_QUIZ_CARDS]);
  const [yesCount, setYesCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [resultAnimKey, setResultAnimKey] = useState(0);
  const [discountStart, setDiscountStart] = useState<number | null>(null);
  const [timerText, setTimerText] = useState('72:00:00');
  const startCardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [startAnimKey, setStartAnimKey] = useState(0);
  const [startCardWidth, setStartCardWidth] = useState(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragLockRef = useRef<'x' | 'y' | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const scrollOverflowRef = useRef<string | null>(null);
  const scrollTouchActionRef = useRef<string | null>(null);
  const scrollWebkitRef = useRef<string | null>(null);
  const totalCards = SWIPE_QUIZ_CARDS.length;

  useEffect(() => {
    const updateWidth = () => {
      if (startCardRef.current) {
        setStartCardWidth(startCardRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    scrollContainerRef.current = document.querySelector('.snap-container') as HTMLElement | null;
  }, []);

  useEffect(() => {
    if (!quizComplete) return;
    setResultAnimKey((prev) => prev + 1);
    const stored = window.sessionStorage.getItem('quiz_discount_start');
    const start = stored ? Number(stored) : Date.now();
    if (!stored) {
      window.sessionStorage.setItem('quiz_discount_start', String(start));
    }
    setDiscountStart(start);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizComplete]);

  useEffect(() => {
    if (!discountStart) return;
    const durationMs = 72 * 60 * 60 * 1000;
    const tick = () => {
      const remaining = discountStart + durationMs - Date.now();
      if (remaining <= 0) {
        setTimerText('00:00:00');
        return;
      }
      const totalSec = Math.floor(remaining / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setTimerText(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [discountStart]);

  const lockHorizontal = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (scrollOverflowRef.current === null) {
      scrollOverflowRef.current = container.style.overflowY;
    }
    if (scrollTouchActionRef.current === null) {
      scrollTouchActionRef.current = container.style.touchAction;
    }
    if (scrollWebkitRef.current === null) {
      scrollWebkitRef.current = (container.style as unknown as { webkitOverflowScrolling?: string }).webkitOverflowScrolling ?? '';
    }
    container.style.overflowY = 'hidden';
    container.style.touchAction = 'none';
    (container.style as unknown as { webkitOverflowScrolling?: string }).webkitOverflowScrolling = 'auto';
  }, []);

  const unlockHorizontal = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container && scrollOverflowRef.current !== null) {
      container.style.overflowY = scrollOverflowRef.current;
    }
    scrollOverflowRef.current = null;
    if (container && scrollTouchActionRef.current !== null) {
      container.style.touchAction = scrollTouchActionRef.current;
    }
    scrollTouchActionRef.current = null;
    if (container && scrollWebkitRef.current !== null) {
      (container.style as unknown as { webkitOverflowScrolling?: string }).webkitOverflowScrolling = scrollWebkitRef.current;
    }
    scrollWebkitRef.current = null;
  }, []);

  useEffect(() => {
    if (quizStarted && !quizComplete) {
      lockHorizontal();
      return;
    }
    unlockHorizontal();
  }, [quizStarted, quizComplete, lockHorizontal, unlockHorizontal]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    dragLockRef.current = null;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const startThreshold = 8;
    const extraX = 4;

    if (!dragLockRef.current && (absX > startThreshold || absY > startThreshold)) {
      const rightSwipe = dx > 0;
      const xBias = rightSwipe ? 0.6 : 1.2;
      if (absX >= absY * xBias && absX > startThreshold + extraX) {
        dragLockRef.current = 'x';
        lockHorizontal();
      } else if (absY > absX * 1.5) {
        dragLockRef.current = 'y';
        if (!quizStarted || quizComplete) {
          unlockHorizontal();
        }
      }
    }

    if (dragLockRef.current === 'x') {
      event.preventDefault();
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    dragLockRef.current = null;
    if (!quizStarted || quizComplete) {
      unlockHorizontal();
    }
  };

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !quizStarted) {
            setStartAnimKey((prev) => prev + 1);
          }
        });
      },
      { root: document.querySelector('.snap-container'), threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [quizStarted]);

  const swipeX = useMotionValue(0);
  const swipeThreshold = startCardWidth ? startCardWidth * 0.4 : 160;
  const visualThreshold = startCardWidth ? startCardWidth * 0.9 : 320;
  const swipeProgress = useTransform(swipeX, (value) => Math.min(Math.abs(value) / visualThreshold, 1));
  const leftProgress = useTransform(swipeX, (value) => (value < 0 ? Math.min(-value / swipeThreshold, 1) : 0));
  const rightProgress = useTransform(swipeX, (value) => (value > 0 ? Math.min(value / swipeThreshold, 1) : 0));
  const nextScale = useTransform(swipeProgress, [0, 1], [0.93, 1]);
  const nextOpacity = useTransform(swipeProgress, [0, 1], [0, 1]);
  const nextBrightness = useTransform(swipeProgress, (value) => `brightness(${0.75 + 0.25 * value})`);
  const leftGradientHeight = useTransform(leftProgress, [0, 1], ['15%', '33%']);
  const rightGradientHeight = useTransform(rightProgress, [0, 1], ['15%', '33%']);
  const iconScale = useTransform(swipeProgress, [0, 1], [0.9, 1]);

  useLayoutEffect(() => {
    swipeX.stop();
    swipeX.set(0);
  }, [cards[0]?.id, swipeX]);

  useEffect(() => {
    if (!cards[1]?.image) return;
    const img = new Image();
    img.src = cards[1].image;
  }, [cards]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (cards.length === 0) return;

    if (direction === 'right') {
      setYesCount((prev) => prev + 1);
    }

    if (cards.length === 1) {
      setTimeout(() => setQuizComplete(true), 100);
    }

    setCards((prev) => prev.slice(1));
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const target = direction === 'right' ? swipeThreshold * 3 : -swipeThreshold * 3;
    animate(swipeX, target, { duration: 0.38, ease: 'easeOut' });
    window.setTimeout(() => {
      handleSwipe(direction);
    }, 380);
  };

  const handleExitQuiz = () => {
    window.sessionStorage.removeItem('quiz_discount_start');
    setCards([...SWIPE_QUIZ_CARDS]);
    setYesCount(0);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  const handleCTAConfirm = () => {
    window.open(TELEGRAM_LINK, '_blank');
    setIsConfirmOpen(false);
  };

  const handleStart = () => {
    setQuizStarted(true);
  };

  const currentCardNumber = totalCards - cards.length + 1;
  // Start swipe threshold: 35% of card width (fallback 120px).
  const startSwipeThreshold = startCardWidth ? startCardWidth * 0.35 : 120;

  return (
    <section
      id="quiz"
      ref={sectionRef}
      className="snap-section section-padding flex flex-col"
    >
      <div className="flex-1 flex flex-col pt-4">
          <div className="px-0 pt-2 pb-3">
            <p className="text-[18px] sm:text-[20px] text-center font-semibold text-text-primary font-montserrat">
              Снимай | Монтируй | <span className="slow-shimmer font-bold">Удивляй</span>
            </p>
          </div>

          {/* === Quiz Area === */}
          <div className="flex-1 flex flex-col relative">
            {!quizStarted ? (
            /* Start Swipe Card */
            <div className="flex-1 flex flex-col items-center justify-center pb-[calc(env(safe-area-inset-bottom,0)+84px)]">
              {/* 98% keeps breathing room from header and bottom nav */}
              <div className="relative w-full h-[calc(100dvh-140px)] min-h-[70vh]">
                {/* Stack silhouettes (shadow only) */}
                <div className="absolute -inset-4 rounded-[32px] bg-transparent blur-[14px]" />
                <div className="absolute inset-0 scale-[0.985] rounded-[24px]  shadow-[0_10px_28px_rgba(245,196,180,0.05)]" />

                <motion.div
                  ref={startCardRef}
                  key={startAnimKey}
                  // Fade-in on section entry + paused drift (left-center-pause-right-center-pause).
                  initial={false}
                  animate={{ x: [0, -7, 0, 0, 7, 0, 0] }}
                  transition={{
                    x: { duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.55, 0.75, 0.9, 1] },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  dragMomentum={false}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) >= startSwipeThreshold) {
                      handleStart();
                    }
                  }}
                  whileDrag={{ scale: 0.99 }}
                  whileTap={{ scale: 1.02 }} // Touch feedback (slight lift)
                  style={{ touchAction: 'pan-y' }}
                  className="relative z-10 w-full h-full rounded-[24px] overflow-hidden shadow-[0_10px_26px_rgba(245,196,180,0.025),0_6px_18px_rgba(0,0,0,0.3)]"
                >
                  <img
                    src="/images/test/quizhero.png"
                    alt=""
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </motion.div>
              </div>
            </div>
          ) : !quizComplete ? (
            /* Quiz Cards */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="relative w-[98%] h-[calc(100dvh-140px)] min-h-[70vh] mx-auto flex-none">
                {/* Exit button */}
                <button
                  onClick={handleExitQuiz}
                  className="absolute top-5 left-6 z-50 w-10 h-10 rounded-full border border-white/40 bg-black/30 backdrop-blur-sm flex items-center justify-center"
                  aria-label="Выйти"
                >
                  <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                {/* Card counter */}
                {cards.length > 0 && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 pointer-events-none text-white/90 text-xs sm:text-sm font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    {currentCardNumber}/{totalCards}
                  </div>
                )}

                {/* Next card reveal (only visible while dragging) */}
                {cards[1] && (
                  <motion.div
                    key={cards[1].id}
                    style={{ opacity: nextOpacity, scale: nextScale, filter: nextBrightness }}
                    className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                  >
                    <CardFace card={cards[1]} />
                  </motion.div>
                )}

                {cards[0] && (
                  <motion.div
                    key={cards[0].id}
                    style={{ x: swipeX, touchAction: quizStarted && !quizComplete ? 'none' : 'pan-y' }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    dragMomentum={false}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) >= swipeThreshold) {
                        triggerSwipe(info.offset.x > 0 ? 'right' : 'left');
                      } else {
                        animate(swipeX, 0, { type: 'spring', stiffness: 520, damping: 32 });
                      }
                    }}
                    className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)] bg-black cursor-grab active:cursor-grabbing"
                    whileDrag={{ cursor: 'grabbing' }}
                  >
                    <CardFace card={cards[0]} />

                    {/* Directional gradients (intensity follows drag) */}
                    <motion.div
                      style={{ height: leftGradientHeight, opacity: leftProgress }}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#fb6562] to-transparent pointer-events-none"
                    />
                    <motion.div
                      style={{ height: rightGradientHeight, opacity: rightProgress }}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#98d95c] to-transparent pointer-events-none"
                    />

                    {/* Center drag icons */}
                    <motion.img
                      src="/images/icons/no.png"
                      alt=""
                      style={{ opacity: leftProgress, scale: iconScale }}
                      className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] pointer-events-none"
                      draggable={false}
                    />
                    <motion.img
                      src="/images/icons/yes.png"
                      alt=""
                      style={{ opacity: rightProgress, scale: iconScale }}
                      className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] pointer-events-none"
                      draggable={false}
                    />

                    {/* Bottom controls */}
                    <div className="absolute bottom-5 inset-x-6 flex items-center justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerSwipe('left'); }}
                        className="w-14 h-14 rounded-full border-2 border-white/40 bg-black/35 backdrop-blur-sm flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        aria-label="No"
                      >
                        <img src="/images/icons/no.png" alt="" className="w-6 h-6" draggable={false} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerSwipe('right'); }}
                        className="w-14 h-14 rounded-full border-2 border-white/40 bg-black/35 backdrop-blur-sm flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        aria-label="Yes"
                      >
                        <img src="/images/icons/yes.png" alt="" className="w-6 h-6" draggable={false} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Result */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="relative w-[98%] h-[calc(100dvh-140px)] min-h-[70vh] mx-auto flex-none p-3">
                <GlitterExplosion key={`glitter-${resultAnimKey}`} />
                <ResultCard
                  yesCount={yesCount}
                  timerText={timerText}
                  onCTA={() => setIsConfirmOpen(true)}
                  animKey={resultAnimKey}
                />
              </div>
            </div>
          )}
          </div>
        </div>
        <TelegramConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleCTAConfirm}
        />
    </section>
  );
}
