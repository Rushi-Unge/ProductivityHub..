
import AuthForm from "@/components/auth-form";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { ListChecks, LineChart, StickyNote, Zap } from "lucide-react"; // Updated icons

const features = [
  {
    icon: <ListChecks className="h-7 w-7 text-primary" />, // Updated color
    title: "Task Management",
    description: "Organize and prioritize your daily tasks effectively.",
  },
  {
    icon: <StickyNote className="h-7 w-7 text-primary" />, // Updated icon and color
    title: "Advanced Notes",
    description: "Capture ideas, journals, and rich markdown content.",
  },
  {
    icon: <LineChart className="h-7 w-7 text-primary" />, // Updated color
    title: "Trade Journal",
    description: "Log, track, and analyze your trading performance.",
  },
];

export default function AuthenticationPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center auth-gradient p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggleButton />
      </div>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-6xl">
        {/* Left Column: Title and Form */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
           {/* App Logo and Name moved to AuthForm component */}
          <h1 className="text-4xl md:text-5xl font-bold text-white font-headline mb-2">
            Welcome to ProHub
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 lg:mb-10 max-w-md">
            Your all-in-one suite for enhanced productivity and focused work.
          </p>
          <AuthForm />
        </div>

        {/* Right Column: Why ProHub? */}
        <div className="hidden lg:flex flex-col items-center justify-center z-10">
          <div className="bg-card/10 dark:bg-card/20 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-8 text-center font-headline">
              Why ProHub?
            </h2>
            <ul className="space-y-5">
              {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-4 p-4 bg-white/5 dark:bg-white/5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm">
                  <div className="flex-shrink-0 p-3 bg-primary/20 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-200">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
       {/* Decorative shapes - optional */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 filter blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/20 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 filter blur-2xl"></div>
    </main>
  );
}
