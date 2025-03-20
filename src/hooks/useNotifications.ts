
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { useToast } from "@/hooks/use-toast";

// This dummy function mocks the notifications table structure
// until the actual database table is created
const mockFetchNotifications = async (userId: string): Promise<Notification[]> => {
  return [
    {
      id: "1",
      user_id: userId,
      title: "Welcome to the application",
      content: "This is a sample notification to welcome you.",
      is_read: false,
      created_at: new Date().toISOString(),
      priority: "normal",
      category: "system"
    }
  ];
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }
      
      // Mock notification fetching until the actual table is created
      const notificationsData = await mockFetchNotifications(user.id);
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock API call to mark notification as read
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      
      if (!user) {
        setError("User not authenticated");
        return;
      }
      
      // Mock API call to mark all notifications as read
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive"
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    const getUserAndFetch = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        fetchNotifications();
      }
    };

    getUserAndFetch();
  }, [toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
