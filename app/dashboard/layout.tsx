"use client"

import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 1. Desktop Sidebar: Still visible on laptops (md and up) */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* 2. Mobile Header: ONLY visible on phones (hidden on md and up) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">QuickTask</span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              {/* We reuse the Sidebar component inside the mobile drawer */}
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}