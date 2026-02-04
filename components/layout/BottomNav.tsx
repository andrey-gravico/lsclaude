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
  }, []);

  return (
    <nav className="fixed right-0 top-1/2 -translate-y-1/2 z-40 right-nav safe-right">
      <div className="px-2 py-2">
        <div className="flex flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const itemRipples = ripples.filter((r) => r.itemId === item.id);

            return (
              <button
                key={item.id}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center min-w-[50px] py-2 px-1 rounded-xl transition-colors ripple-container',
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

                <span className={cn('text-[10px] mt-1 transition-colors', isActive ? 'font-medium' : '')}>
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
    </nav>
  );
}
