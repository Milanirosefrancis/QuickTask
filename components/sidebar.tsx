"use client"
import Link from "next/link"
import { useRouter } from "next/navigation" // Added for redirection
import { createClient } from "@/lib/supabase" // Added to talk to Supabase
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon, LogOut, CheckSquare, ListTodo, Share2 } from "lucide-react"

export function Sidebar() {
  const { setTheme, theme } = useTheme()
  const router = useRouter() // Initialize the router
  const supabase = createClient() // Initialize Supabase client

  // New function to handle secure logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut() // Tells server to end session
    
    if (!error) {
      router.push("/login") // Sends user back to login page
      router.refresh() // Cleans the internal cache
    } else {
      console.error("Logout failed:", error.message)
    }
  }

  return (
    <div className="hidden md:flex w-64 border-r bg-card p-6 flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <CheckSquare className="text-primary h-6 w-6" />
          <span>QuickTask</span>
        </div>
        
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <ListTodo size={18} /> My Tasks
            </Button>
          </Link>

          <Link href="/dashboard/shared">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Share2 size={18} /> Shared with Me
            </Button>
          </Link>
        </nav>
      </div>

      <div className="space-y-4 border-t pt-4">
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

        {/* UPDATED: Added onClick listener */}
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </div>
  )
}