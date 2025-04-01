import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DesktopLayout } from "@/components/layout/desktop-layout"
import { Toolbar } from "@/components/toolbar"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Factory Setup",
  description: "Factory Setup Screen - Stratera Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen overflow-auto ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Toolbar />
            <DesktopLayout>
              <main className="flex-1 w-full">{children}</main>
            </DesktopLayout>
            <Footer className="mt-auto" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'