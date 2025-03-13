
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface UserRoleProps {
  role: "agent" | "manager_pro" | "beta_user" | "manager_pro_gold" | "manager_pro_platinum" | "agent_pro" | null;
}

const UserRole = ({ role }: UserRoleProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  // Function to determine badge variant based on role
  const getBadgeVariant = (role: string | null) => {
    switch(role) {
      case "manager_pro_platinum": return "outline"; // Same variant as gold but with different styling
      case "manager_pro_gold": return "outline"; 
      case "agent_pro": return "outline"; // Custom styling for agent pro
      case "manager_pro": return "default";
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
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    
    // For other roles, just capitalize the first letter
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get premium features based on role
  const getPremiumFeatures = (role: string | null): string[] => {
    switch(role) {
      case "manager_pro_platinum":
        return [
          "Full manager dashboard access",
          "Team performance analytics",
          "Unlimited agent accounts",
          "Premium email support",
          "White-label reporting",
          "Custom API integrations"
        ];
      case "manager_pro_gold":
        return [
          "Full manager dashboard access",
          "Team performance analytics",
          "Up to 20 agent accounts",
          "Premium email support",
          "White-label reporting"
        ];
      case "agent_pro":
        return [
          "Advanced lead tracking",
          "Commission calculator",
          "Performance analytics",
          "Priority support"
        ];
      case "manager_pro":
        return [
          "Basic manager dashboard",
          "Team performance metrics",
          "Up to 5 agent accounts"
        ];
      case "beta_user":
        return ["Early access to new features", "Feedback opportunities"];
      default:
        return ["Basic assessment form access", "Personal metrics tracking"];
    }
  };

  const features = getPremiumFeatures(role);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          {t.userRole}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Your role determines what features you can access</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <Badge 
              variant={getBadgeVariant(role)} 
              className={`text-sm ${
                role === "manager_pro_gold" 
                  ? "border-yellow-500 text-yellow-700 bg-yellow-50" 
                  : role === "manager_pro_platinum" 
                    ? "border-purple-500 text-purple-700 bg-purple-50" 
                    : role === "agent_pro"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : ""
              }`}
            >
              {getRoleDisplay(role)}
            </Badge>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Features included:</h4>
            <ul className="text-sm space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-xs">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRole;
