
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Profile, ReportingStructure } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

export const useTeamDirectory = () => {
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamMembers = async (teamId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('profiles')
        .select('*');
      
      // If teamId is provided, filter by team members
      if (teamId) {
        const { data: teamMemberIds } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', teamId);
        
        if (teamMemberIds && teamMemberIds.length > 0) {
          const userIds = teamMemberIds.map(member => member.user_id);
          query = query.in('id', userIds);
        } else {
          setTeamMembers([]);
          setIsLoading(false);
          return;
        }
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      setTeamMembers(data || []);
    } catch (err: any) {
      console.error("Error fetching team members:", err);
      setError(err.message || "Failed to load team members");
      toast({
        title: "Error",
        description: "Failed to load team directory",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchTeamMembers = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Search by name, email, job title, department, skills
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`)
        .order('first_name', { ascending: true });
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Also search in skills array
      const { data: skillMatches, error: skillsError } = await supabase
        .from('profiles')
        .select('*')
        .contains('skills', [searchTerm]);
      
      if (skillsError) {
        console.error("Error searching by skills:", skillsError);
      }
      
      // Combine and deduplicate results
      const combined = [...(data || []), ...(skillMatches || [])];
      const uniqueIds = new Set();
      const uniqueResults = combined.filter(profile => {
        if (uniqueIds.has(profile.id)) return false;
        uniqueIds.add(profile.id);
        return true;
      });
      
      setTeamMembers(uniqueResults);
    } catch (err: any) {
      console.error("Error searching team members:", err);
      setError(err.message || "Failed to search team members");
      toast({
        title: "Error",
        description: "Failed to search team directory",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getReportingStructure = async (userId: string): Promise<ReportingStructure | null> => {
    try {
      // Get the profile with its manager
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, manager:reports_to(*)')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Get direct reports
      const { data: directReports, error: reportsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', userId);
      
      if (reportsError) throw reportsError;
      
      return {
        manager: profile.manager || null,
        directReports: directReports || []
      };
    } catch (err: any) {
      console.error("Error fetching reporting structure:", err);
      toast({
        title: "Error",
        description: "Failed to load reporting structure",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    teamMembers,
    isLoading,
    error,
    fetchTeamMembers,
    searchTeamMembers,
    getReportingStructure
  };
};
