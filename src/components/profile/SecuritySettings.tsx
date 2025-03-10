import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/components/ui/use-toast";

const SecuritySettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  const handleResetPassword = () => {
    toast({
      title: "Coming soon",
      description: "Password reset functionality will be available soon.",
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{t.securitySettings}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-700">{t.password}</h3>
          <p className="text-sm text-gray-500">{t.passwordDescription}</p>
          <Button 
            variant="outline" 
            onClick={handleResetPassword}
            className="w-fit"
          >
            {t.resetPassword}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings; 