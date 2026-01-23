'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { QUIZ_QUESTIONS, TELEGRAM_LINK, INSTAGRAM_LINK } from '@/lib/constants';
import { cn } from '@/lib/utils';

type QuizStep = 1 | 2 | 3;
type QuizResult = 'success' | 'online' | null;

export default function QuizSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<QuizStep>(1);
  const [answers, setAnswers] = useState({
    step1: '',
    step1Other: '',
    step2: [] as string[],
    step3: '',
  });
  const [result, setResult] = useState<QuizResult>(null);

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ step1: '', step1Other: '', step2: [], step3: '' });
    setResult(null);
  };

  const handleOpen = () => {
    resetQuiz();
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleStep1Select = (id: string) => setAnswers((prev) => ({ ...prev, step1: id }));
  const handleStep2Toggle = (id: string) => {
    setAnswers((prev) => ({
      ...prev,
      step2: prev.step2.includes(id) ? prev.step2.filter((item) => item !== id) : [...prev.step2, id],
    }));
  };
  const handleStep3Select = (id: string) => setAnswers((prev) => ({ ...prev, step3: id }));

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as QuizStep);
    } else {
      setResult(answers.step3 === 'online' ? 'online' : 'success');
      if (typeof window !== 'undefined' && (window as unknown as { ym?: (id: string, action: string, goal: string) => void }).ym) {
        (window as unknown as { ym: (id: string, action: string, goal: string) => void }).ym('XXXXXXXX', 'reachGoal', 'quiz_complete');
      }
    }
  };

  const canProceed = () => {
    if (step === 1) return answers.step1 !== '' && (answers.step1 !== 'other' || answers.step1Other.trim() !== '');
    if (step === 2) return answers.step2.length > 0;
    if (step === 3) return answers.step3 !== '';
    return false;
  };

  return (
    <section id="quiz" className="snap-section section-padding flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full text-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-elevated p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-text-primary">
            Мне подойдёт?
          </h2>
          <p className="text-text-secondary mt-2 mb-6">Пройдите короткий тест и узнайте</p>
          <Button size="lg" onClick={handleOpen} pulse>
            Пройти тест
          </Button>
        </motion.div>
      </div>

      {/* Quiz Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} fullScreen>
        <div className="p-5 min-h-[60vh] flex flex-col">
          {result === null ? (
            <>
              {/* Progress */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', s <= step ? 'bg-accent' : 'bg-border')} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary mb-1">{QUIZ_QUESTIONS.step1.title}</h3>
                    <p className="text-sm text-text-secondary mb-6">{QUIZ_QUESTIONS.step1.subtitle}</p>
                    <div className="space-y-3">
                      {QUIZ_QUESTIONS.step1.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleStep1Select(option.id)}
                          className={cn('w-full p-4 rounded-xl text-left transition-all border', answers.step1 === option.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50')}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0', answers.step1 === option.id ? 'border-accent bg-accent' : 'border-border')}>
                              {answers.step1 === option.id && <span className="w-2 h-2 rounded-full bg-background" />}
                            </span>
                            <span className="text-text-primary">{option.label}</span>
                          </span>
                          {option.hasInput && answers.step1 === option.id && (
                            <input
                              type="text"
                              placeholder="Напишите свой вариант"
                              value={answers.step1Other}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, step1Other: e.target.value }))}
                              className="mt-3 w-full p-3 rounded-lg border border-border bg-background-elevated focus:border-accent focus:outline-none text-text-primary"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary mb-1">{QUIZ_QUESTIONS.step2.title}</h3>
                    <p className="text-sm text-text-secondary mb-6">{QUIZ_QUESTIONS.step2.subtitle}</p>
                    <div className="space-y-3">
                      {QUIZ_QUESTIONS.step2.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleStep2Toggle(option.id)}
                          className={cn('w-full p-4 rounded-xl text-left transition-all border', answers.step2.includes(option.id) ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50')}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0', answers.step2.includes(option.id) ? 'border-accent bg-accent' : 'border-border')}>
                              {answers.step2.includes(option.id) && (
                                <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <span className="text-text-primary">{option.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary mb-1">{QUIZ_QUESTIONS.step3.title}</h3>
                    <p className="text-sm text-text-secondary mb-6">{QUIZ_QUESTIONS.step3.subtitle}</p>
                    <div className="space-y-3">
                      {QUIZ_QUESTIONS.step3.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleStep3Select(option.id)}
                          className={cn('w-full p-4 rounded-xl text-left transition-all border', answers.step3 === option.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50')}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0', answers.step3 === option.id ? 'border-accent bg-accent' : 'border-border')}>
                              {answers.step3 === option.id && <span className="w-2 h-2 rounded-full bg-background" />}
                            </span>
                            <span className="text-text-primary">{option.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 pt-4 border-t border-border">
                <Button fullWidth size="lg" onClick={handleNext} disabled={!canProceed()}>
                  {step < 3 ? 'Далее' : 'Узнать результат'}
                </Button>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
              {result === 'success' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Да, этот курс вам подходит!</h3>
                  <p className="text-text-secondary mb-4">За прохождение теста вы получаете скидку:</p>
                  <div className="text-4xl font-bold text-accent mb-8">1000 ₽</div>
                  <Button size="lg" fullWidth onClick={() => window.open(TELEGRAM_LINK, '_blank')}>
                    Записаться со скидкой
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">К сожалению, онлайн курс ещё в разработке!</h3>
                  <p className="text-text-secondary mb-8">В ближайшее время анонсирую у себя в соц. сетях.<br />Подписывайтесь, чтобы не пропустить!</p>
                  <Button size="lg" fullWidth onClick={() => window.open(INSTAGRAM_LINK, '_blank')}>
                    Связаться со мной
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </Modal>
    </section>
  );
}
