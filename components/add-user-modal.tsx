'use client'

import { useState } from "react"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface AddUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
}

export default function AddUserModal({ isOpen, onOpenChange, serverId }: AddUserModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]}`,
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invitation sent successfully.",
        })
        setEmail("")
        onOpenChange(false)
      } else {
        let errorMessage = "Failed to send invitation.";
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent onEscapeKeyDown={() => onOpenChange(false)} onPointerDownOutside={() => onOpenChange(false)}>
      <DialogHeader>
        <DialogTitle>Invite User to Server</DialogTitle>
        <DialogDescription>
          Enter the email address of the user you want to invite to this server.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-3"
            placeholder="user@example.com"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleInvite} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
} 