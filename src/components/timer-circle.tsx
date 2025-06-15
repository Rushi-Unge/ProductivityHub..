
"use client"

import { cn } from "@/lib/utils";

interface TimerCircleProps {
  timeRemaining: number; // in seconds
  duration: number; // in seconds
  isPaused: boolean;
  className?: string;
  circleColor?: string; 
  progressColor?: string;
  textColor?: string; 
}

export default function TimerCircle({ 
  timeRemaining, 
  duration, 
  isPaused, 
  className,
  circleColor = "text-primary/30", 
  progressColor = "text-primary",
  textColor = "text-foreground" 
}: TimerCircleProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * circumference : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center",
      className 
    )}>
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="10" 
          className={cn("transition-colors duration-300", circleColor)}
          fill="transparent"
          stroke="currentColor"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="10" 
          className={cn("transition-all duration-500 ease-linear", progressColor)}
          fill="transparent"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className={cn("z-10 text-center", textColor)}>
        <div className="text-5xl sm:text-6xl font-bold font-mono tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        {isPaused && timeRemaining > 0 && timeRemaining < duration && (
          <div className="text-sm opacity-80 mt-1">Paused</div>
        )}
      </div>
    </div>
  );
}
