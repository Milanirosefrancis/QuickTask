"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { CreateTaskForm } from "@/components/create-task-form"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { ShareTaskDialog } from "@/components/share-task-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

export default function DashboardPage() {
    const [tasks, setTasks] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("") // New: For searching
    const [filterPriority, setFilterPriority] = useState("All") // New: For filtering
    const supabase = createClient()

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index', { ascending: true }) // Sorts by your drag position
    if (data) setTasks(data)
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTasks(items) // UI moves instantly

    // Update the position in the database
    await supabase
      .from('tasks')
      .update({ order_index: result.destination.index })
      .eq('id', reorderedItem.id)
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
  // This logic decides which tasks actually show up on the screen
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">QuickTask Professional</h1>
      </div>

      <CreateTaskForm onTaskCreated={fetchTasks} />

      {/* NEW SECTION: Search and Filter UI */}
      <div className="flex flex-col md:flex-row gap-4 my-6">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Search by task title..."
            className="w-full p-2 border rounded-md bg-background pl-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="p-2 border rounded-md bg-background border-input min-w-[150px]"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* UPDATED: We now map through filteredTasks */}
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
                            <span className={task.is_completed ? "line-through text-muted-foreground" : ""}>
                              {task.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{task.priority}</Badge>
                            <ShareTaskDialog task={task} />
                            <EditTaskDialog task={task} onUpdate={fetchTasks} />
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