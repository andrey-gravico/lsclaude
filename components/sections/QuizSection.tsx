'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Button from '@/components/ui/Button';
import { SWIPE_QUIZ_CARDS, SWIPE_QUIZ_RESULTS, TELEGRAM_LINK} from '@/lib/constants';


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
      <p className="absolute left-6 right-6 top-1/2 -translate-y-1/2 text-white text-2xl font-semibold leading-tight text-center pointer-events-none">
        {card.question}
      </p>
    </>
  );
}

// Result Card Component
interface ResultCardProps {
  yesCount: number;
  onRestart: () => void;
}

function ResultCard({ yesCount, onRestart }: ResultCardProps) {
  const getResult = () => {
    if (yesCount <= 1) return SWIPE_QUIZ_RESULTS.low;
    if (yesCount <= 3) return SWIPE_QUIZ_RESULTS.medium;
    return SWIPE_QUIZ_RESULTS.high;
  };

  const result = getResult();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      className="w-full h-full bg-background-card rounded-2xl p-4 border border-border shadow-xl flex flex-col items-center justify-start text-center pt-10"
    >
      {result.discount ? (
        <>
          <div className="w-14 h-14 mb-2 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-1">{result.title}</h3>
          <p className="text-text-secondary text-xs mb-2 pb-5">{result.description}</p>
          <div className="bg-accent/10 border border-accent rounded-xl p-2 mb-3 w-full max-w-[160px]">
            <p className="text-xs text-text-secondary">Твоя скидка:</p>
            <p className="text-xl font-bold text-accent">{result.discount}</p>
          </div>
          <Button
            fullWidth
            onClick={() => window.open(TELEGRAM_LINK, '_blank')}
            className="max-w-[220px]"
          >
            Зафиксировать скидку
          </Button>
        </>
      ) : (
        <>
          <div className="w-14 h-14 mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <span className="text-2xl">🤔</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">{result.title}</h3>
          <p className="text-text-secondary text-xs mb-3 pb-10">{result.description}</p>
          <Button
            variant="outline"
            fullWidth
            onClick={onRestart}
            className="max-w-[220px]"
          >
            Пройти ещё раз
          </Button>
        </>
      )}
    </motion.div>
  );
}

export default function QuizSection() {
  const [cards, setCards] = useState([...SWIPE_QUIZ_CARDS]);
  const [yesCount, setYesCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const startCardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [startAnimKey, setStartAnimKey] = useState(0);
  const [startCardWidth, setStartCardWidth] = useState(0);
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
  const swipeThreshold = startCardWidth ? startCardWidth * 0.45 : 160;
  const swipeProgress = useTransform(swipeX, (value) => Math.min(Math.abs(value) / swipeThreshold, 1));
  const leftProgress = useTransform(swipeX, (value) => (value < 0 ? Math.min(-value / swipeThreshold, 1) : 0));
  const rightProgress = useTransform(swipeX, (value) => (value > 0 ? Math.min(value / swipeThreshold, 1) : 0));
  const nextScale = useTransform(swipeProgress, [0, 1], [0.8, 1]);
  const nextOpacity = useTransform(swipeProgress, [0, 1], [0, 1]);
  const nextBrightness = useTransform(swipeProgress, (value) => `brightness(${0.65 + 0.35 * value})`);
  const leftGradientHeight = useTransform(leftProgress, [0, 1], ['10%', '33%']);
  const rightGradientHeight = useTransform(rightProgress, [0, 1], ['10%', '33%']);
  const iconScale = useTransform(swipeProgress, [0, 1], [0.9, 1]);

  useEffect(() => {
    swipeX.set(0);
  }, [cards[0]?.id, swipeX]);

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
      swipeX.set(0);
      handleSwipe(direction);
    }, 380);
  };

  const handleRestart = () => {
    setCards([...SWIPE_QUIZ_CARDS]);
    setYesCount(0);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  const handleStart = () => {
    setQuizStarted(true);
  };

  const currentCardNumber = totalCards - cards.length + 1;
  // Start swipe threshold: 35% of card width (fallback 120px).
  const startSwipeThreshold = startCardWidth ? startCardWidth * 0.35 : 120;

  return (
    <section id="quiz" ref={sectionRef} className="snap-section section-padding flex flex-col">
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
            <div className="flex-1 flex flex-col items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom,0)+84px)]">
              {/* 98% keeps breathing room from header and bottom nav */}
              <div className="relative w-[98%] h-[calc(100dvh-140px)] min-h-[70vh]">
                {/* Stack silhouettes (shadow only) */}
                <div className="absolute -inset-6 rounded-[32px] bg-black/35 blur-[18px]" />
                <div className="absolute inset-0 translate-x-1 translate-y-2 scale-[0.98] rounded-[24px] bg-black/25 shadow-[0_18px_50px_rgba(0,0,0,0.6)]" />
                <div className="absolute inset-0 translate-x-2 translate-y-4 scale-[0.96] rounded-[24px] bg-black/30 shadow-[0_22px_60px_rgba(0,0,0,0.7)]" />

                <motion.div
                  ref={startCardRef}
                  key={startAnimKey}
                  // Fade-in on section entry + paused drift (left-center-pause-right-center-pause).
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -7, 0, 0, 7, 0, 0] }}
                  transition={{
                    opacity: { duration: 1.2, ease: 'easeOut' },
                    x: { duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.55, 0.75, 0.9, 1] },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) >= startSwipeThreshold) {
                      handleStart();
                    }
                  }}
                  whileDrag={{ scale: 0.99 }}
                  whileTap={{ scale: 1.02 }} // Touch feedback (slight lift)
                  className="relative z-10 w-full h-full rounded-[24px] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)]"
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
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="relative w-[98%] h-[calc(100dvh-140px)] min-h-[70vh] mx-auto flex-none">
                {/* Card counter */}
                {cards.length > 0 && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 pointer-events-none text-white/90 text-xs sm:text-sm font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    {currentCardNumber}/{totalCards}
                  </div>
                )}

                {/* Next card reveal (only visible while dragging) */}
                {cards[1] && (
                  <motion.div
                    style={{ opacity: nextOpacity, scale: nextScale, filter: nextBrightness }}
                    className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
                  >
                    <CardFace card={cards[1]} />
                  </motion.div>
                )}

                {cards[0] && (
                  <motion.div
                    style={{ x: swipeX }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) >= swipeThreshold) {
                        triggerSwipe(info.offset.x > 0 ? 'right' : 'left');
                      } else {
                        animate(swipeX, 0, { type: 'spring', stiffness: 520, damping: 32 });
                      }
                    }}
                    className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)] bg-black cursor-grab active:cursor-grabbing"
                    whileDrag={{ cursor: 'grabbing' }}
                  >
                    <CardFace card={cards[0]} />

                    {/* Directional gradients (intensity follows drag) */}
                    <motion.div
                      style={{ height: leftGradientHeight, opacity: leftProgress }}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#fd9290] to-transparent pointer-events-none"
                    />
                    <motion.div
                      style={{ height: rightGradientHeight, opacity: rightProgress }}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#d1e1c2] to-transparent pointer-events-none"
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
            </div>
          ) : (
            /* Result */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="relative w-[98%] h-[calc(100dvh-140px)] min-h-[70vh] mx-auto flex-none p-3">
                <ResultCard yesCount={yesCount} onRestart={handleRestart} />
              </div>
            </div>
          )}
          </div>
        </div>
    </section>
  );
}
