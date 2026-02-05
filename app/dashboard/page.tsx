"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase"
import { CreateTaskForm } from "../../components/create-task-form"
import { EditTaskDialog } from "../../components/edit-task-dialog"
import { ShareTaskDialog } from "../../components/share-task-dialog"
import { ThemeToggle } from "../../components/theme-toggle" 
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical, Calendar, Clock } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("All")
  const supabase = createClient()

  const playAlert = () => {
    const audio = new Audio('/notification.mp3'); 
    audio.play().catch(e => console.log("Audio play blocked until user clicks page.")); 
  };

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });
  
    if (data) {
      setTasks(data);
      
      const now = new Date();
      const hasOverdue = data.some(task => 
        task.due_date && new Date(task.due_date) < now && !task.is_completed
      );
  
      if (hasOverdue) {
        playAlert(); 
      }
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus }) 
      .eq('id', id)
    
    if (!error) fetchTasks()
  }

  const deleteTask = async (id: string) => {
    console.log("Attempting to delete task with ID:", id);
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert("Database error: " + error.message);
    } else {
      fetchTasks() 
    }
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setTasks(items)
    await supabase.from('tasks').update({ order_index: result.destination.index }).eq('id', reorderedItem.id)
  }

  // UPDATED: Fixed typo and added Heartbeat Interval
  useEffect(() => {
    fetchTasks();

    // Check for overdue tasks every 60 seconds (Heartbeat)
    const interval = setInterval(() => {
      console.log("Heartbeat: Checking time for alerts...");
      fetchTasks();
    }, 60000); 

    const channel = supabase
      .channel('realtime-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => { fetchTasks() })
      .subscribe()

    // Cleanup: Stops the timer and the listener when you leave the page
    return () => { 
      supabase.removeChannel(channel);
      clearInterval(interval);
    }
  }, [])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">QuickTask Professional</h1>
        <ThemeToggle />
      </div>

      <CreateTaskForm onTaskCreated={fetchTasks} />

      <div className="flex flex-col md:flex-row gap-4 my-6">
        <input 
          type="text"
          placeholder="Search tasks..."
          className="w-full p-2 border rounded-md bg-background flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="p-2 border rounded-md bg-background min-w-[150px]"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="mb-4 px-2 text-sm font-medium text-muted-foreground">
        Showing <span className="text-foreground font-bold">{filteredTasks.length}</span> tasks
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4 mt-6">
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="text-muted-foreground h-5 w-5 cursor-grab" />
                            </div>
                            <Checkbox 
                              checked={task.is_completed}
                              onCheckedChange={() => toggleComplete(task.id, task.is_completed)} 
                            />
                            <div>
                              <p className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </p>
                              {task.due_date && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className={`text-xs ${
                                    new Date(task.due_date) <= new Date() && !task.is_completed
                                    ? "text-destructive font-bold animate-pulse" 
                                    : "text-muted-foreground"
                                  }`}>
                                    {new Date(task.due_date).toLocaleString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{task.priority}</Badge>
                            <ShareTaskDialog task={task} />
                            <EditTaskDialog task={task} onUpdate={fetchTasks} />
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); 
                                deleteTask(task.id);
                              }}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}