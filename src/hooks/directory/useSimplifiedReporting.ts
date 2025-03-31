
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

// Define simple return types without recursive references
export interface SimpleReportingPerson {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  job_title: string | null;
  role: string | null;
}

export interface SimpleReportingStructure {
  manager: SimpleReportingPerson | null;
  directReports: SimpleReportingPerson[];
}

export const useSimplifiedReporting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Function to get manager by email
  const getManagerByEmail = async (managerEmail: string): Promise<SimpleReportingPerson | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, profile_image_url, job_title, role')
        .eq('email', managerEmail)
        .single();
        
      if (error || !data) {
        console.error('Error fetching manager:', error);
        return null;
      }
      
      return data as SimpleReportingPerson;
    } catch (err) {
      console.error('Error in getManagerByEmail:', err);
      return null;
    }
  };
  
  // Function to get profile by ID with minimal fields
  const getProfileById = async (profileId: string): Promise<SimpleReportingPerson | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, profile_image_url, job_title, role')
        .eq('id', profileId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as SimpleReportingPerson;
    } catch (err) {
      console.error('Error in getProfileById:', err);
      return null;
    }
  };
  
  // Function to get direct reports by manager email
  const getDirectReportsByManagerEmail = async (managerEmail: string): Promise<SimpleReportingPerson[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, profile_image_url, job_title, role')
        .eq('manager_email', managerEmail);
        
      if (error || !data) {
        console.error('Error fetching direct reports:', error);
        return [];
      }
      
      return data as SimpleReportingPerson[];
    } catch (err) {
      console.error('Error in getDirectReportsByManagerEmail:', err);
      return [];
    }
  };
  
  // Main function to get reporting structure for a profile
  const getReportingStructure = async (profileId: string): Promise<SimpleReportingStructure | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the profile
      const profile = await getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      // Get manager if available
      let manager: SimpleReportingPerson | null = null;
      if (profile.email) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('manager_email')
          .eq('id', profileId)
          .single();
          
        if (!profileError && profileData && profileData.manager_email) {
          manager = await getManagerByEmail(profileData.manager_email);
        }
      }
      
      // Get direct reports
      let directReports: SimpleReportingPerson[] = [];
      if (profile.email) {
        directReports = await getDirectReportsByManagerEmail(profile.email);
      }
      
      return {
        manager,
        directReports
      };
    } catch (error: any) {
      console.error('Error fetching reporting structure:', error);
      setError(error.message || 'Failed to load reporting structure');
      toast({
        title: 'Error',
        description: 'Failed to load reporting structure',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // React Query hook for caching reporting structure
  const useReportingStructureQuery = (profileId?: string) => {
    return useQuery({
      queryKey: ['reporting-structure', profileId],
      queryFn: () => getReportingStructure(profileId!),
      enabled: !!profileId,
    });
  };
  
  return {
    getReportingStructure,
    useReportingStructureQuery,
    isLoading,
    error
  };
};
