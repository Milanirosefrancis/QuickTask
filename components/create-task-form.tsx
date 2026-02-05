"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Clock } from "lucide-react"

export function CreateTaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [dueDate, setDueDate] = useState("")
  
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // 1. Get the current logged-in user from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Safety Check: If no user is logged in, stop the process
    if (!user) {
      alert("Please login to add tasks!")
      return
    }

    // 3. Insert the task with the user's unique ID
    const { error } = await supabase.from('tasks').insert([
      { 
        title, 
        user_id: user.id, // Attaching the owner ID
        priority: priority,
        // Converting the local time to ISO format for the TIMESTAMPTZ column
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      }
    ])

    if (!error) {
      // 4. Reset the form fields after successful creation
      setTitle("")
      setPriority("Medium")
      setDueDate("") 
      onTaskCreated() 
    } else {
      console.error("Error creating task:", error.message)
    }
  }

  return (
    <form onSubmit={handleCreate} className="mb-8 flex flex-wrap gap-2 items-center">
      <Input 
        placeholder="What needs to be done?" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 min-w-[200px]"
      />

      <div className="flex items-center gap-2 border rounded-md px-2 bg-background">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <input 
          type="datetime-local" 
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-transparent p-2 text-sm outline-none cursor-pointer"
        />
      </div>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit">
        <Plus className="mr-2 h-4 w-4" /> Add
      </Button>
    </form>
  )
}