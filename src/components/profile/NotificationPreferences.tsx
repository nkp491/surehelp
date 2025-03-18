
import { useState } from "react";
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
  onUpdate: (preferences: any) => Promise<void>;
}

const NotificationPreferences = ({
  preferences,
  onUpdate,
}: NotificationPreferencesProps) => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const handleLanguageToggle = async () => {
    try {
      setIsUpdatingLanguage(true);
      const newLanguage = language === 'en' ? 'es' : 'en';
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Update language in Supabase profiles table - removed the join with user_roles
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: newLanguage })
        .eq('id', user.id);

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
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handleEmailNotificationsToggle = async (checked: boolean) => {
    try {
      setIsUpdatingEmail(true);
      await onUpdate({
        notification_preferences: {
          ...preferences,
          email_notifications: checked
        }
      });
      toast({
        title: "Preferences Updated",
        description: "Email notification preferences saved.",
      });
    } catch (error) {
      console.error('Error updating email notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update email notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePhoneNotificationsToggle = async (checked: boolean) => {
    try {
      setIsUpdatingPhone(true);
      await onUpdate({
        notification_preferences: {
          ...preferences,
          phone_notifications: checked
        }
      });
      toast({
        title: "Preferences Updated",
        description: "Phone notification preferences saved.",
      });
    } catch (error) {
      console.error('Error updating phone notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update phone notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPhone(false);
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
              disabled={isUpdatingLanguage}
            />
          </div>
          {isUpdatingLanguage && (
            <p className="text-sm text-gray-500">Updating language preference...</p>
          )}
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
              onCheckedChange={handleEmailNotificationsToggle}
              disabled={isUpdatingEmail}
            />
          </div>
          {isUpdatingEmail && (
            <p className="text-sm text-gray-500">Updating email preferences...</p>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="phone-notifications">
              {t.phoneNotifications}
            </Label>
            <Switch
              id="phone-notifications"
              checked={preferences.phone_notifications}
              onCheckedChange={handlePhoneNotificationsToggle}
              disabled={isUpdatingPhone}
            />
          </div>
          {isUpdatingPhone && (
            <p className="text-sm text-gray-500">Updating phone preferences...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
