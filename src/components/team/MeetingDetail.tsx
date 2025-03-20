
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeetingNotes } from "@/hooks/team/useMeetingNotes";
import { useActionItems } from "@/hooks/team/useActionItems";
import { useMeetingFollowups } from "@/hooks/team/useMeetingFollowups";
import { OneOnOneMeeting, MeetingStatus } from "@/types/team";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  FileText, 
  ListTodo, 
  Bell, 
  Plus, 
  Trash2,
  X,
} from "lucide-react";

type MeetingDetailProps = {
  meeting: OneOnOneMeeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MeetingDetail({ meeting, open, onOpenChange }: MeetingDetailProps) {
  const [activeTab, setActiveTab] = useState("notes");
  const [noteContent, setNoteContent] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionAssignee, setActionAssignee] = useState(meeting.attendee_id);
  const [actionDueDate, setActionDueDate] = useState<Date | null>(null);
  const [followupDate, setFollowupDate] = useState<Date | null>(null);
  const [followupMessage, setFollowupMessage] = useState("");
  
  const { notes, createNote, deleteNote, isLoading: notesLoading } = useMeetingNotes(meeting.id);
  const { 
    actionItems, 
    createActionItem, 
    completeActionItem, 
    deleteActionItem, 
    isLoading: actionsLoading 
  } = useActionItems(meeting.id);
  const { 
    followups, 
    createFollowup, 
    updateFollowupStatus, 
    deleteFollowup, 
    isLoading: followupsLoading 
  } = useMeetingFollowups(meeting.id);
  
  // Handle note submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    await createNote.mutateAsync({
      meetingId: meeting.id,
      content: noteContent
    });
    
    setNoteContent("");
  };
  
  // Handle action item creation
  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionDescription.trim()) return;
    
    await createActionItem.mutateAsync({
      meetingId: meeting.id,
      assignedTo: actionAssignee,
      description: actionDescription,
      dueDate: actionDueDate?.toISOString()
    });
    
    setActionDescription("");
    setActionDueDate(null);
  };
  
  // Handle follow-up creation
  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;
    
    await createFollowup.mutateAsync({
      meetingId: meeting.id,
      reminderAt: followupDate.toISOString(),
      message: followupMessage
    });
    
    setFollowupDate(null);
    setFollowupMessage("");
  };
  
  // Get status badge
  const getMeetingStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getMeetingStatusBadge(meeting.status as MeetingStatus)}
              </div>
              <DialogTitle className="text-xl">{meeting.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {format(parseISO(meeting.scheduled_at), "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {format(parseISO(meeting.scheduled_at), "h:mm a")} 
              {" • "}
              {meeting.duration_minutes} min
            </span>
          </div>

          {meeting.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{meeting.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-start space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={meeting.creator_image || undefined} alt={meeting.creator_name} />
              <AvatarFallback>{meeting.creator_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-500">Organizer</p>
              <p className="text-sm font-medium">{meeting.creator_name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={meeting.attendee_image || undefined} alt={meeting.attendee_name} />
              <AvatarFallback>{meeting.attendee_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-500">Attendee</p>
              <p className="text-sm font-medium">{meeting.attendee_name}</p>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="notes" className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> Notes
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-1">
              <ListTodo className="h-4 w-4" /> Action Items
            </TabsTrigger>
            <TabsTrigger value="followups" className="flex items-center gap-1">
              <Bell className="h-4 w-4" /> Follow-ups
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="notes" className="h-full flex flex-col mt-0">
              <ScrollArea className="flex-1 pr-4">
                {notes && notes.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium">{note.author_name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(parseISO(note.created_at), { addSuffix: true })}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => deleteNote.mutate({ noteId: note.id, meetingId: meeting.id })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <FileText className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500">No notes yet</p>
                  </div>
                )}
              </ScrollArea>
              
              <form onSubmit={handleAddNote} className="mt-4 border-t pt-4">
                <Textarea
                  placeholder="Add meeting notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    type="submit" 
                    disabled={!noteContent.trim() || notesLoading}
                  >
                    Add Note
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="actions" className="h-full flex flex-col mt-0">
              <ScrollArea className="flex-1 pr-4">
                {actionItems && actionItems.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {actionItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`border rounded-md p-3 ${
                          item.completed_at ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-6 w-6 rounded-full ${
                                item.completed_at ? 'text-green-500' : 'text-gray-300'
                              }`}
                              onClick={() => {
                                if (!item.completed_at) {
                                  completeActionItem.mutate({ 
                                    actionItemId: item.id, 
                                    meetingId: meeting.id 
                                  });
                                }
                              }}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <div>
                              <p className={`text-sm font-medium ${
                                item.completed_at ? 'line-through text-gray-500' : ''
                              }`}>
                                {item.description}
                              </p>
                              <div className="flex items-center mt-1">
                                <Avatar className="h-5 w-5 mr-1">
                                  <AvatarImage src={item.assignee_image || undefined} alt={item.assignee_name} />
                                  <AvatarFallback className="text-[10px]">
                                    {item.assignee_name?.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500 mr-3">
                                  {item.assignee_name}
                                </span>
                                {item.due_date && (
                                  <span className="text-xs text-gray-500">
                                    Due: {format(parseISO(item.due_date), "MMM d")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => deleteActionItem.mutate({ 
                              actionItemId: item.id, 
                              meetingId: meeting.id 
                            })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <ListTodo className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500">No action items yet</p>
                  </div>
                )}
              </ScrollArea>
              
              <form onSubmit={handleAddActionItem} className="mt-4 border-t pt-4">
                <div className="mb-3">
                  <Input
                    placeholder="Add a new action item..."
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignee" className="text-xs mb-1 block">Assigned to</Label>
                    <select
                      id="assignee"
                      value={actionAssignee}
                      onChange={(e) => setActionAssignee(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value={meeting.created_by}>{meeting.creator_name}</option>
                      <option value={meeting.attendee_id}>{meeting.attendee_name}</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-xs mb-1 block">Due date (optional)</Label>
                    <DatePicker
                      selected={actionDueDate}
                      onSelect={setActionDueDate}
                      minDate={new Date()}
                      placeholder="Select due date"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button 
                    type="submit" 
                    disabled={!actionDescription.trim() || actionsLoading}
                  >
                    Add Action Item
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="followups" className="h-full flex flex-col mt-0">
              <ScrollArea className="flex-1 pr-4">
                {followups && followups.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {followups.map((followup) => (
                      <div 
                        key={followup.id} 
                        className={`border rounded-md p-3 ${
                          followup.reminder_sent ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Bell className={`h-4 w-4 ${
                                followup.reminder_sent ? 'text-green-500' : 'text-blue-500'
                              }`} />
                              <p className="text-sm font-medium">
                                Follow-up on {format(parseISO(followup.reminder_at), "MMM d, yyyy")}
                              </p>
                              {followup.reminder_sent && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                  Sent
                                </Badge>
                              )}
                            </div>
                            {followup.message && (
                              <p className="text-sm text-gray-600 mt-1 ml-6">{followup.message}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => deleteFollowup.mutate({ 
                              followupId: followup.id, 
                              meetingId: meeting.id 
                            })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <Bell className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500">No follow-ups scheduled</p>
                  </div>
                )}
              </ScrollArea>
              
              <form onSubmit={handleAddFollowup} className="mt-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label className="text-xs mb-1 block">Reminder date</Label>
                    <DatePicker
                      selected={followupDate}
                      onSelect={setFollowupDate}
                      minDate={new Date()}
                      placeholder="Select reminder date"
                    />
                  </div>
                </div>
                
                <Textarea
                  placeholder="Add a message (optional)..."
                  value={followupMessage}
                  onChange={(e) => setFollowupMessage(e.target.value)}
                  className="min-h-[80px]"
                />
                
                <div className="flex justify-end mt-3">
                  <Button 
                    type="submit" 
                    disabled={!followupDate || followupsLoading}
                  >
                    Schedule Follow-up
                  </Button>
                </div>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
