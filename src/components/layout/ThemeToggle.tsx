import { useTheme } from '@/app/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/40">
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded-md transition-all duration-200 ${
          theme === 'light' 
            ? 'bg-background dark:bg-zinc-800 text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setTheme('light')}
        title="Light Mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded-md transition-all duration-200 ${
          theme === 'dark' 
            ? 'bg-background dark:bg-zinc-800 text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setTheme('dark')}
        title="Dark Mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded-md transition-all duration-200 ${
          theme === 'system' 
            ? 'bg-background dark:bg-zinc-800 text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setTheme('system')}
        title="System Preference"
      >
        <Monitor className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
