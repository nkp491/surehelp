
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/types/notification";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead
  } = useNotifications();
  const navigate = useNavigate();

  // Show only the latest 5 notifications in the dropdown
  const recentNotifications = notifications.slice(0, 5);
  
  const handleViewAll = () => {
    navigate("/notifications");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-xs flex items-center justify-center text-white transform translate-x-1 -translate-y-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-2 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-2 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <p>No notifications</p>
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto p-2">
            {recentNotifications.map((notification: Notification) => (
              <DropdownMenuItem key={notification.id} className="p-0">
                <NotificationItem 
                  notification={notification} 
                  onRead={markAsRead} 
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-center" 
            onClick={handleViewAll}
          >
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
