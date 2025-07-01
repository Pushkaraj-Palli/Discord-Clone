'use client'

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface AddServerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded: () => void;
}

export default function AddServerModal({ isOpen, onOpenChange, onServerAdded }: AddServerModalProps) {
  const [serverName, setServerName] = useState("");
  const [serverIcon, setServerIcon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: serverName, icon: serverIcon || null }),
      });

      if (response.ok) {
        toast({
          title: "Server Created!",
          description: `'${serverName}' has been successfully created.`, 
        });
        setServerName("");
        setServerIcon("");
        onServerAdded();
        onOpenChange(false); 
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating server:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Your Server</DialogTitle>
          <DialogDescription>
            Give your new server a name and an optional icon. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Server Name
            </Label>
            <Input
              id="name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              Server Icon (URL)
            </Label>
            <Input
              id="icon"
              value={serverIcon}
              onChange={(e) => setServerIcon(e.target.value)}
              className="col-span-3"
              placeholder="Optional: Image URL"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              "Create Server"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 