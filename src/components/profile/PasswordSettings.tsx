import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PasswordSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  const handleResetPassword = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('No email address found');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: t.passwordResetEmailSent,
        description: t.passwordResetEmailDescription,
      });
    } catch (error) {
      console.error('Error initiating password reset:', error);
      toast({
        title: t.error,
        description: t.passwordResetError,
        variant: "destructive",
      });
    }
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

export default PasswordSettings; 