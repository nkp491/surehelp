
import { LucideIcon, ClipboardList, LayoutDashboard, Users2, Shield, DollarSign, BookOpen, UserCog, Settings } from "lucide-react";

export type NavigationItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  requiredRoles?: string[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Client Assessment Form",
    path: "/assessment",
    icon: ClipboardList,
    requiredRoles: ["agent", "agent_pro", "manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "Client Book of Business",
    path: "/submitted-forms",
    icon: BookOpen,
    requiredRoles: ["agent", "agent_pro", "manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "KPI Insights",
    path: "/metrics",
    icon: LayoutDashboard,
    requiredRoles: ["agent", "agent_pro", "manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "Commission Tracker",
    path: "/commission-tracker",
    icon: DollarSign,
    requiredRoles: ["agent_pro", "manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "Team",
    path: "/team",
    icon: Users2,
    requiredRoles: ["manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user", "system_admin"],
  },
  {
    title: "Team Dashboard",
    path: "/manager-dashboard",
    icon: UserCog,
    requiredRoles: ["manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "Role Management",
    path: "/role-management",
    icon: Shield,
    requiredRoles: ["system_admin"],
  },
  {
    title: "Admin Actions",
    path: "/admin",
    icon: Settings,
    requiredRoles: ["system_admin"],
  }
];
