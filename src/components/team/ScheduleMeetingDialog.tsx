
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { useOneOnOneMeetings } from "@/hooks/team/useOneOnOneMeetings";
import { format, addHours } from "date-fns";
import { CalendarPlus } from "lucide-react";

type ScheduleMeetingDialogProps = {
  teamId: string;
  trigger?: React.ReactNode;
};

export function ScheduleMeetingDialog({ teamId, trigger }: ScheduleMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [attendeeId, setAttendeeId] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(new Date());
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [location, setLocation] = useState("");
  
  const { members } = useTeamMembers(teamId);
  const { createMeeting, isLoading } = useOneOnOneMeetings(teamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduledDate) {
      return;
    }
    
    // Parse the date and time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    await createMeeting.mutateAsync({
      teamId,
      attendeeId,
      title,
      scheduledAt: scheduledDateTime.toISOString(),
      durationMinutes: parseInt(duration, 10),
      location: location || undefined
    });
    
    // Reset form and close dialog
    setTitle("");
    setAttendeeId("");
    setScheduledDate(new Date());
    setScheduledTime("09:00");
    setDuration("30");
    setLocation("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule One-on-One Meeting</DialogTitle>
            <DialogDescription>
              Create a new one-on-one meeting with a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="1:1 Weekly Sync"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="attendee">Team Member</Label>
              <Select 
                value={attendeeId} 
                onValueChange={setAttendeeId}
                required
              >
                <SelectTrigger id="attendee">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {members?.map(member => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  minDate={new Date()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select 
                value={duration} 
                onValueChange={setDuration}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Zoom, Google Meet, Office Room..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
