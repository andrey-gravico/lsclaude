'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, LayoutGroup } from 'framer-motion';
import Button from '@/components/ui/Button';
import { SWIPE_QUIZ_CARDS, SWIPE_QUIZ_RESULTS, TELEGRAM_LINK} from '@/lib/constants';


// Swipe Card Component
interface SwipeCardProps {
  card: { id: number; question: string; image: string };
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
  stackIndex: number;
  isFirst: boolean;
  currentCardNumber: number;
  totalCards: number;
  layoutId?: string;
}

function SwipeCard({
  card,
  onSwipe,
  isTop,
  stackIndex,
  isFirst,
  currentCardNumber,
  totalCards,
  layoutId,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const yesOpacity = useTransform(x, [0, 100], [0, 1]);
  const noOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  // Stack effect offsets for each card.
  // Deck depth tuning: scale/y/x control the visible stack spacing.
  const stackOffset = {
    scale: 1 - stackIndex * 0.035,
    y: stackIndex * 10,
    x: stackIndex * 6,
  };

  return (
    <motion.div
      layoutId={layoutId}
      style={{
        x: isTop ? x : stackOffset.x,
        rotate: isTop ? rotate : 0,
        scale: stackOffset.scale,
        y: stackOffset.y,
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: stackOffset.scale,
        opacity: 1 - stackIndex * 0.15,
        y: stackOffset.y,
        x: isTop ? 0 : stackOffset.x,
      }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        rotate: x.get() > 0 ? 20 : -20,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.45),0_24px_80px_rgba(0,0,0,0.7)] cursor-grab active:cursor-grabbing bg-black"
      whileDrag={{ cursor: 'grabbing' }}
    >
      <img
        src={card.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      <p className="absolute bottom-26 left-2 right-2 text-white text-2xl font-semibold leading-tight text-center pointer-events-none">
        {card.question}
      </p>

      {/* YES indicator */}
      <motion.div
        style={{ opacity: yesOpacity }}
        className="absolute top-4 right-4 text-green-400 font-bold text-2xl rotate-12 border-3 border-green-400 px-2 py-0.5 rounded-lg bg-green-400/20 backdrop-blur-sm"
      >
        ДА
      </motion.div>

      {/* NO indicator */}
      <motion.div
        style={{ opacity: noOpacity }}
        className="absolute top-4 left-4 text-red-400 font-bold text-2xl -rotate-12 border-3 border-red-400 px-2 py-0.5 rounded-lg bg-red-400/20 backdrop-blur-sm"
      >
        НЕТ
      </motion.div>

      {isTop && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('left'); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center text-white bg-black/30 backdrop-blur-xs hover:bg-red-500/40 hover:border-red-400 transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('right'); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center text-white bg-black/30 backdrop-blur-xs hover:bg-green-500/40 hover:border-green-400 transition-colors"
          >
            <span className="text-2xl">♥</span>
          </button>
        </>
      )}
      {isTop && isFirst && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <motion.div
            animate={{ x: [0, 30, 0, -30, 0] }}
            transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
            className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <span className="text-white/80 text-sm">← свайпай →</span>
          </motion.div>
        </motion.div>
      )}

      {stackIndex > 0 && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      )}
    </motion.div>
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
  const [exitingCard, setExitingCard] = useState<number | null>(null);
  const startCardRef = useRef<HTMLDivElement>(null);
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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (cards.length === 0) return;

    const currentCard = cards[0];
    setExitingCard(currentCard.id);

    if (direction === 'right') {
      setYesCount((prev) => prev + 1);
    }

    setTimeout(() => {
      setCards((prev) => prev.slice(1));
      setExitingCard(null);

      if (cards.length === 1) {
        setTimeout(() => setQuizComplete(true), 100);
      }
    }, 200);
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
    <section id="quiz" className="snap-section section-padding flex flex-col">
      <LayoutGroup>
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
                <div className="absolute inset-0 translate-x-1 translate-y-2 scale-[0.98] rounded-[24px] bg-black/20 shadow-[0_14px_40px_rgba(0,0,0,0.45)]" />
                <div className="absolute inset-0 translate-x-2 translate-y-4 scale-[0.96] rounded-[24px] bg-black/25 shadow-[0_18px_50px_rgba(0,0,0,0.55)]" />

                <motion.div
                  ref={startCardRef}
                  layoutId="quiz-start-card"
                  // Entrance + drift: adjust scale/y and x keyframes/duration for feel.
                  initial={{ opacity: 0, y: 26, scale: 0.92 }}
                  animate={{ opacity: [0, 1], y: [26, 0], scale: [0.92, 1.03, 1], x: [0, 7, 0, -7, 0] }}
                  transition={{
                    duration: 0.85,
                    ease: 'easeOut',
                    x: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
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
                  className="relative z-10 w-full h-full rounded-[24px] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.45),0_28px_90px_rgba(0,0,0,0.75)]"
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
              {/* Card Stack - size matches start card */}
              <div className="relative w-[98%] h-[calc(100dvh-140px)] min-h-[70vh] mx-auto flex-none">
                {/* Card counter */}
                {cards.length > 0 && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 pointer-events-none text-white/90 text-xs sm:text-sm font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                    {currentCardNumber}/{totalCards}
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {cards.slice(0, 3).map((card, index) => (
                    <SwipeCard
                      key={card.id}
                      card={card}
                      onSwipe={handleSwipe}
                      isTop={index === 0 && exitingCard !== card.id}
                      stackIndex={index}
                      isFirst={currentCardNumber === 1 && index === 0}
                      currentCardNumber={currentCardNumber}
                      totalCards={totalCards}
                      layoutId={index === 0 && currentCardNumber === 1 ? 'quiz-start-card' : undefined}
                    />
                  ))}
                </AnimatePresence>
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
      </LayoutGroup>
    </section>
  );
}
