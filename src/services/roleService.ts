import { supabase } from "@/integrations/supabase/client";
import { SubscriptionRoles } from "@/types/agent";

const ROLES_STORAGE_KEY = "user_roles";
const NON_SUBSCRIBED_ROLES_KEY = "non_subscribed_roles";

export const roleService = {
  getRoles(): string[] {
    const roles = localStorage.getItem(ROLES_STORAGE_KEY);
    return roles ? JSON.parse(roles) : [];
  },
  saveRoles(roles: string[]) {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  },
  clearRoles() {
    localStorage.removeItem(ROLES_STORAGE_KEY);
    localStorage.removeItem(NON_SUBSCRIBED_ROLES_KEY);
  },
  clearNonSubscribedRoles() {
    localStorage.removeItem(NON_SUBSCRIBED_ROLES_KEY);
  },
  saveNonSubscribedRoles(roles: string[]) {
    localStorage.setItem(NON_SUBSCRIBED_ROLES_KEY, JSON.stringify(roles));
  },
  getNonSubscribedRoles(): string[] {
    const roles = localStorage.getItem(NON_SUBSCRIBED_ROLES_KEY);
    return roles ? JSON.parse(roles) : [];
  },


  async fetchAndSaveRoles(): Promise<{ roles: string[]; hasRoles: boolean, nonSubscribedRoles?: string[] }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        this.clearRoles();
        return { roles: [], hasRoles: false };
      }

      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching roles:", error);
        return { roles: [], hasRoles: false };
      }

      const {data: subscribedRoles, error: subscribedRolesError} = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("user_id", user.id);  
      if (subscribedRolesError) {
        console.error("Error fetching subscribed roles:", subscribedRolesError);
      }

      const roles = userRoles?.map((r) => r.role) || [];
      const subscribedPlanIds = new Set(subscribedRoles?.map((s) => s.plan_id) || []);

      const nonSubscribedRoles: string[] = [];
      let validRoles: string[] = [];
      if (!roles.includes("system_admin")) {
      for (const role of roles) {
        if (SubscriptionRoles.includes(role)) {
          if (subscribedPlanIds.has(role)) {
            validRoles.push(role);
          } else {
            nonSubscribedRoles.push(role);
          }
        } else {
          validRoles.push(role);
        }
      }
      } else {
        validRoles = roles
      }

      const hasRoles = validRoles.length > 0;

      if (hasRoles) {
        this.saveRoles(validRoles);
      } else {
        this.clearRoles();
      }
      if (!roles.includes("system_admin") && nonSubscribedRoles.length > 0) {
        this.saveNonSubscribedRoles(nonSubscribedRoles);
      } else {
        this.clearNonSubscribedRoles();
      }

      return { roles : validRoles, hasRoles, nonSubscribedRoles };
    } catch (error) {
      console.error("Error fetching roles:", error);
      return { roles: [], hasRoles: false, nonSubscribedRoles: [] };
    }
  },
};
