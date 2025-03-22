
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
  
  // Isolated function to fetch direct reports without type dependencies
  const fetchDirectReports = async (profileId: string): Promise<Profile[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);
      
      if (fetchError) throw fetchError;
      if (!data) return [];
      
      // Process as plain objects first
      const reports: Profile[] = [];
      
      for (const rawProfile of data) {
        try {
          // Create a sanitized copy with explicit type
          const plainData = JSON.parse(JSON.stringify(rawProfile));
          const sanitizedProfile = sanitizeProfileData(plainData);
          reports.push(sanitizedProfile);
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
      // Step 1: Get the member profile
      let memberProfile: Profile;
      try {
        const rawMember = await getMemberById(profileId);
        // Create a disconnected copy to break type references
        memberProfile = { ...rawMember };
      } catch (err) {
        console.error('Error fetching member profile:', err);
        throw new Error('Failed to load team member profile');
      }
      
      // Step 2: Get manager if applicable
      let managerProfile: Profile | null = null;
      if (memberProfile.reports_to) {
        try {
          const rawManager = await getMemberById(memberProfile.reports_to);
          // Create a disconnected copy
          managerProfile = { ...rawManager };
        } catch (err) {
          console.error('Error fetching manager:', err);
          // Continue without manager
        }
      }
      
      // Step 3: Get direct reports
      const directReports = await fetchDirectReports(profileId);
      
      // Step 4: Construct final structure with explicit typing
      const result: ReportingStructure = {
        manager: managerProfile,
        directReports: directReports
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
