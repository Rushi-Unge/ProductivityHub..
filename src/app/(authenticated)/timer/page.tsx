
"use client"

import { useState, useEffect, useCallback } from 'react';
import TimerCircle from '@/components/timer-circle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";

const PRESETS = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

type TimerMode = keyof typeof PRESETS;

const mockTasks = [
  { id: "1", title: "Draft initial proposal", progress: 30 },
  { id: "2", title: "Client follow-up calls", progress: 75 },
  { id: "3", title: "Update project documentation", progress: 10 },
];

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(PRESETS[mode]);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Start in paused state
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ensure Audio is only accessed on the client
    if (typeof window !== 'undefined') {
      setAudio(new Audio('/sounds/timer-finish.mp3')); // Placeholder sound
    }
  }, []);

  const handleTimerEnd = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
    audio?.play().catch(e => console.warn("Audio play failed:", e));

    toast({
      title: `${mode === 'pomodoro' ? 'Work' : 'Break'} session complete!`,
      description: mode === 'pomodoro'
        ? `Time for a ${pomodorosCompleted % 4 === 3 ? 'long' : 'short'} break.`
        : "Time to get back to work!",
    });

    if (mode === 'pomodoro') {
      setPomodorosCompleted(prev => prev + 1);
      if ((pomodorosCompleted + 1) % 4 === 0) {
        setMode('longBreak');
        setTimeRemaining(PRESETS.longBreak);
      } else {
        setMode('shortBreak');
        setTimeRemaining(PRESETS.shortBreak);
      }
    } else {
      setMode('pomodoro');
      setTimeRemaining(PRESETS.pomodoro);
    }
  }, [mode, pomodorosCompleted, audio, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            if (interval) clearInterval(interval);
            handleTimerEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, handleTimerEnd]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(true);
    setTimeRemaining(PRESETS[mode]);
  };

  const selectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeRemaining(PRESETS[newMode]);
    setIsActive(false);
    setIsPaused(true);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 md:p-8">
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <Card className="w-full bg-gradient-to-br from-primary/70 to-accent/70 dark:from-primary/50 dark:to-accent/50 shadow-xl p-6 md:p-10 text-primary-foreground">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl md:text-4xl font-bold font-headline">
              {mode === 'pomodoro' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8">
            <TimerCircle timeRemaining={timeRemaining} duration={PRESETS[mode]} isPaused={isPaused} className="bg-background/30 text-primary-foreground shadow-inner" />
            
            <div className="flex space-x-2 md:space-x-4">
              {!isActive || isPaused ? (
                <Button size="lg" onClick={startTimer} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg shadow-md">
                  <Play className="mr-2 h-5 w-5" /> Start
                </Button>
              ) : (
                <Button size="lg" onClick={pauseTimer} variant="outline" className="bg-background/80 hover:bg-background text-foreground px-6 py-3 text-lg shadow-md">
                  <Pause className="mr-2 h-5 w-5" /> Pause
                </Button>
              )}
              <Button size="lg" onClick={resetTimer} variant="outline" className="bg-background/80 hover:bg-background text-foreground px-6 py-3 text-lg shadow-md">
                <RotateCcw className="mr-2 h-5 w-5" /> Reset
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 pt-4">
              <Button variant={mode === 'pomodoro' ? 'default' : 'outline'} onClick={() => selectMode('pomodoro')} className="shadow-sm text-sm">
                <Briefcase className="mr-2 h-4 w-4" /> Focus (25 min)
              </Button>
              <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => selectMode('shortBreak')} className="shadow-sm text-sm">
                <Coffee className="mr-2 h-4 w-4" /> Short Break (5 min)
              </Button>
              <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => selectMode('longBreak')} className="shadow-sm text-sm">
                <Coffee className="mr-2 h-4 w-4" /> Long Break (15 min)
              </Button>
            </div>
             <p className="text-sm text-primary-foreground/90 pt-2">Pomodoros completed: {pomodorosCompleted}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Associated Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTasks.length > 0 ? mockTasks.map(task => (
            <div key={task.id} className="p-3 bg-muted/50 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{task.title}</span>
                <span className="text-xs text-muted-foreground">{task.progress}%</span>
              </div>
              <Progress value={task.progress} aria-label={`${task.title} progress`} className="h-2"/>
            </div>
          )) : <p className="text-muted-foreground text-center">No tasks associated with this timer session.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

