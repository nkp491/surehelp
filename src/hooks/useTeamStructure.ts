
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';

// Create a completely flat profile type with no circular references
interface FlatProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role: "agent" | "manager_pro" | "beta_user" | "manager_pro_gold" | "manager_pro_platinum" | "agent_pro" | "system_admin" | null;
  roles?: string[];
  created_at: string;
  updated_at: string;
  last_sign_in: string | null;
  language_preference: string | null;
  privacy_settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  } | null;
  notification_preferences: {
    email_notifications: boolean;
    in_app_notifications: boolean;
    sms_notifications: boolean;
    team_updates: boolean;
    meeting_reminders: boolean;
    performance_updates: boolean;
    system_announcements: boolean;
    role_changes: boolean;
    do_not_disturb: boolean;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  } | null;
  skills: string[] | null;
  bio: string | null;
  job_title: string | null;
  department: string | null;
  location: string | null;
  reports_to: string | null;
  hire_date: string | null;
  extended_contact: {
    work_email: string | null;
    personal_email: string | null;
    work_phone: string | null;
    home_phone: string | null;
    emergency_contact: string | null;
  } | null;
}

// Define a reporting structure that uses the flat profile type
interface FlatReportingStructure {
  manager: FlatProfile | null;
  directReports: FlatProfile[];
}

export const useTeamStructure = () => {
  const [reportingStructure, setReportingStructure] = useState<FlatReportingStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

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

      // Sanitize profile data and convert to FlatProfile
      const sanitizedProfile = sanitizeProfileData({
        ...profile,
        roles: [profile.role].filter(Boolean)
      });
      
      const mappedProfile: FlatProfile = {
        id: sanitizedProfile.id,
        first_name: sanitizedProfile.first_name,
        last_name: sanitizedProfile.last_name,
        email: sanitizedProfile.email,
        phone: sanitizedProfile.phone,
        profile_image_url: sanitizedProfile.profile_image_url,
        role: sanitizedProfile.role,
        roles: sanitizedProfile.roles,
        created_at: sanitizedProfile.created_at,
        updated_at: sanitizedProfile.updated_at,
        last_sign_in: sanitizedProfile.last_sign_in,
        language_preference: sanitizedProfile.language_preference,
        privacy_settings: sanitizedProfile.privacy_settings,
        notification_preferences: sanitizedProfile.notification_preferences,
        skills: sanitizedProfile.skills,
        bio: sanitizedProfile.bio,
        job_title: sanitizedProfile.job_title,
        department: sanitizedProfile.department,
        location: sanitizedProfile.location,
        reports_to: sanitizedProfile.reports_to,
        hire_date: sanitizedProfile.hire_date,
        extended_contact: sanitizedProfile.extended_contact
      };

      // Get manager if reports_to is set
      let manager: FlatProfile | null = null;
      if (mappedProfile.reports_to) {
        const { data: managerData, error: managerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mappedProfile.reports_to)
          .single();
        
        if (!managerError && managerData) {
          const sanitizedManager = sanitizeProfileData({
            ...managerData,
            roles: [managerData.role].filter(Boolean)
          });
          
          manager = {
            id: sanitizedManager.id,
            first_name: sanitizedManager.first_name,
            last_name: sanitizedManager.last_name,
            email: sanitizedManager.email,
            phone: sanitizedManager.phone,
            profile_image_url: sanitizedManager.profile_image_url,
            role: sanitizedManager.role,
            roles: sanitizedManager.roles,
            created_at: sanitizedManager.created_at,
            updated_at: sanitizedManager.updated_at,
            last_sign_in: sanitizedManager.last_sign_in,
            language_preference: sanitizedManager.language_preference,
            privacy_settings: sanitizedManager.privacy_settings,
            notification_preferences: sanitizedManager.notification_preferences,
            skills: sanitizedManager.skills,
            bio: sanitizedManager.bio,
            job_title: sanitizedManager.job_title,
            department: sanitizedManager.department,
            location: sanitizedManager.location,
            reports_to: sanitizedManager.reports_to,
            hire_date: sanitizedManager.hire_date,
            extended_contact: sanitizedManager.extended_contact
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

      // Map direct reports to FlatProfile
      const directReports = (reportingData || []).map(report => {
        const sanitizedReport = sanitizeProfileData({
          ...report,
          roles: [report.role].filter(Boolean)
        });
        
        return {
          id: sanitizedReport.id,
          first_name: sanitizedReport.first_name,
          last_name: sanitizedReport.last_name,
          email: sanitizedReport.email,
          phone: sanitizedReport.phone,
          profile_image_url: sanitizedReport.profile_image_url,
          role: sanitizedReport.role,
          roles: sanitizedReport.roles,
          created_at: sanitizedReport.created_at,
          updated_at: sanitizedReport.updated_at,
          last_sign_in: sanitizedReport.last_sign_in,
          language_preference: sanitizedReport.language_preference,
          privacy_settings: sanitizedReport.privacy_settings,
          notification_preferences: sanitizedReport.notification_preferences,
          skills: sanitizedReport.skills,
          bio: sanitizedReport.bio,
          job_title: sanitizedReport.job_title,
          department: sanitizedReport.department,
          location: sanitizedReport.location,
          reports_to: sanitizedReport.reports_to,
          hire_date: sanitizedReport.hire_date,
          extended_contact: sanitizedReport.extended_contact
        } as FlatProfile;
      });

      // Create the flat reporting structure
      const structure: FlatReportingStructure = {
        manager,
        directReports
      };

      setReportingStructure(structure);
      return structure;
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
    reportingStructure,
    isLoading,
    error,
    getReportingStructure
  };
};
