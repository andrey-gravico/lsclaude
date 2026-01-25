'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { SWIPE_QUIZ_CARDS, SWIPE_QUIZ_RESULTS, TELEGRAM_LINK, ABOUT_TEACHER, IMAGES } from '@/lib/constants';
import { scrollToSection } from '@/lib/utils';

// Swipe Card Component
interface SwipeCardProps {
  card: { id: number; question: string; image: string };
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
  stackIndex: number;
  isFirst: boolean;
}

function SwipeCard({ card, onSwipe, isTop, stackIndex, isFirst }: SwipeCardProps) {
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

  // Эффект колоды - смещение для каждой карточки
  const stackOffset = {
    scale: 1 - stackIndex * 0.04,
    y: stackIndex * 8,
    x: stackIndex * 4,
  };

  return (
    <motion.div
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
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
      whileDrag={{ cursor: 'grabbing' }}
    >
      {/* Фоновая картинка */}
      <img
        src={card.image}
        alt=""
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* Градиент снизу для текста */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Текст вопроса внизу */}
      <p className="absolute bottom-4 left-4 right-4 text-white text-lg font-bold leading-tight pointer-events-none">
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

      {/* Кнопки по бокам - только для верхней карточки */}
      {isTop && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('left'); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center text-white bg-black/30 backdrop-blur-sm hover:bg-red-500/40 hover:border-red-400 transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('right'); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center text-white bg-black/30 backdrop-blur-sm hover:bg-green-500/40 hover:border-green-400 transition-colors"
          >
            <span className="text-lg">♥</span>
          </button>
        </>
      )}

      {/* Подсказка свайпа - только на первой карточке */}
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

      {/* Тень для эффекта колоды */}
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
      className="flex-1 m-3 bg-background-card rounded-2xl p-4 border border-border shadow-xl flex flex-col items-center justify-center text-center"
    >
      {result.discount ? (
        <>
          <div className="w-14 h-14 mb-2 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">{result.title}</h3>
          <p className="text-text-secondary text-xs mb-2">{result.description}</p>
          <div className="bg-accent/10 border border-accent rounded-xl p-2 mb-3 w-full max-w-[160px]">
            <p className="text-xs text-text-secondary">Твоя скидка:</p>
            <p className="text-xl font-bold text-accent">{result.discount}</p>
          </div>
          <Button
            fullWidth
            onClick={() => window.open(TELEGRAM_LINK, '_blank')}
            className="max-w-[220px]"
          >
            Записаться со скидкой
          </Button>
        </>
      ) : (
        <>
          <div className="w-14 h-14 mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <span className="text-2xl">🤔</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">{result.title}</h3>
          <p className="text-text-secondary text-xs mb-3">{result.description}</p>
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
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [cards, setCards] = useState([...SWIPE_QUIZ_CARDS]);
  const [yesCount, setYesCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [exitingCard, setExitingCard] = useState<number | null>(null);
  const totalCards = SWIPE_QUIZ_CARDS.length;

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

  return (
    <section id="quiz" className="snap-section section-padding flex flex-col">
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

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col">
        {/* === Аватар + Текст === */}
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
                  id="circlePathQuiz"
                  d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
                />
              </defs>
              <text className="text-[7.0px] fill-text-secondary uppercase tracking-[0.40em]">
                <textPath href="#circlePathQuiz">
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

          {/* Текст справа от аватара */}
          <div className="flex-1 flex flex-col gap-1 -mt-6">
            <p className="text-[13px] font-semibold text-text-primary font-montserrat">
              Снимай | Монтируй | <span className="slow-shimmer font-bold">Удивляй</span>
            </p>
            <h2 className="text-[22px] font-bold text-text-primary font-montserrat">
              Пройди тест
            </h2>
            <ul className="text-xs text-text-secondary space-y-0.5">
              <li>И получи подарок</li>
            </ul>
          </div>
        </div>

        {/* === Кнопки === */}
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

        {/* === Серая линия === */}
        <div className="border-t border-border w-screen -mx-4" />

        {/* === Quiz Area === */}
        <div className="flex-1 flex flex-col relative">
          {!quizStarted ? (
            /* Начальный экран */
            <div className="flex-1 flex flex-col items-center mt-20 px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                {/* SVG иконка чеклиста */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-border flex items-center justify-center bg-background-card">
                  <svg
                    className="w-9 h-9 text-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M7 12l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-text-primary text-lg mb-2">Пройди тест и получи подарок!</p>
                <p className="text-text-secondary text-sm mb-5">
                  Вправо = ДА, Влево = НЕТ
                </p>
                <Button onClick={handleStart} className="px-8">
                  ТЕСТ
                </Button>
              </motion.div>
            </div>
          ) : !quizComplete ? (
            /* Quiz Cards */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Счётчик вверху справа */}
              <div className="flex justify-end mb- flex-shrink-0">
                <div className="text-text-secondary text-sm font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  {currentCardNumber}/{totalCards}
                </div>
              </div>
              {/* Card Stack - фиксированная высота */}
              <div className="relative flex-1 min-h-0 max-h-[calc(100%-40px)]">
                <AnimatePresence mode="popLayout">
                  {cards.slice(0, 3).map((card, index) => (
                    <SwipeCard
                      key={card.id}
                      card={card}
                      onSwipe={handleSwipe}
                      isTop={index === 0 && exitingCard !== card.id}
                      stackIndex={index}
                      isFirst={currentCardNumber === 1 && index === 0}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Result */
            <ResultCard yesCount={yesCount} onRestart={handleRestart} />
          )}
        </div>
      </div>

      {/* === ABOUT MODAL === */}
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
    </section>
  );
}
