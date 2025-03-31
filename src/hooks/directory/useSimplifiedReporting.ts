
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      // Check if we can select job_title from profiles
      const testQuery = await supabase
        .from('profiles')
        .select('job_title')
        .limit(1);
      
      // Define the selection fields based on what's available
      const selectFields = testQuery.error && testQuery.error.message.includes('job_title')
        ? 'id, email, first_name, last_name, profile_image_url, role'
        : 'id, email, first_name, last_name, profile_image_url, role, job_title';
      
      const { data, error } = await supabase
        .from('profiles')
        .select(selectFields)
        .eq('email', managerEmail)
        .single();
        
      if (error || !data) {
        console.error('Error fetching manager:', error);
        return null;
      }
      
      // Convert data to SimpleReportingPerson with job_title set to null if missing
      const result: SimpleReportingPerson = {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image_url: data.profile_image_url,
        role: data.role,
        job_title: 'job_title' in data ? data.job_title : null
      };
      
      return result;
    } catch (err) {
      console.error('Error in getManagerByEmail:', err);
      return null;
    }
  };
  
  // Function to get profile by ID with minimal fields
  const getProfileById = async (profileId: string): Promise<SimpleReportingPerson | null> => {
    try {
      // Check if we can select job_title from profiles
      const testQuery = await supabase
        .from('profiles')
        .select('job_title')
        .limit(1);
      
      // Define the selection fields based on what's available
      const selectFields = testQuery.error && testQuery.error.message.includes('job_title')
        ? 'id, email, first_name, last_name, profile_image_url, role'
        : 'id, email, first_name, last_name, profile_image_url, role, job_title';
      
      const { data, error } = await supabase
        .from('profiles')
        .select(selectFields)
        .eq('id', profileId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      // Convert data to SimpleReportingPerson with job_title set to null if missing
      const result: SimpleReportingPerson = {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image_url: data.profile_image_url,
        role: data.role,
        job_title: 'job_title' in data ? data.job_title : null
      };
      
      return result;
    } catch (err) {
      console.error('Error in getProfileById:', err);
      return null;
    }
  };
  
  // Function to get direct reports by manager email
  const getDirectReportsByManagerEmail = async (managerEmail: string): Promise<SimpleReportingPerson[]> => {
    try {
      // First check if manager_email column exists by attempting a query
      const testQuery = await supabase
        .from('profiles')
        .select('manager_email')
        .limit(1);
        
      // If manager_email column doesn't exist, return empty array 
      if (testQuery.error && testQuery.error.message.includes('manager_email')) {
        console.log("manager_email column doesn't exist, returning empty array");
        return [];
      }
      
      // Check if we can select job_title from profiles
      const jobTitleTest = await supabase
        .from('profiles')
        .select('job_title')
        .limit(1);
      
      // Define the selection fields based on what's available
      const selectFields = jobTitleTest.error && jobTitleTest.error.message.includes('job_title')
        ? 'id, email, first_name, last_name, profile_image_url, role'
        : 'id, email, first_name, last_name, profile_image_url, role, job_title';
        
      const { data, error } = await supabase
        .from('profiles')
        .select(selectFields)
        .eq('manager_email', managerEmail);
        
      if (error || !data) {
        console.error('Error fetching direct reports:', error);
        return [];
      }
      
      // Convert data to SimpleReportingPerson array with job_title set to null if missing
      return data.map(profile => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name, 
        last_name: profile.last_name,
        profile_image_url: profile.profile_image_url,
        role: profile.role,
        job_title: 'job_title' in profile ? profile.job_title : null
      }));
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
        // First check if manager_email column exists
        const testQuery = await supabase
          .from('profiles')
          .select('manager_email')
          .limit(1);
          
        // If manager_email column doesn't exist, skip this part
        if (!testQuery.error || !testQuery.error.message.includes('manager_email')) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('manager_email')
              .eq('id', profileId)
              .single();
              
            if (!profileError && profileData && profileData.manager_email) {
              manager = await getManagerByEmail(profileData.manager_email);
            }
          } catch (err) {
            console.error("Error checking manager_email:", err);
            // Continue without manager
          }
        } else {
          console.log("manager_email column doesn't exist, skipping manager lookup");
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
