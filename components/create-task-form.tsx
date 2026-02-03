"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// We are adding Select components here
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function CreateTaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [title, setTitle] = useState("")
  // 1. Create a new state to store the priority (default is 'Medium')
  const [priority, setPriority] = useState("Medium")
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    
    // 2. Add 'priority' to the insert list below
    const { error } = await supabase.from('tasks').insert([
      { 
        title, 
        user_id: user?.id,
        priority: priority // This sends your choice to the database
      }
    ])

    if (!error) {
      setTitle("")
      setPriority("Medium") // Reset to Medium after adding
      onTaskCreated() 
    }
  }

  return (
    <form onSubmit={handleCreate} className="mb-8 flex gap-2 items-center">
      <Input 
        placeholder="What needs to be done?" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
      />

      {/* 3. Add the Dropdown Menu */}
      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit">
        <Plus className="mr-2 h-4 w-4" /> Add Task
      </Button>
    </form>
  )
}