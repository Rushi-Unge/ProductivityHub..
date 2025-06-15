
import AuthForm from "@/components/auth-form";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { ListChecks, LineChart, Timer, Repeat, Brain, Zap } from "lucide-react";

const features = [
  {
    icon: <ListChecks className="h-7 w-7 text-green-400" />,
    title: "Task Manager",
    description: "Organize and prioritize your daily tasks",
  },
  {
    icon: <LineChart className="h-7 w-7 text-orange-400" />,
    title: "Trade Journal",
    description: "Track and analyze your trading performance",
  },
  {
    icon: <Timer className="h-7 w-7 text-purple-400" />,
    title: "Pomodoro Focus",
    description: "Time-blocked productivity sessions",
  },
  {
    icon: <Repeat className="h-7 w-7 text-teal-400" />,
    title: "Habit Tracker",
    description: "Build consistent daily routines",
  },
  {
    icon: <Brain className="h-7 w-7 text-yellow-400" />,
    title: "Brain Dump",
    description: "Capture ideas and clear your mind",
  },
];

export default function AuthenticationPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center auth-gradient p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggleButton />
      </div>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-6xl">
        {/* Left Column: Title and Form */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center gap-3 mb-3">
             <Zap className="h-10 w-10 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ProductivePro
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-semibold text-slate-200 mb-1">
            Discipline Drives Results
          </p>
          <p className="text-md md:text-lg text-slate-300 mb-8 lg:mb-10 max-w-md">
            Your hub for focus, habits, and smarter trading.
          </p>
          <AuthForm />
        </div>

        {/* Right Column: Why ProductivePro? */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="bg-slate-800/30 dark:bg-slate-900/40 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Why ProductivePro?
            </h2>
            <ul className="space-y-6">
              {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-4 p-4 bg-slate-700/20 dark:bg-slate-800/30 rounded-lg hover:bg-slate-700/30 dark:hover:bg-slate-800/40 transition-colors duration-200">
                  <div className="flex-shrink-0 p-2 bg-slate-600/30 dark:bg-slate-700/40 rounded-md">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
