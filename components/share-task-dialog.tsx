"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { sendShareEmail } from "@/app/actions/send-email" // Import our email action
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Share2, Loader2 } from "lucide-react"

export function ShareTaskDialog({ task }: { task: any }) {
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  const handleShare = async () => {
    if (!email) return
    setIsSending(true)

    const currentShared = task.shared_with || []
    
    // 1. Update the database list of collaborators
    const { error } = await supabase
      .from('tasks')
      .update({ shared_with: [...currentShared, email] })
      .eq('id', task.id)

    if (!error) {
      // 2. Trigger the real email via Resend
      await sendShareEmail(email, task.title)
      
      alert(`Task shared successfully with ${email}`)
      setEmail("")
    } else {
      alert("Error sharing task. Please try again.")
    }
    
    setIsSending(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Share Task">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Collaborator</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleShare} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share Access"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}