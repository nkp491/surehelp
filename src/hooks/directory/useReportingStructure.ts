
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
      const { data: reportingData, error: reportingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);
        
      if (reportingError) {
        throw reportingError;
      }
      
      // Use a more direct approach to create reports array
      const directReports: Profile[] = [];
      
      // Break the type inference chain to avoid excessive recursion
      if (reportingData) {
        // Cast to any[] first to break type recursion
        const safeData = reportingData as any[];
        
        // Then process each item individually with explicit typing
        for (const item of safeData) {
          try {
            // Use an intermediate type to avoid excessive type checking
            const rawData = item as RawProfileData;
            const profile = sanitizeProfileData(rawData) as Profile;
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
