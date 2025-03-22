
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from '../profile/useProfileSanitization';

// Define a simpler type for raw database records
interface RawProfileData {
  [key: string]: any;
}

export const useReportingStructure = (getMemberById: (id: string) => Promise<Profile>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();
  
  // Helper function to safely convert raw data to Profile objects
  const convertToProfile = (rawData: RawProfileData): Profile => {
    // Use JSON parsing to completely break any type references
    const detachedData = JSON.parse(JSON.stringify(rawData)) as RawProfileData;
    return sanitizeProfileData(detachedData);
  };
  
  // Function to get reporting structure for a team member
  const getReportingStructure = async (profileId: string): Promise<ReportingStructure | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the requested profile
      const member = await getMemberById(profileId);
      
      // If profile has a reports_to field, get the manager
      let manager: Profile | null = null;
      if (member.reports_to) {
        try {
          manager = await getMemberById(member.reports_to);
        } catch (error) {
          console.error('Error fetching manager:', error);
          // Continue even if manager fetch fails
        }
      }
      
      // Get direct reports (people who report to this profile)
      const { data, error: reportingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);
        
      if (reportingError) {
        throw reportingError;
      }
      
      // Process direct reports with complete type isolation
      const directReports: Profile[] = [];
      
      // We need to explicitly type our data to break type inference
      const reportingData: unknown = data;
      
      // Ensure we have data and it's an array
      if (reportingData && Array.isArray(reportingData)) {
        // Process each item individually without type inference
        for (let i = 0; i < reportingData.length; i++) {
          try {
            // Convert each item type safely without type inference chains
            const item = reportingData[i] as object;
            const rawData: RawProfileData = { ...item }; 
            
            // Use our helper function to safely convert to Profile
            const profile = convertToProfile(rawData);
            directReports.push(profile);
          } catch (err) {
            console.error('Error processing direct report:', err);
          }
        }
      }
      
      // Create the final structure with explicit typing
      const result: ReportingStructure = {
        manager,
        directReports
      };
      
      return result;
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
  
  return {
    getReportingStructure,
    isLoadingStructure: isLoading,
    structureError: error
  };
};
