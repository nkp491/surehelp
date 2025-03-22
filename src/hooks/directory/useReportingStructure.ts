
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

// Define a type for raw database records
interface RawProfileData {
  [key: string]: any;
}

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();
  
  // Helper function to safely process a raw profile and break type chains
  const processRawProfile = (rawData: RawProfileData): Profile => {
    // Create a shallow copy to break reference chains
    const detachedData = { ...rawData };
    
    // Use sanitization function to ensure proper shape
    const sanitizedProfile = sanitizeProfileData(detachedData);
    
    // Force type assertion to Profile
    return sanitizedProfile as Profile;
  };
  
  // Helper function to fetch direct reports safely
  const fetchDirectReports = async (profileId: string): Promise<Profile[]> => {
    try {
      // Query profiles that report to the given profileId
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);
      
      if (queryError) {
        console.error('Error fetching direct reports:', queryError);
        return [];
      }
      
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      // Process each report individually to break type chains
      const reports: Profile[] = [];
      
      for (let i = 0; i < data.length; i++) {
        try {
          // First convert to unknown to break type inference
          const rawItem: unknown = data[i];
          
          // Then cast to our intermediate type
          const rawProfile = rawItem as RawProfileData;
          
          // Process the profile
          const profile = processRawProfile(rawProfile);
          
          // Add to array
          reports.push(profile);
        } catch (err) {
          console.error('Error processing direct report:', err);
        }
      }
      
      return reports;
    } catch (err) {
      console.error('Unexpected error in fetchDirectReports:', err);
      return [];
    }
  };
  
  // Main function to get reporting structure
  const getReportingStructure = async (profileId: string): Promise<ReportingStructure | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get the requested profile with explicit error handling
      let member: Profile;
      try {
        member = await getMemberById(profileId);
      } catch (err) {
        console.error('Error fetching member profile:', err);
        throw new Error('Failed to load team member profile');
      }
      
      // Step 2: Get manager if applicable (isolated logic)
      let manager: Profile | null = null;
      if (member.reports_to) {
        try {
          const fetchedManager = await getMemberById(member.reports_to);
          // Create a new object to break reference chain
          manager = { ...fetchedManager } as Profile;
        } catch (err) {
          console.error('Error fetching manager:', err);
          // Continue without manager
        }
      }
      
      // Step 3: Get direct reports (using helper function)
      const directReports = await fetchDirectReports(profileId);
      
      // Step 4: Construct final result with spreads to break reference chains
      const result: ReportingStructure = {
        manager: manager ? { ...manager } : null,
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
