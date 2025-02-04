import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

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
              onCheckedChange={() => {
                toggleLanguage();
                // Force a re-render of the entire app to ensure language changes are applied
                window.dispatchEvent(new Event('languageChange'));
              }}
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