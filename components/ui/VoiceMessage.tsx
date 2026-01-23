'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn, formatTime } from '@/lib/utils';

interface VoiceMessageProps {
  src: string;
  name: string;
  duration: number;
  className?: string;
}

const SPEED_OPTIONS = [1, 1.5, 2] as const;
type SpeedOption = typeof SPEED_OPTIONS[number];

export default function VoiceMessage({ src, name, duration, className }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState<SpeedOption>(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const heights = Array.from({ length: 30 }, () => Math.random() * 0.7 + 0.3);
    setWaveformHeights(heights);
  }, []);

  // Update playback speed when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => console.log('Audio playback failed'));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackSpeed(SPEED_OPTIONS[nextIndex]);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl',
        'bg-background-card border border-border',
        className
      )}
    >
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} preload="metadata" />

      {/* Play/Pause Button */}
      <button onClick={togglePlay} className="play-button flex-shrink-0" aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}>
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
        ) : (
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>

      {/* Waveform & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text-primary truncate">{name}</p>
          {/* Speed button - like Telegram */}
          <button
            onClick={cycleSpeed}
            className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors flex-shrink-0',
              playbackSpeed === 1
                ? 'bg-background-elevated text-text-secondary'
                : 'bg-accent/20 text-accent'
            )}
            aria-label={`Скорость ${playbackSpeed}x`}
          >
            {playbackSpeed}x
          </button>
        </div>

        <div className="voice-waveform relative">
          {waveformHeights.map((height, i) => {
            const barProgress = (i / waveformHeights.length) * 100;
            const isActive = barProgress <= progress;

            return (
              <motion.div
                key={i}
                className="voice-waveform-bar"
                style={{
                  height: `${height * 100}%`,
                  backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  opacity: isActive ? 1 : 0.4,
                }}
                animate={isPlaying && isActive ? { scaleY: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0, delay: i * 0.02 }}
              />
            );
          })}
        </div>

        <div className="flex justify-between mt-1.5 text-xs text-text-secondary">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
