'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // Start with system preference
      enableSystem={true} // Allow system detection
      disableTransitionOnChange // Prevent flash
    >
      {children}
    </NextThemesProvider>
  );
}
