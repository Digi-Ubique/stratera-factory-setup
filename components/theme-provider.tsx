"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Initialize theme from localStorage on client-side
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      // Check for system preference if no saved theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
      localStorage.setItem("theme", prefersDark ? "dark" : "light")
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

