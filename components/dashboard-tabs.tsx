"use client"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function DashboardTabs() {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="relative w-[280px]">
        <Input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 w-full rounded-full border-[#7B7B7B] dark:border-[#7B7B7B] text-[#7B7B7B] focus:border-[#7B7B7B] focus:ring-1 focus:ring-[#7B7B7B] focus:ring-opacity-100 dark:focus:ring-opacity-100 text-sm bg-white dark:bg-gray-800 selection:bg-[#7B7B7B] selection:text-white [&::placeholder]:text-[#7B7B7B] [&::placeholder]:!important outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#7B7B7B] focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7B7B7B] h-5 w-5" />
      </div>
    </div>
  )
}

