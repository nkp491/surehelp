
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

      // Initialize an empty array for direct reports
      const directReports: Profile[] = [];
      
      // Process each direct report individually using a for loop to avoid type complexity
      if (reportingData && Array.isArray(reportingData)) {
        for (const reportData of reportingData) {
          try {
            // Process each report individually to avoid complex type instantiation
            const sanitizedProfile = sanitizeProfileData(reportData);
            directReports.push(sanitizedProfile);
          } catch (profileError) {
            console.error('Error processing direct report:', profileError);
            // Continue with other direct reports even if one fails
          }
        }
      }

      // Create and return the reporting structure
      return {
        manager: manager,
        directReports: directReports
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

  return {
    getReportingStructure,
    isLoadingStructure: isLoading,
    structureError: error
  };
};
