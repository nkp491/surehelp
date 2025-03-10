import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface UserRoleProps {
  role: "agent" | "manager" | null;
}

const UserRole = ({ role }: UserRoleProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{t.userRole}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Badge variant={role === "manager" ? "default" : "secondary"} className="text-sm">
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Agent"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRole; 