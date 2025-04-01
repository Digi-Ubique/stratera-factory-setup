"use client"

import { ThemeToggle } from "./theme-toggle"

export function Toolbar() {
  return (
    <div className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-end h-14">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

