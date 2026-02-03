"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon, LogOut, CheckSquare, ListTodo, Share2 } from "lucide-react"

export function Sidebar() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="w-64 border-r bg-card p-6 flex flex-col justify-between h-screen">
      <div>
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <CheckSquare className="text-primary h-6 w-6" />
          <span>QuickTask</span>
        </div>
        
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <ListTodo size={18} /> My Tasks
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Share2 size={18} /> Shared with Me
          </Button>
        </nav>
      </div>

      <div className="space-y-4 border-t pt-4">
        {/* Dark/Light Mode Toggle [Requirement 10] */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium">Theme</span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>

        <Button variant="destructive" className="w-full justify-start gap-2">
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </div>
  )
}