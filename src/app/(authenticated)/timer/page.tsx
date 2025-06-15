
"use client"

import { useState, useEffect, useCallback } from 'react';
import TimerCircle from '@/components/timer-circle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, Briefcase, Settings2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PRESETS = {
  pomodoro: { duration: 25 * 60, label: "Focus", icon: <Briefcase /> },
  shortBreak: { duration: 5 * 60, label: "Short Break", icon: <Coffee /> },
  longBreak: { duration: 15 * 60, label: "Long Break", icon: <Coffee /> },
};

type TimerModeKey = keyof typeof PRESETS;

const mockTasks = [
  { id: "1", title: "Draft initial proposal", progress: 30 },
  { id: "2", title: "Client follow-up calls", progress: 75 },
  { id: "3", title: "Update project documentation", progress: 10 },
];

export default function TimerPage() {
  const [mode, setMode] = useState<TimerModeKey>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(PRESETS[mode].duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true); 
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudio(new Audio('/sounds/timer-finish.mp3')); 
    }
  }, []);

  const handleTimerEnd = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
    audio?.play().catch(e => console.warn("Audio play failed:", e));

    toast({
      title: `${PRESETS[mode].label} session complete!`,
      description: mode === 'pomodoro'
        ? `Time for a ${pomodorosCompleted % 4 === 3 ? PRESETS.longBreak.label.toLowerCase() : PRESETS.shortBreak.label.toLowerCase()}.`
        : "Time to get back to work!",
    });

    if (mode === 'pomodoro') {
      setPomodorosCompleted(prev => prev + 1);
      if ((pomodorosCompleted + 1) % 4 === 0) {
        selectMode('longBreak');
      } else {
        selectMode('shortBreak');
      }
    } else {
      selectMode('pomodoro');
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
    setTimeRemaining(PRESETS[mode].duration);
  };

  const selectMode = (newMode: TimerModeKey) => {
    setMode(newMode);
    setTimeRemaining(PRESETS[newMode].duration);
    setIsActive(false);
    setIsPaused(true);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 md:p-6">
      <Card className="w-full max-w-md bg-card shadow-xl rounded-xl">
          <CardHeader className="text-center pb-4 pt-6">
            <CardTitle className="text-2xl md:text-3xl font-bold font-headline text-foreground">
              {PRESETS[mode].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <TimerCircle 
              timeRemaining={timeRemaining} 
              duration={PRESETS[mode].duration} 
              isPaused={isPaused}
              circleColor="text-primary/20"
              progressColor="text-primary"
              textColor="text-foreground"
            />
            
            <div className="flex space-x-3">
              {!isActive || isPaused ? (
                <Button size="lg" onClick={startTimer} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg shadow-md transition-transform hover:scale-105">
                  <Play className="mr-2 h-5 w-5" /> Start
                </Button>
              ) : (
                <Button size="lg" onClick={pauseTimer} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-3 text-lg shadow-md transition-transform hover:scale-105">
                  <Pause className="mr-2 h-5 w-5" /> Pause
                </Button>
              )}
              <Button size="lg" onClick={resetTimer} variant="outline" className="text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 px-8 py-3 text-lg shadow-md transition-transform hover:scale-105">
                <RotateCcw className="mr-2 h-5 w-5" /> Reset
              </Button>
            </div>

            <Tabs defaultValue={mode} onValueChange={(value) => selectMode(value as TimerModeKey)} className="w-full pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 dark:bg-muted/20">
                {(Object.keys(PRESETS) as TimerModeKey[]).map((key) => (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                       {React.cloneElement(PRESETS[key].icon, {className: "h-4 w-4"})}
                       {PRESETS[key].label}
                    </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
             <p className="text-sm text-muted-foreground pt-2">Pomodoros completed: {pomodorosCompleted}</p>
          </CardContent>
        </Card>

      <Card className="w-full max-w-md shadow-lg bg-card rounded-xl">
        <CardHeader>
          <CardTitle className="text-card-foreground">Focus Task</CardTitle>
          <CardDescription className="text-muted-foreground">Link a task to this focus session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTasks.length > 0 ? mockTasks.slice(0,1).map(task => ( // Show only one task for focus
            <div key={task.id} className="p-3 bg-muted/50 dark:bg-muted/20 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-card-foreground">{task.title}</span>
                <span className="text-xs text-muted-foreground">{task.progress}%</span>
              </div>
              <Progress value={task.progress} aria-label={`${task.title} progress`} className="h-2"/>
            </div>
          )) : <p className="text-muted-foreground text-center py-4">No task currently linked.</p>}
           <Button variant="outline" className="w-full mt-4">Link Task</Button>
        </CardContent>
      </Card>
    </div>
  );
}
