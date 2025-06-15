
"use client"

import { cn } from "@/lib/utils";

interface TimerCircleProps {
  timeRemaining: number; // in seconds
  duration: number; // in seconds
  isPaused: boolean;
  className?: string;
}

export default function TimerCircle({ timeRemaining, duration, isPaused, className }: TimerCircleProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * circumference : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("relative w-64 h-64 rounded-full shadow-2xl flex items-center justify-center bg-primary/10 dark:bg-primary/20", className)}>
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="12"
          className="text-primary/20 dark:text-primary/30"
          fill="transparent"
          stroke="currentColor"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="12"
          className="text-primary transition-all duration-500 ease-linear"
          fill="transparent"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="z-10 text-center">
        <div className="text-5xl font-bold font-mono text-primary-foreground tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        {isPaused && timeRemaining > 0 && timeRemaining < duration && (
          <div className="text-sm text-primary-foreground/80 mt-1">Paused</div>
        )}
      </div>
    </div>
  );
}

