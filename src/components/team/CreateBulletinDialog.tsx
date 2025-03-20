
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Tag } from "lucide-react";
import { TeamBulletin } from "@/types/team";
import { RichTextEditor } from "./RichTextEditor";
import { MentionSelector } from "./MentionSelector";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface CreateBulletinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    title: string; 
    content: string; 
    pinned?: boolean;
    category?: string;
    mentioned_users?: string[];
  }) => void;
  isLoading: boolean;
  initialData?: TeamBulletin;
  teamId?: string;
}

// Predefined categories for bulletins
const BULLETIN_CATEGORIES = [
  "Announcement",
  "Update",
  "Question",
  "Discussion",
  "Important",
  "FYI",
  "Action Required"
];

export function CreateBulletinDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  initialData,
  teamId
}: CreateBulletinDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  
  const { members } = useTeamMembers(teamId);
  
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
      setCategory(initialData.category || undefined);
      setMentionedUsers(initialData.mentioned_users || []);
    } else {
      setTitle("");
      setContent("");
      setPinned(false);
      setCategory(undefined);
      setMentionedUsers([]);
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    onSubmit({ 
      title, 
      content, 
      pinned, 
      category,
      mentioned_users: mentionedUsers
    });
    
    if (!isEditMode) {
      setTitle("");
      setContent("");
      setPinned(false);
      setCategory(undefined);
      setMentionedUsers([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bulletin-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="bulletin-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BULLETIN_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          {cat}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mention-members">Mention Team Members</Label>
                <MentionSelector 
                  teamMembers={members || []}
                  selectedMembers={mentionedUsers}
                  onChange={setMentionedUsers}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bulletin-content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                id="bulletin-content"
                placeholder="Enter bulletin content"
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
