
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

/**
 * Fetch teams directly for the current user
 */
export const fetchUserTeamsDirectly = async (): Promise<Team[]> => {
  try {
    console.log("Fetching user teams directly...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      // Try to get all teams first - this avoids recursion
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*');
        
      if (teamsError) {
        console.error("Error fetching all teams:", teamsError);
        return [];
      }
      
      if (!allTeams || allTeams.length === 0) {
        console.log("No teams found in the system");
        return [];
      }
      
      // Try to get all team memberships
      const { data: allMemberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, user_id');
        
      if (membershipsError) {
        if (membershipsError.message?.includes('infinite recursion')) {
          console.error("Recursion error fetching all memberships:", membershipsError);
          return await fetchTeamsForSpecialCase(user.id);
        }
        
        console.error("Error fetching all memberships:", membershipsError);
        return [];
      }
      
      // Filter for this user's team memberships
      const userMemberships = allMemberships.filter(m => m.user_id === user.id);
      
      if (userMemberships.length === 0) {
        console.log("No team memberships found for user");
        return await fetchTeamsForSpecialCase(user.id);
      }
      
      // Get the team IDs
      const teamIds = userMemberships.map(m => m.team_id);
      
      // Filter the teams
      const userTeams = allTeams.filter(team => teamIds.includes(team.id));
      
      console.log(`Found ${userTeams.length} teams for user`);
      return userTeams as Team[];
    } catch (error) {
      console.error("Error in fetchUserTeamsDirectly:", error);
      return await fetchTeamsForSpecialCase(user.id);
    }
  } catch (error) {
    console.error("Error in fetchUserTeamsDirectly:", error);
    return [];
  }
};

/**
 * Fetch teams for special case users (Nielsen) or those managed by special users
 */
export const fetchTeamsForSpecialCase = async (userId: string): Promise<Team[]> => {
  console.log("Trying special case fetch for user:", userId);
  
  try {
    // Check if this is a special case user or is managed by one
    const isSpecialCase = await checkSpecialUserCase();
    
    if (isSpecialCase) {
      console.log("Confirmed special case, fetching Momentum teams");
      return await fetchMomentumTeams();
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchTeamsForSpecialCase:", error);
    return [];
  }
};

/**
 * Fetch teams without relying on RLS (for when RLS causes infinite recursion)
 */
export const fetchTeamsWithoutRLS = async (userId: string): Promise<Team[]> => {
  console.log("Attempting to fetch teams without RLS for user:", userId);
  
  try {
    // Check if this is a special user or managed by a special user
    const isSpecialCase = await checkSpecialUserCase();
    
    if (isSpecialCase) {
      console.log("Special case detected, fetching Momentum teams");
      return await fetchMomentumTeams();
    }
    
    // First get all teams (this query should not use RLS)
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
      
    if (teamsError) {
      console.error("Error fetching all teams:", teamsError);
      return [];
    }
    
    // Then try to get all team memberships
    try {
      const { data: allMemberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, user_id');
        
      if (membershipsError) {
        console.error("Error fetching all memberships:", membershipsError);
        return [];
      }
      
      // Filter for this user's team memberships
      const userMemberships = allMemberships.filter(m => m.user_id === userId);
      
      if (userMemberships.length === 0) {
        console.log("No team memberships found for user");
        return [];
      }
      
      // Get the team IDs
      const teamIds = userMemberships.map(m => m.team_id);
      
      // Filter the teams
      const userTeams = allTeams.filter(team => teamIds.includes(team.id));
      
      console.log(`Found ${userTeams.length} teams for user through fallback method`);
      return userTeams as Team[];
    } catch (error) {
      console.error("Error in fallback method:", error);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchTeamsWithoutRLS:", error);
    return [];
  }
};

/**
 * Checks if this is a special user case that needs custom handling
 */
export const checkSpecialUserCase = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if this is the special case user
    const specialEmails = ['nielsenaragon@gmail.com', 'nielsenaragon@ymail.com'];
    
    if (specialEmails.includes(user.email || '')) {
      console.log("Detected special case user:", user.email);
      return true;
    }
    
    // Check if the user is managed by a special user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('manager_id')
      .eq('id', user.id)
      .single();
      
    if (error || !profile?.manager_id) {
      return false;
    }
    
    // Check if the manager is special
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', profile.manager_id)
      .single();
      
    if (managerProfile && specialEmails.includes(managerProfile.email || '')) {
      console.log("User is managed by special case user:", managerProfile.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in checkSpecialUserCase:", error);
    return false;
  }
};

/**
 * Fetch Momentum teams for the special user case
 */
export const fetchMomentumTeams = async (): Promise<Team[]> => {
  try {
    console.log("Fetching Momentum teams for special user case");
    
    // Get all teams first
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
      
    if (teamsError) {
      console.error("Error fetching all teams:", teamsError);
      return [];
    }
    
    // Filter for Momentum teams
    const momentumTeams = allTeams.filter((team: Team) => 
      team.name.toLowerCase().includes('momentum') || 
      team.name.toLowerCase().includes('capitol') || 
      team.name.toLowerCase().includes('capital')
    );
    
    console.log("Special case: Found Momentum teams:", momentumTeams);
    
    // Get current user to check team membership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return momentumTeams;
    
    // If Momentum teams found, make sure user is a member
    if (momentumTeams.length > 0) {
      // Get all team memberships
      const { data: allMemberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, user_id');
        
      if (!membershipsError && allMemberships) {
        for (const team of momentumTeams) {
          // Check if user is already a member using our client-side data
          const existingMembership = allMemberships.find(
            m => m.team_id === team.id && m.user_id === user.id
          );
          
          if (!existingMembership) {
            console.log(`User not in team ${team.name}, adding...`);
            
            // Determine role based on email
            const isNielsen = user.email === 'nielsenaragon@gmail.com' || user.email === 'nielsenaragon@ymail.com';
            const role = isNielsen ? 'manager_pro_platinum' : 'agent';
            
            // Add user to team
            const { error: insertError } = await supabase
              .from('team_members')
              .insert([{
                team_id: team.id,
                user_id: user.id,
                role: role
              }]);
              
            if (insertError) {
              console.error(`Error adding user to ${team.name}:`, insertError);
            } else {
              console.log(`Added user to ${team.name} with role ${role}`);
            }
          } else {
            console.log(`User already in team ${team.name}`);
          }
        }
      }
    }
    
    // If not found or failed to join, create the team as a fallback
    if (momentumTeams.length === 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        // Determine role based on email
        const isNielsen = user.email === 'nielsenaragon@gmail.com' || user.email === 'nielsenaragon@ymail.com';
        const role = isNielsen ? 'manager_pro_platinum' : 'agent';
        
        // Create new Momentum Capitol team
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert([{ name: 'Momentum Capitol Team' }])
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating Momentum team:", createError);
          return [];
        }
        
        // Add user to the new team
        await supabase
          .from('team_members')
          .insert([{
            team_id: newTeam.id,
            user_id: user.id,
            role: role
          }]);
          
        console.log("Created new Momentum team for special user");
        return [newTeam];
      } catch (createError) {
        console.error("Error in Momentum team fallback creation:", createError);
        return [];
      }
    }
    
    return momentumTeams;
  } catch (error) {
    console.error("Error in fetchMomentumTeams:", error);
    return [];
  }
};

/**
 * Fetch teams through the user's manager
 */
export const fetchTeamsThroughManager = async (managerId: string): Promise<Team[]> => {
  try {
    console.log("Fetching teams through manager:", managerId);
    
    // Check if manager is Nielsen
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', managerId)
      .single();
      
    if (managerProfile && 
        (managerProfile.email === 'nielsenaragon@gmail.com' || 
         managerProfile.email === 'nielsenaragon@ymail.com')) {
      console.log("Manager is Nielsen, fetching Momentum teams");
      return await fetchMomentumTeams();
    }
    
    // Get all teams first
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
      
    if (teamsError) {
      console.error("Error fetching all teams:", teamsError);
      return [];
    }
    
    // Get all team memberships
    const { data: allMemberships, error: membershipsError } = await supabase
      .from('team_members')
      .select('team_id, user_id');
      
    if (membershipsError) {
      console.error("Error fetching all memberships:", membershipsError);
      return [];
    }
    
    // Filter for manager's team memberships
    const managerMemberships = allMemberships.filter(m => m.user_id === managerId);
    
    if (managerMemberships.length === 0) {
      console.log("Manager has no teams");
      return [];
    }
    
    // Get the team IDs
    const teamIds = managerMemberships.map(m => m.team_id);
    
    // Filter the teams
    const managerTeams = allTeams.filter(team => teamIds.includes(team.id));
    
    // If teams are found, ensure the current user is a member
    if (managerTeams && managerTeams.length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("Ensuring user is a member of manager's teams");
        
        for (const team of managerTeams) {
          // Check if user is already a member
          const existingMembership = allMemberships.find(
            m => m.team_id === team.id && m.user_id === user.id
          );
          
          if (!existingMembership) {
            console.log(`Adding user to team ${team.name}`);
            
            // Add user to team
            const { error: insertError } = await supabase
              .from('team_members')
              .insert([{
                team_id: team.id,
                user_id: user.id,
                role: 'agent'
              }]);
              
            if (insertError) {
              console.error(`Error adding user to ${team.name}:`, insertError);
            }
          }
        }
      }
    }
    
    console.log(`Found ${managerTeams.length} teams through manager`);
    return managerTeams as Team[];
  } catch (error) {
    console.error("Error in fetchTeamsThroughManager:", error);
    return [];
  }
};
