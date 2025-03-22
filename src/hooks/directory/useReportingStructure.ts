
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();
  
  // Helper function to safely clone a profile and break type dependencies
  const safeCloneProfile = (profile: any): Profile => {
    // Use primitive serialization to completely break reference chains
    const detached = JSON.parse(JSON.stringify(profile));
    return sanitizeProfileData(detached);
  };
  
  // Isolated function to fetch direct reports
  const fetchDirectReports = async (profileId: string): Promise<Profile[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);
      
      if (fetchError) throw fetchError;
      if (!data) return [];
      
      // Create a new array to hold results
      const reports: Profile[] = [];
      
      // Process each record individually
      for (let i = 0; i < data.length; i++) {
        try {
          const profile = safeCloneProfile(data[i]);
          reports.push(profile);
        } catch (err) {
          console.error('Error processing team member:', err);
        }
      }
      
      return reports;
    } catch (err) {
      console.error('Error fetching direct reports:', err);
      return [];
    }
  };

  // Main function to get reporting structure
  const getReportingStructure = async (profileId: string): Promise<ReportingStructure | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get the member profile as a standalone operation
      let memberProfile: Profile;
      try {
        const rawProfile = await getMemberById(profileId);
        memberProfile = safeCloneProfile(rawProfile);
      } catch (err) {
        console.error('Error fetching member profile:', err);
        throw new Error('Failed to load team member profile');
      }
      
      // Step 2: Get manager as a standalone operation
      let managerProfile: Profile | null = null;
      if (memberProfile.reports_to) {
        try {
          const rawManager = await getMemberById(memberProfile.reports_to);
          managerProfile = safeCloneProfile(rawManager);
        } catch (err) {
          console.error('Error fetching manager:', err);
          // Continue without manager
        }
      }
      
      // Step 3: Get direct reports as a standalone operation
      const directReportsArray = await fetchDirectReports(profileId);
      
      // Step 4: Construct the final structure with no references to original objects
      const result: ReportingStructure = {
        manager: managerProfile,
        directReports: [...directReportsArray]
      };
      
      return result;
    } catch (error: any) {
      console.error('Error fetching reporting structure:', error);
      const errorMessage = error.message || 'Failed to load reporting structure';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    getReportingStructure,
    isLoadingStructure: isLoading,
    structureError: error
  };
};
