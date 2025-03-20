
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamSelector } from "@/components/team/TeamSelector";
import { MeetingsList } from "@/components/team/MeetingsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOneOnOneMeetings } from "@/hooks/team/useOneOnOneMeetings";
import { useActionItems } from "@/hooks/team/useActionItems";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { Calendar, ListTodo, UserRound } from "lucide-react";

export default function OneOnOneManagement() {
  const { teams, isLoadingTeams, refreshTeams } = useTeamManagement();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const { userMeetings, userMeetingsQuery } = useOneOnOneMeetings();
  const { userActionItems, userActionItemsQuery } = useActionItems();
  
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    refreshTeams().catch(err => {
      console.error("Error refreshing teams:", err);
    });
  }, [refreshTeams]);

  // Filter upcoming meetings and group by date
  const todayMeetings = userMeetings?.filter(m => 
    isToday(parseISO(m.scheduled_at)) && m.status === 'scheduled'
  ) || [];
  
  const tomorrowMeetings = userMeetings?.filter(m => 
    isTomorrow(parseISO(m.scheduled_at)) && m.status === 'scheduled'
  ) || [];
  
  const upcomingMeetings = userMeetings?.filter(m => 
    parseISO(m.scheduled_at) > addDays(new Date(), 1) && m.status === 'scheduled'
  ) || [];

  // Group upcoming action items by due date
  const todayActions = userActionItems?.filter(a => 
    a.due_date && isToday(parseISO(a.due_date))
  ) || [];
  
  const upcomingActions = userActionItems?.filter(a => 
    a.due_date && parseISO(a.due_date) > new Date() && !isToday(parseISO(a.due_date))
  ) || [];
  
  const noDateActions = userActionItems?.filter(a => !a.due_date) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">One-on-One Management</h1>
          <p className="text-muted-foreground">
            Schedule and manage one-on-one meetings with your team members.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <TeamSelector 
            selectedTeamId={selectedTeamId} 
            onTeamSelect={setSelectedTeamId}
          />
        </div>
      </div>

      {isLoadingTeams ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Loading teams...</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please wait while we load your teams.
          </p>
        </div>
      ) : teams && teams.length === 0 ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            You don't have any teams yet. Create a new team to get started with one-on-one management.
          </p>
        </div>
      ) : !selectedTeamId ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Select or Create a Team</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Choose a team from the dropdown above or create a new team to get started with one-on-one management.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <UserRound className="h-5 w-5 mr-2" />
                  Your Overview
                </h2>
                
                <Tabs defaultValue="meetings">
                  <TabsList className="w-full">
                    <TabsTrigger value="meetings" className="flex-1">Meetings</TabsTrigger>
                    <TabsTrigger value="actions" className="flex-1">Action Items</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="meetings" className="pt-4">
                    {userMeetingsQuery.isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading your meetings...</p>
                      </div>
                    ) : (todayMeetings.length === 0 && tomorrowMeetings.length === 0 && upcomingMeetings.length === 0) ? (
                      <div className="text-center py-8">
                        <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-muted-foreground">No upcoming meetings</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {todayMeetings.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Today</h3>
                            <div className="space-y-2">
                              {todayMeetings.map(meeting => (
                                <div key={meeting.id} className="border rounded-md p-3">
                                  <p className="font-medium">{meeting.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(meeting.scheduled_at), "h:mm a")}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-600 mr-2">
                                      with {meeting.attendee_name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {tomorrowMeetings.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Tomorrow</h3>
                            <div className="space-y-2">
                              {tomorrowMeetings.map(meeting => (
                                <div key={meeting.id} className="border rounded-md p-3">
                                  <p className="font-medium">{meeting.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(meeting.scheduled_at), "h:mm a")}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-600 mr-2">
                                      with {meeting.attendee_name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {upcomingMeetings.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Upcoming</h3>
                            <div className="space-y-2">
                              {upcomingMeetings.slice(0, 3).map(meeting => (
                                <div key={meeting.id} className="border rounded-md p-3">
                                  <p className="font-medium">{meeting.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(meeting.scheduled_at), "MMM d, h:mm a")}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-600 mr-2">
                                      with {meeting.attendee_name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {upcomingMeetings.length > 3 && (
                                <p className="text-sm text-center text-gray-500">
                                  +{upcomingMeetings.length - 3} more upcoming meetings
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="actions" className="pt-4">
                    {userActionItemsQuery.isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading your action items...</p>
                      </div>
                    ) : (todayActions.length === 0 && upcomingActions.length === 0 && noDateActions.length === 0) ? (
                      <div className="text-center py-8">
                        <ListTodo className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-muted-foreground">No pending action items</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {todayActions.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Due Today</h3>
                            <div className="space-y-2">
                              {todayActions.map(action => (
                                <div key={action.id} className="border rounded-md p-3">
                                  <p className="font-medium">{action.description}</p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-red-600 mr-2">
                                      Due today
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      from {action.creator_name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {upcomingActions.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">Upcoming</h3>
                            <div className="space-y-2">
                              {upcomingActions.map(action => (
                                <div key={action.id} className="border rounded-md p-3">
                                  <p className="font-medium">{action.description}</p>
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-600 mr-2">
                                      Due {format(parseISO(action.due_date!), "MMM d")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {noDateActions.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">No Due Date</h3>
                            <div className="space-y-2">
                              {noDateActions.map(action => (
                                <div key={action.id} className="border rounded-md p-3">
                                  <p className="font-medium">{action.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-12 md:col-span-8">
            <MeetingsList teamId={selectedTeamId} />
          </div>
        </div>
      )}
    </div>
  );
}
