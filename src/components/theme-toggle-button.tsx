
"use client"
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch
    return <Button variant="ghost" size="icon" className="h-9 w-9 cursor-default bg-transparent hover:bg-transparent text-transparent" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme} 
        aria-label="Toggle theme"
        className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-white/50 focus-visible:ring-offset-0"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
    </Button>
  );
}
