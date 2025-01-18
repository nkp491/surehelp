import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Profile } from "@/types/profile";

interface NotificationPreferencesProps {
  preferences: {
    email_notifications: boolean;
    phone_notifications: boolean;
  };
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

const NotificationPreferences = ({ preferences, onUpdate }: NotificationPreferencesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">Email notifications</Label>
          <Switch
            id="emailNotifications"
            checked={preferences.email_notifications}
            onCheckedChange={(checked) =>
              onUpdate({
                notification_preferences: {
                  ...preferences,
                  email_notifications: checked,
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="phoneNotifications">Phone notifications</Label>
          <Switch
            id="phoneNotifications"
            checked={preferences.phone_notifications}
            onCheckedChange={(checked) =>
              onUpdate({
                notification_preferences: {
                  ...preferences,
                  phone_notifications: checked,
                },
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;