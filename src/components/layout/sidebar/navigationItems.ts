
import { LucideIcon, ClipboardList, LayoutDashboard, Users2, Shield, DollarSign, BookOpen } from "lucide-react";

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
  },
  {
    title: "Client Book of Business",
    path: "/submitted-forms",
    icon: BookOpen,
  },
  {
    title: "KPI Insights",
    path: "/metrics",
    icon: LayoutDashboard,
  },
  {
    title: "Commission Tracker",
    path: "/commission-tracker",
    icon: DollarSign,
    requiredRoles: ["agent_pro", "manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "Team",
    path: "/manager-dashboard",
    icon: Users2,
    requiredRoles: ["manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
  {
    title: "Role Management",
    path: "/role-management",
    icon: Shield,
    requiredRoles: ["manager_pro", "manager_pro_gold", "manager_pro_platinum", "beta_user"],
  },
];
