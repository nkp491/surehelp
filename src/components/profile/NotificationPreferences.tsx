
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferencesProps {
  preferences: {
    email_notifications: boolean;
    phone_notifications: boolean;
  };
  onUpdate: (preferences: any) => void;
}

const NotificationPreferences = ({
  preferences,
  onUpdate,
}: NotificationPreferencesProps) => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const handleLanguageToggle = async () => {
    try {
      const newLanguage = language === 'en' ? 'es' : 'en';
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Update language in Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: newLanguage })
        .eq('id', userData.user.id);

      if (error) throw error;

      // Toggle language in context
      toggleLanguage();

      toast({
        title: "Language Updated",
        description: "Your language preference has been saved.",
      });
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast({
        title: "Error",
        description: "Failed to update language preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.languageSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="language-toggle">
              {language === 'en' ? 'Español' : 'English'}
            </Label>
            <Switch
              id="language-toggle"
              checked={language === 'es'}
              onCheckedChange={handleLanguageToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.notificationPreferences}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">
              {t.emailNotifications}
            </Label>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) =>
                onUpdate({
                  notification_preferences: {
                    ...preferences,
                    email_notifications: checked
                  }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="phone-notifications">
              {t.phoneNotifications}
            </Label>
            <Switch
              id="phone-notifications"
              checked={preferences.phone_notifications}
              onCheckedChange={(checked) =>
                onUpdate({
                  notification_preferences: {
                    ...preferences,
                    phone_notifications: checked
                  }
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
