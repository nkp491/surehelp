
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

// A simplified type for raw database records to break type chains
type RawDatabaseRecord = Record<string, unknown>;

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();
  
  // Helper function to safely convert a raw database record to a Profile
  const convertToProfile = (rawData: RawDatabaseRecord): Profile => {
    // Create a completely detached copy with no type references
    const detachedData = JSON.parse(JSON.stringify(rawData)) as Record<string, unknown>;
    return sanitizeProfileData(detachedData) as Profile;
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
      
      // Cast to unknown first to break type chains
      const rawRecords = data as unknown as RawDatabaseRecord[];
      const reports: Profile[] = [];
      
      // Process each record individually to avoid type recursion
      for (let i = 0; i < rawRecords.length; i++) {
        try {
          // Process records one at a time with explicit conversions
          const profile = convertToProfile(rawRecords[i]);
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
      // Step 1: Get the member profile
      let memberProfile: Profile;
      try {
        memberProfile = await getMemberById(profileId);
      } catch (err) {
        console.error('Error fetching member profile:', err);
        throw new Error('Failed to load team member profile');
      }
      
      // Step 2: Get manager if applicable (completely isolated)
      let managerProfile: Profile | null = null;
      if (memberProfile.reports_to) {
        try {
          const fetchedManager = await getMemberById(memberProfile.reports_to);
          // Create completely new object to break reference chains
          managerProfile = { ...fetchedManager } as Profile;
        } catch (err) {
          console.error('Error fetching manager:', err);
          // Continue without manager
        }
      }
      
      // Step 3: Get direct reports (using dedicated function)
      const directReports = await fetchDirectReports(profileId);
      
      // Step 4: Construct final structure with explicit typing and spreading
      const result: ReportingStructure = {
        manager: managerProfile,
        directReports: [...directReports]
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
