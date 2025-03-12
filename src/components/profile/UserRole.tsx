
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface UserRoleProps {
  role: "agent" | "manager" | "beta_user" | "manager_pro_gold" | null;
}

const UserRole = ({ role }: UserRoleProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  // Function to determine badge variant based on role
  const getBadgeVariant = (role: string | null) => {
    switch(role) {
      case "manager_pro_gold": return "outline"; // New gold outline variant
      case "manager": return "default";
      case "beta_user": return "destructive";
      default: return "secondary";
    }
  };

  // Format the role display text with proper capitalization
  const getRoleDisplay = (role: string | null) => {
    if (!role) return "Agent";
    
    // Special cases for multi-word roles
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    
    // For other roles, just capitalize the first letter
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{t.userRole}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Badge variant={getBadgeVariant(role)} className={`text-sm ${role === "manager_pro_gold" ? "border-yellow-500 text-yellow-700 bg-yellow-50" : ""}`}>
            {getRoleDisplay(role)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRole;
