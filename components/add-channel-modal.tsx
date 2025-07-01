'use client'

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation';

interface AddChannelModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChannelAdded: () => void;
  serverId: string;
  channelType: "text" | "voice" | null;
}

export default function AddChannelModal({ isOpen, onOpenChange, onChannelAdded, serverId, channelType }: AddChannelModalProps) {
  const [channelName, setChannelName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      toast({
        title: "Error",
        description: "Channel name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/servers/${serverId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: channelName, type: channelType }),
      });

      if (response.ok) {
        toast({
          title: "Channel Added!",
          description: `'${channelName}' ${channelType} channel has been successfully added.`, 
        });
        setChannelName("");
        onChannelAdded();
        onOpenChange(false); 
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || `Failed to add ${channelType} channel.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error adding ${channelType} channel:`, error);
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
          <DialogTitle>Add New {channelType ? channelType.charAt(0).toUpperCase() + channelType.slice(1) : ''} Channel</DialogTitle>
          <DialogDescription>
            Give your new {channelType} channel a name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channelName" className="text-right">
              Channel Name
            </Label>
            <Input
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
            ) : (
              `Add ${channelType ? channelType.charAt(0).toUpperCase() + channelType.slice(1) : ''} Channel`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 