'use client';

import { useState, useEffect, useCallback, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NAV_ITEMS } from '@/lib/constants';
import { cn, scrollToSection } from '@/lib/utils';

const icons: Record<string, string> = {
  home: '/images/icons/hero.png',
  book: '/images/icons/programm.png',
  clipboard: '/images/icons/quizz.png',
  camera: '/images/icons/portfolio.png',
  star: '/images/icons/review.png',
  help: '/images/icons/faqq.png',
  price: '/images/icons/price.png',
};

export default function BottomNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; itemId: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Используем IntersectionObserver вместо window.scrollY
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observerOptions = {
      root: document.querySelector('.snap-container'),
      rootMargin: '-40% 0px -40% 0px', // Активируется когда секция в центре экрана
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>, sectionId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y, itemId: sectionId }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    scrollToSection(sectionId);
    setIsOpen(false);
  }, []);

  return (
    <nav className="fixed bottom-4 right-0 z-50 safe-bottom">
      <div className="right-nav flex flex-col items-end overflow-hidden">
        <motion.div
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: {
              height: 'auto',
              opacity: 1,
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
            closed: {
              height: 0,
              opacity: 0,
              transition: { duration: 0.4, ease: [0.4, 0, 0.6, 1] },
            },
          }}
          className="overflow-hidden"
          style={{ transformOrigin: 'bottom', willChange: 'height, opacity' }}
        >
          <div className="px-0 py-2">
            <div className="flex flex-col items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const itemRipples = ripples.filter((r) => r.itemId === item.id);

                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleClick(e, item.id)}
                    className={cn(
                    'relative flex flex-col items-center justify-center min-w-[40px] py-2 px-1 rounded-xl transition-colors ripple-container',
                    isActive ? 'text-accent' : 'text-text-secondary'
                  )}
                >
                    {itemRipples.map((ripple) => (
                      <span
                        key={ripple.id}
                        className="ripple"
                        style={{
                          left: ripple.x,
                          top: ripple.y,
                          width: 20,
                          height: 20,
                          marginLeft: -10,
                          marginTop: -10,
                        }}
                      />
                    ))}

                    <motion.div
                      animate={isActive ? {
                        scale: 1.2,
                        filter: 'drop-shadow(0 0 6px rgba(245, 196, 180, 0.5))',
                      } : {
                        scale: 1,
                        filter: 'drop-shadow(0 0 0 transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {icons[item.icon] ? (
                        <Image
                          src={icons[item.icon] ?? icons.help}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5"
                          draggable={false}
                          priority={item.id === 'hero'}
                        />
                      ) : (
                        <span
                          className="w-5 h-5 rounded-[4px] border border-white/30"
                          aria-hidden
                        />
                      )}
                    </motion.div>

                    <span className={cn('text-[9px] mt-1 ml-1.5 transition-colors', isActive ? 'font-medium' : '')}>
                      {item.label}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -top-1 w-1 h-1 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="h-px w-full bg-white/10" />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-text-primary transition-transform active:scale-[0.98]"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <span className="sr-only">{isOpen ? 'Закрыть' : 'Меню'}</span>
            <span className="relative flex h-5 w-5 items-center justify-center">
              {isOpen ? (
                <>
                <span className="absolute h-[1px] w-4 bg-white/80 rotate-45 rounded-full" />
                <span className="absolute h-[1px] w-4 bg-white/80 -rotate-45 rounded-full" />
                </>
              ) : (
                <>
                <span className="absolute h-[1px] w-4 bg-white/80 -translate-y-2 rounded-full" />
                <span className="absolute h-[1px] w-4 bg-white/80 rounded-full" />
                <span className="absolute h-[1px] w-4 bg-white/80 translate-y-2 rounded-full" />
                </>
              )}
            </span>
          </button>
      </div>
    </nav>
  );
}
