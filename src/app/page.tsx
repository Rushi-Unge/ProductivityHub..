
import AuthForm from "@/components/auth-form";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { ListChecks, LineChart, StickyNote } from "lucide-react";

const features = [
  {
    icon: <ListChecks className="h-7 w-7 text-primary" />,
    title: "Task Management",
    description: "Organize and prioritize your daily tasks effectively.",
  },
  {
    icon: <StickyNote className="h-7 w-7 text-primary" />,
    title: "Advanced Notes",
    description: "Capture ideas, journals, and rich markdown content.",
  },
  {
    icon: <LineChart className="h-7 w-7 text-primary" />,
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
      
      {/* Grid container for two-column layout */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left Column: Welcome Text & Auth Form */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10 py-8 lg:py-0">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-headline mb-4">
            Welcome to ProHub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 lg:mb-10 max-w-lg mx-auto lg:mx-0">
            Your all-in-one suite for enhanced productivity and focused work. Streamline your tasks, notes, and trades with intelligent tools.
          </p>
          <AuthForm />
        </div>

        {/* Right Column: "Why ProHub?" Features - Hidden on small screens */}
        <div className="hidden lg:flex flex-col items-center justify-center z-10">
          <div className="bg-card/70 dark:bg-card/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-border/30 dark:border-border/50">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-headline">
              Why ProHub?
            </h2>
            <ul className="space-y-5">
              {features.map((feature) => (
                <li 
                  key={feature.title} 
                  className="flex items-start gap-4 p-4 bg-background/50 dark:bg-muted/20 rounded-xl hover:bg-background/70 dark:hover:bg-muted/30 transition-colors duration-200 shadow-sm"
                >
                  <div className="flex-shrink-0 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Decorative Blobs - Kept subtle */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 filter blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/5 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 filter blur-3xl pointer-events-none" aria-hidden="true"></div>
    </main>
  );
}
