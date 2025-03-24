
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserProfile = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_image_url?: string;
  language_preference?: string;
  role?: string;
  created_at: string;
  updated_at: string;
};

type UserContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  refreshUserProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    if (!authUser?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, authUser?.id]);

  const value = {
    user,
    isLoading,
    refreshUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
