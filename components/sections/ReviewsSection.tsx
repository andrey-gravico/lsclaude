'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import Modal from '@/components/ui/Modal';
import {
  TELEGRAM_LINK,
  TEXT_REVIEW_ITEMS,
  VIDEO_REVIEW_ITEMS,
  VOICE_REVIEW_ITEMS,
  type ReviewsFilter,
  type TextReviewItem,
  type VideoReviewItem,
  type VoiceReviewItem,
} from '@/lib/constants';
import { cn, formatTime } from '@/lib/utils';

const SPEED_OPTIONS = [1, 1.5, 2] as const;
type SpeedOption = typeof SPEED_OPTIONS[number];

function hashToSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function generateWaveformHeights(seedString: string, barsCount = 44) {
  let state = hashToSeed(seedString) || 1;
  const heights: number[] = [];

  for (let index = 0; index < barsCount; index += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const normalized = (state >>> 0) / 0xffffffff;
    heights.push(normalized * 0.65 + 0.25);
  }

  return heights;
}

function getStatusLine(isNew: boolean) {
  return isNew ? 'Новый отзыв' : 'Более 1 мес. назад';
}

export default function ReviewsSection() {
  const [activeFilter, setActiveFilter] = useState<ReviewsFilter>('voice');

  const [activeVoice, setActiveVoice] = useState<VoiceReviewItem | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceTime, setVoiceTime] = useState(0);
  const [voiceSpeed, setVoiceSpeed] = useState<SpeedOption>(1);

  const [selectedText, setSelectedText] = useState<TextReviewItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoReviewItem | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const counts = useMemo(
    () => ({
      voice: VOICE_REVIEW_ITEMS.length,
      text: TEXT_REVIEW_ITEMS.length,
      video: VIDEO_REVIEW_ITEMS.length,
    }),
    []
  );

  const stopVoice = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsVoicePlaying(false);
    setVoiceTime(0);
  }, []);

  const startVoice = useCallback(
    (item: VoiceReviewItem) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      audio.src = item.audioSrc;
      audio.currentTime = 0;
      audio.playbackRate = voiceSpeed;
      setVoiceTime(0);

      setActiveVoice(item);
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => setIsVoicePlaying(true))
          .catch(() => setIsVoicePlaying(false));
      } else {
        setIsVoicePlaying(true);
      }
    },
    [voiceSpeed]
  );

  const toggleVoice = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeVoice) return;

    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.then(() => setIsVoicePlaying(true)).catch(() => setIsVoicePlaying(false));
      } else {
        setIsVoicePlaying(true);
      }
    } else {
      audio.pause();
      setIsVoicePlaying(false);
    }
  }, [activeVoice]);

  const cycleSpeed = useCallback(() => {
    setVoiceSpeed((prev) => {
      const currentIndex = SPEED_OPTIONS.indexOf(prev);
      const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
      const next = SPEED_OPTIONS[nextIndex];
      const audio = audioRef.current;
      if (audio) audio.playbackRate = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setVoiceTime(audio.currentTime);
    const onEnded = () => setIsVoicePlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const handleFilterChange = (next: ReviewsFilter) => {
    setActiveFilter(next);
    if (next !== 'voice') {
      stopVoice();
      setActiveVoice(null);
    }
  };

  const openWriteMe = () => window.open(TELEGRAM_LINK, '_blank');

  const openVideo = (item: VideoReviewItem) => {
    setSelectedVideo(item);
    setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
      video.muted = false;
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    }, 0);
  };

  const closeVideo = () => {
    const video = videoRef.current;
    if (video) video.pause();
    setSelectedVideo(null);
    hasMoved.current = false;
    pointerStart.current = null;
  };

  const handleVideoPressStart = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    hasMoved.current = false;
  };

  const handleVideoPressMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const deltaX = Math.abs(event.clientX - pointerStart.current.x);
    const deltaY = event.clientY - pointerStart.current.y;
    if (deltaY > 60 && Math.abs(deltaY) > deltaX) {
      hasMoved.current = true;
      closeVideo();
    }
  };

  const handleVideoPressEnd = () => {
    if (!pointerStart.current) return;
    pointerStart.current = null;
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    } else {
      video.pause();
    }
  };

  const isVoiceTab = activeFilter === 'voice';
  const isTextTab = activeFilter === 'text';
  const isVideoTab = activeFilter === 'video';

  const activeWaveform = useMemo(() => generateWaveformHeights(activeVoice?.id ?? 'none'), [activeVoice?.id]);
  const voiceTotal = activeVoice?.duration ?? 0;
  const voiceProgress = voiceTotal > 0 ? Math.min(voiceTime / voiceTotal, 1) : 0;
  const remaining = Math.max(voiceTotal - voiceTime, 0);

  return (
    <section id="reviews" className="snap-section section-padding flex flex-col">
      <div className="max-w-lg mx-auto w-full pt-6 pb-24 flex flex-col flex-1">
        <div className="text-center text-sm font-semibold text-text-primary font-montserrat">
          Снимай. Монтируй. <span className="slow-shimmer font-bold">Удивляй.</span>
        </div>

        <div className="relative mt-5 flex items-center justify-center">
          <h2 className="text-3xl font-medium text-text-primary font-montserrat">Отзывы</h2>
          <button
            onClick={openWriteMe}
            className="absolute right-0 p-2 rounded-full hover:bg-background-elevated transition-colors"
            aria-label="Написать"
          >
            <Image src="/images/icons/writeme.png" alt="" width={26} height={26} unoptimized />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => handleFilterChange('voice')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 border transition-colors text-sm',
              isVoiceTab
                ? 'bg-background-elevated border-border text-text-primary'
                : 'bg-transparent border-border/70 text-text-secondary'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', isVoiceTab ? 'bg-accent' : 'bg-text-muted')} />
            <span className="lowercase">голосовые</span>
            <span className={cn('text-xs', isVoiceTab ? 'text-text-primary' : 'text-text-muted')}>{counts.voice}</span>
          </button>

          <button
            onClick={() => handleFilterChange('text')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 border transition-colors text-sm',
              isTextTab
                ? 'bg-background-elevated border-border text-text-primary'
                : 'bg-transparent border-border/70 text-text-secondary'
            )}
          >
            <span className="lowercase">текстовые</span>
            <span className={cn('text-xs', isTextTab ? 'text-text-primary' : 'text-text-muted')}>{counts.text}</span>
          </button>

          <button
            onClick={() => handleFilterChange('video')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 border transition-colors text-sm',
              isVideoTab
                ? 'bg-background-elevated border-border text-text-primary'
                : 'bg-transparent border-border/70 text-text-secondary'
            )}
          >
            <span className="lowercase">видео</span>
            <span className={cn('text-xs', isVideoTab ? 'text-text-primary' : 'text-text-muted')}>{counts.video}</span>
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {isVoiceTab && (
            <div className="divide-y divide-border/30">
              {VOICE_REVIEW_ITEMS.map((item) => {
                const isActive = activeVoice?.id === item.id;
                const showPause = isActive && isVoicePlaying;

                return (
                  <div key={item.id} className="py-3">
                    <button
                      onClick={() => {
                        if (!isActive) startVoice(item);
                        else toggleVoice();
                      }}
                      className="w-full flex items-center gap-3"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border flex-shrink-0">
                        <Image
                          src={item.avatarSrc}
                          alt=""
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        {!isActive ? (
                          <>
                            <div className="text-lg text-text-primary leading-tight truncate">{item.username}</div>
                            <div className={cn('text-sm', item.isNew ? 'text-text-primary' : 'text-text-muted')}>
                              {getStatusLine(item.isNew)}
                            </div>
                          </>
                        ) : (
                          <div className="w-full">
                            <div className="rounded-2xl px-3 py-2 bg-accent/25 border border-accent/35">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVoice();
                                  }}
                                  className="w-7 h-7 rounded-full bg-background/50 border border-border flex items-center justify-center flex-shrink-0"
                                  aria-label={showPause ? 'Пауза' : 'Воспроизвести'}
                                >
                                  <Image
                                    src={showPause ? '/images/icons/pause.png' : '/images/icons/play.png'}
                                    alt=""
                                    width={16}
                                    height={16}
                                    unoptimized
                                  />
                                </button>

                                <div className="flex-1 min-w-0 flex items-center gap-0.5 h-6">
                                  {activeWaveform.map((h, index) => {
                                    const barProgress = (index + 1) / activeWaveform.length;
                                    const isFilled = barProgress <= voiceProgress;
                                    return (
                                      <span
                                        key={index}
                                        className={cn('w-[2px] rounded-full', isFilled ? 'bg-accent' : 'bg-text-muted/50')}
                                        style={{ height: `${Math.round(h * 100)}%` }}
                                      />
                                    );
                                  })}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-text-primary">{formatTime(remaining)}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cycleSpeed();
                                    }}
                                    className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-background/50 border border-border text-text-primary"
                                    aria-label={`Скорость ${voiceSpeed}x`}
                                  >
                                    {voiceSpeed}x
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isActive) startVoice(item);
                          else toggleVoice();
                        }}
                        className="w-11 h-11 rounded-full border border-border flex items-center justify-center flex-shrink-0 bg-background/20"
                        aria-label={showPause ? 'Пауза' : 'Воспроизвести'}
                      >
                        <Image
                          src={showPause ? '/images/icons/pause.png' : '/images/icons/play.png'}
                          alt=""
                          width={18}
                          height={18}
                          unoptimized
                        />
                      </button>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {isTextTab && (
            <div className="divide-y divide-border/30">
              {TEXT_REVIEW_ITEMS.map((item) => (
                <button key={item.id} onClick={() => setSelectedText(item)} className="w-full flex items-center gap-3 py-3">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border flex-shrink-0">
                    <Image
                      src={item.avatarSrc}
                      alt=""
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-lg text-text-primary leading-tight truncate">{item.username}</div>
                    <div className={cn('text-sm truncate', item.isNew ? 'text-text-primary' : 'text-text-muted')}>{item.preview}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-border flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {isVideoTab && (
            <div className="divide-y divide-border/30">
              {VIDEO_REVIEW_ITEMS.map((item) => (
                <button key={item.id} onClick={() => openVideo(item)} className="w-full flex items-center gap-3 py-3">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border flex-shrink-0">
                    <Image
                      src={item.avatarSrc}
                      alt=""
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-lg text-text-primary leading-tight truncate">{item.username}</div>
                    <div className={cn('text-sm', item.isNew ? 'text-text-primary' : 'text-text-muted')}>{getStatusLine(item.isNew)}</div>
                  </div>
                  <div className="w-11 h-11 rounded-full border border-border flex items-center justify-center flex-shrink-0 bg-background/20">
                    <Image src="/images/icons/play.png" alt="" width={18} height={18} unoptimized />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <audio ref={audioRef} preload="metadata" />
      </div>

      <Modal
        isOpen={!!selectedText}
        onClose={() => setSelectedText(null)}
        title={selectedText ? `@${selectedText.username}` : undefined}
      >
        {selectedText && (
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
                <Image src={selectedText.avatarSrc} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
              </div>
              <div className="flex-1">
                <div className="inline-block max-w-full rounded-2xl bg-background-elevated border border-border px-4 py-3">
                  <p className="text-text-primary leading-relaxed text-sm whitespace-pre-line">{selectedText.text}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!selectedVideo} onClose={closeVideo} fullScreen showCloseButton={false}>
        {selectedVideo && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              src={selectedVideo.videoSrc}
              poster={selectedVideo.posterSrc}
              className="w-full h-full object-cover"
              playsInline
              preload="auto"
              controls={false}
            />

            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/70 via-black/25 to-transparent z-20 pointer-events-none" />

            <div className="absolute top-0 right-0 z-30 pt-2 safe-top px-3">
              <button
                onClick={closeVideo}
                className="w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm border border-white/15 flex items-center justify-center"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              className="absolute inset-0 z-10"
              onPointerDown={(event) => {
                event.preventDefault();
                handleVideoPressStart(event);
              }}
              onPointerMove={handleVideoPressMove}
              onPointerUp={handleVideoPressEnd}
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

