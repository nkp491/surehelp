
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { TeamBulletin } from "@/types/team";

interface CreateBulletinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; content: string; pinned?: boolean }) => void;
  isLoading: boolean;
  initialData?: TeamBulletin;
}

export function CreateBulletinDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  initialData
}: CreateBulletinDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  
  const isEditMode = !!initialData;
  const dialogTitle = isEditMode ? "Edit Bulletin" : "Create Bulletin";
  const dialogDescription = isEditMode
    ? "Update your team bulletin."
    : "Post a new bulletin to your team.";
  const buttonText = isEditMode ? "Update" : "Post";

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setPinned(initialData.pinned);
    } else {
      setTitle("");
      setContent("");
      setPinned(false);
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    onSubmit({ title, content, pinned });
    
    if (!isEditMode) {
      setTitle("");
      setContent("");
      setPinned(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulletin-title">Title</Label>
              <Input
                id="bulletin-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter bulletin title"
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulletin-content">Content</Label>
              <Textarea
                id="bulletin-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter bulletin content"
                required
                className="min-h-[150px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="pin-bulletin"
                checked={pinned}
                onCheckedChange={setPinned}
              />
              <Label htmlFor="pin-bulletin">
                Pin to top of bulletin board
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !content.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Posting..."}
                </>
              ) : (
                buttonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
