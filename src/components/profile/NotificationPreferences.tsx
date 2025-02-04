import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface NotificationPreferencesProps {
  preferences: {
    email_notifications: boolean;
    phone_notifications: boolean;
  };
  onUpdate: (data: any) => void;
}

const NotificationPreferences = ({
  preferences,
  onUpdate,
}: NotificationPreferencesProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleToggle = (key: string) => {
    onUpdate({
      notification_preferences: {
        ...preferences,
        [key]: !preferences[key as keyof typeof preferences],
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">
          {t.notificationPreferences}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">{t.emailNotifications}</span>
          <Switch
            checked={preferences.email_notifications}
            onCheckedChange={() => handleToggle('email_notifications')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t.phoneNotifications}</span>
          <Switch
            checked={preferences.phone_notifications}
            onCheckedChange={() => handleToggle('phone_notifications')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;