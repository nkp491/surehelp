
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOneOnOneMeetings } from "@/hooks/team/useOneOnOneMeetings";
import { OneOnOneMeeting, MeetingStatus } from "@/types/team";
import { format, parseISO, isPast, isToday } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  ClipboardList,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleMeetingDialog } from "./ScheduleMeetingDialog";
import { MeetingDetail } from "./MeetingDetail";

type MeetingsListProps = {
  teamId: string;
};

export function MeetingsList({ teamId }: MeetingsListProps) {
  const { teamMeetings, updateMeetingStatus, deleteMeeting, isLoading } = useOneOnOneMeetings(teamId);
  const [selectedMeeting, setSelectedMeeting] = useState<OneOnOneMeeting | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Group meetings by status/time
  const upcomingMeetings = teamMeetings?.filter(
    meeting => meeting.status === 'scheduled' && !isPast(parseISO(meeting.scheduled_at))
  ) || [];
  
  const todayMeetings = upcomingMeetings.filter(
    meeting => isToday(parseISO(meeting.scheduled_at))
  );
  
  const pastMeetings = teamMeetings?.filter(
    meeting => meeting.status === 'completed' || 
    (meeting.status === 'scheduled' && isPast(parseISO(meeting.scheduled_at)))
  ) || [];

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

  // Handle status updates
  const handleStatusChange = (meetingId: string, status: MeetingStatus) => {
    updateMeetingStatus.mutate({ meetingId, status, teamId });
  };

  // Handle meeting delete
  const handleDeleteMeeting = (meetingId: string) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      deleteMeeting.mutate({ meetingId, teamId });
    }
  };

  // Open meeting details
  const openMeetingDetails = (meeting: OneOnOneMeeting) => {
    setSelectedMeeting(meeting);
    setDetailOpen(true);
  };

  // Render a meeting card
  const renderMeetingCard = (meeting: OneOnOneMeeting) => (
    <Card key={meeting.id} className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getMeetingStatusBadge(meeting.status as MeetingStatus)}
            <span className="text-xs text-gray-500">
              {format(parseISO(meeting.created_at), "MMM d, yyyy")}
            </span>
          </div>
          <CardTitle className="text-lg font-semibold mt-1">{meeting.title}</CardTitle>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openMeetingDetails(meeting)}>
              <ClipboardList className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            
            {meeting.status !== 'completed' && (
              <DropdownMenuItem onClick={() => handleStatusChange(meeting.id, 'completed')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
              </DropdownMenuItem>
            )}
            
            {meeting.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => handleStatusChange(meeting.id, 'cancelled')}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel Meeting
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => handleStatusChange(meeting.id, 'rescheduled')}>
              <RefreshCw className="mr-2 h-4 w-4" /> Mark as Rescheduled
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleDeleteMeeting(meeting.id)}
            >
              Delete Meeting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {format(parseISO(meeting.scheduled_at), "EEEE, MMMM d, yyyy")}
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {format(parseISO(meeting.scheduled_at), "h:mm a")} 
            {" - "}
            {format(new Date(new Date(meeting.scheduled_at).getTime() + meeting.duration_minutes * 60000), "h:mm a")}
            {" • "}
            {meeting.duration_minutes} min
          </span>
        </div>

        {meeting.location && (
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{meeting.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
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

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => openMeetingDetails(meeting)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">One-on-One Meetings</h2>
        <ScheduleMeetingDialog teamId={teamId} />
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="today">Today ({todayMeetings.length})</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <h3 className="font-medium mb-1">No upcoming meetings</h3>
              <p className="text-sm text-gray-500 mb-4">Schedule your first one-on-one meeting</p>
              <ScheduleMeetingDialog 
                teamId={teamId} 
                trigger={<Button size="sm">Schedule Meeting</Button>}
              />
            </div>
          ) : (
            upcomingMeetings.map(renderMeetingCard)
          )}
        </TabsContent>
        
        <TabsContent value="today">
          {todayMeetings.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <h3 className="font-medium mb-1">No meetings scheduled for today</h3>
              <p className="text-sm text-gray-500">Check upcoming meetings or schedule a new one</p>
            </div>
          ) : (
            todayMeetings.map(renderMeetingCard)
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastMeetings.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <h3 className="font-medium mb-1">No past meetings</h3>
              <p className="text-sm text-gray-500">Schedule your first meeting to get started</p>
            </div>
          ) : (
            pastMeetings.map(renderMeetingCard)
          )}
        </TabsContent>
      </Tabs>

      {selectedMeeting && (
        <MeetingDetail 
          meeting={selectedMeeting}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
}
