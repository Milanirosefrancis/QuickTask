"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { CreateTaskForm } from "@/components/create-task-form"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { ShareTaskDialog } from "@/components/share-task-dialog" // NEW IMPORT
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const supabase = createClient()

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
  }

  const toggleComplete = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentState })
      .eq('id', id)
    if (!error) fetchTasks()
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    if (!error) fetchTasks()
  }

  const updateTask = async (id: string, newTitle: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('tasks')
      .update({ title: newTitle })
      .eq('id', id)
    
    if (!error) {
      await supabase.from('audit_logs').insert([
        { task_id: id, action: 'Updated title', user_id: user?.id, details: { new_title: newTitle } }
      ])
      fetchTasks()
    }
  }

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel('realtime-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">My Professional Tasks</h1>
      <CreateTaskForm onTaskCreated={fetchTasks} />

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={task.is_completed} 
                  onCheckedChange={() => toggleComplete(task.id, task.is_completed)}
                />
                <span className={task.is_completed ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{task.priority}</Badge>
                
                {/* NEW: Share Button Logic */}
                <ShareTaskDialog task={task} />
                
                <EditTaskDialog task={task} onUpdate={updateTask} />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}