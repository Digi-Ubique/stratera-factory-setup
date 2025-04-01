"use client"

import type React from "react"

interface DesktopLayoutProps {
  children: React.ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 md:p-6">{children}</main>
    </div>
  )
}

