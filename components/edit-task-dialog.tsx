"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"

interface EditTaskProps {
  task: any
  onUpdate: () => void
}

export function EditTaskDialog({ task, onUpdate }: EditTaskProps) {
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(task.title)

  const handleSubmit = async () => {
    const { createClient } = await import("../lib/supabase") // Dynamic import to be safe
    const supabase = createClient()
    await supabase
      .from('tasks')
      .update({ title: newTitle })
      .eq('id', task.id)
    onUpdate()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}