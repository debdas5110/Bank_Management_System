
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeSwitcher = () => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-inherit hover:bg-royal-blue/20 hover:text-gold-accent transition-all duration-300">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-pure-white dark:bg-midnight-blue border border-platinum-grey dark:border-royal-blue/30 rounded-xl shadow-xl">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="hover:bg-soft-mint/30 dark:hover:bg-royal-blue/30 text-midnight-blue dark:text-pure-white transition-all duration-300"
        >
          <Sun className="h-4 w-4 mr-2 text-gold-accent" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="hover:bg-soft-mint/30 dark:hover:bg-royal-blue/30 text-midnight-blue dark:text-pure-white transition-all duration-300"
        >
          <Moon className="h-4 w-4 mr-2 text-sky-blue" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="hover:bg-soft-mint/30 dark:hover:bg-royal-blue/30 text-midnight-blue dark:text-pure-white transition-all duration-300"
        >
          <Monitor className="h-4 w-4 mr-2 text-royal-blue" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
