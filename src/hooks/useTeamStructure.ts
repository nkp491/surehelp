
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useTeamStructure = () => {
  const [reportingStructure, setReportingStructure] = useState<ReportingStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getReportingStructure = async (profileId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the requested profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Map to our Profile type
      const mappedProfile: Profile = {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        profile_image_url: profile.profile_image_url,
        role: profile.role,
        roles: profile.roles,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_sign_in: profile.last_sign_in,
        language_preference: profile.language_preference,
        privacy_settings: profile.privacy_settings,
        notification_preferences: profile.notification_preferences,
        skills: profile.skills || [],
        bio: profile.bio || null,
        job_title: profile.job_title || null,
        department: profile.department || null,
        location: profile.location || null,
        reports_to: profile.reports_to || null,
        hire_date: profile.hire_date || null,
        extended_contact: profile.extended_contact || null
      };

      // Get manager if reports_to is set
      let manager: Profile | null = null;
      if (mappedProfile.reports_to) {
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mappedProfile.reports_to)
          .single();
        
        if (!managerError && managerData) {
          manager = {
            id: managerData.id,
            first_name: managerData.first_name,
            last_name: managerData.last_name,
            email: managerData.email,
            phone: managerData.phone,
            profile_image_url: managerData.profile_image_url,
            role: managerData.role,
            roles: managerData.roles,
            created_at: managerData.created_at,
            updated_at: managerData.updated_at,
            last_sign_in: managerData.last_sign_in,
            language_preference: managerData.language_preference,
            privacy_settings: managerData.privacy_settings,
            notification_preferences: managerData.notification_preferences,
            skills: managerData.skills || [],
            bio: managerData.bio || null,
            job_title: managerData.job_title || null,
            department: managerData.department || null,
            location: managerData.location || null,
            reports_to: managerData.reports_to || null,
            hire_date: managerData.hire_date || null,
            extended_contact: managerData.extended_contact || null
          };
        }
      }

      // Get direct reports
      const { data: reportingData, error: reportingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);

      if (reportingError) {
        throw reportingError;
      }

      // Map direct reports to Profile type
      const directReports: Profile[] = (reportingData || []).map(report => ({
        id: report.id,
        first_name: report.first_name,
        last_name: report.last_name,
        email: report.email,
        phone: report.phone,
        profile_image_url: report.profile_image_url,
        role: report.role,
        roles: report.roles,
        created_at: report.created_at,
        updated_at: report.updated_at,
        last_sign_in: report.last_sign_in,
        language_preference: report.language_preference,
        privacy_settings: report.privacy_settings,
        notification_preferences: report.notification_preferences,
        skills: report.skills || [],
        bio: report.bio || null,
        job_title: report.job_title || null,
        department: report.department || null,
        location: report.location || null,
        reports_to: report.reports_to || null,
        hire_date: report.hire_date || null,
        extended_contact: report.extended_contact || null
      }));

      // Create the reporting structure
      const structure: ReportingStructure = {
        manager: manager || mappedProfile,  // If no manager found, use the profile itself
        directReports: directReports
      };

      setReportingStructure(structure);
    } catch (error: any) {
      console.error('Error fetching reporting structure:', error);
      setError(error.message || 'Failed to load reporting structure');
      toast({
        title: 'Error',
        description: 'Failed to load reporting structure',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reportingStructure,
    isLoading,
    error,
    getReportingStructure
  };
};
