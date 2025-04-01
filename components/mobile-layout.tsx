"\"use client"

import type React from "react"
import { Toolbar } from "@/components/toolbar"
import { Footer } from "@/components/footer"

interface MobileLayoutProps {
  children: React.ReactNode
  hideHeader?: boolean
}

export function MobileLayout({ children, hideHeader }: MobileLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <Toolbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
\
"

