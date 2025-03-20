
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { TimePicker } from "@/components/ui/time-picker";

interface NotificationPreferencesProps {
  preferences: {
    email_notifications: boolean;
    in_app_notifications: boolean;
    sms_notifications: boolean;
    team_updates: boolean;
    meeting_reminders: boolean;
    performance_updates: boolean;
    system_announcements: boolean;
    role_changes: boolean;
    do_not_disturb: boolean;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
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
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageToggle = async () => {
    try {
      setIsUpdatingLanguage(true);
      await toggleLanguage();
      toast({
        title: language === 'en' ? "Language Updated" : "Idioma Actualizado",
        description: language === 'en' 
          ? "Your language preference has been saved."
          : "Tu preferencia de idioma ha sido guardada.",
      });
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast({
        title: "Error",
        description: language === 'en'
          ? "Failed to update language preference. Please try again."
          : "Error al actualizar el idioma. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const updatePreference = async (key: string, value: any) => {
    try {
      setIsUpdating(true);
      await onUpdate({
        notification_preferences: {
          ...preferences,
          [key]: value
        }
      });
      toast({
        title: t.updateSuccess,
        description: "Notification preferences updated successfully",
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: t.error,
        description: t.updateFailed,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    await updatePreference('quiet_hours', {
      ...preferences.quiet_hours,
      enabled
    });
  };

  const handleQuietHoursChange = async (startOrEnd: 'start' | 'end', value: string) => {
    await updatePreference('quiet_hours', {
      ...preferences.quiet_hours,
      [startOrEnd]: value
    });
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
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Updating language preference...' : 'Actualizando preferencia de idioma...'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.notificationPreferences}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium">Notification Channels</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">
                {t.emailNotifications}
              </Label>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="in-app-notifications">
                {t.inAppNotifications}
              </Label>
              <Switch
                id="in-app-notifications"
                checked={preferences.in_app_notifications}
                onCheckedChange={(checked) => updatePreference('in_app_notifications', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">
                {t.phoneNotifications}
              </Label>
              <Switch
                id="sms-notifications"
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) => updatePreference('sms_notifications', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <Separator className="my-2" />
            
            <h3 className="text-sm font-medium">Notification Categories</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="team-updates">
                {t.teamUpdates}
              </Label>
              <Switch
                id="team-updates"
                checked={preferences.team_updates}
                onCheckedChange={(checked) => updatePreference('team_updates', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="meeting-reminders">
                {t.meetingReminders}
              </Label>
              <Switch
                id="meeting-reminders"
                checked={preferences.meeting_reminders}
                onCheckedChange={(checked) => updatePreference('meeting_reminders', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="performance-updates">
                {t.performanceUpdates}
              </Label>
              <Switch
                id="performance-updates"
                checked={preferences.performance_updates}
                onCheckedChange={(checked) => updatePreference('performance_updates', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="system-announcements">
                {t.systemAnnouncements}
              </Label>
              <Switch
                id="system-announcements"
                checked={preferences.system_announcements}
                onCheckedChange={(checked) => updatePreference('system_announcements', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="role-changes">
                {t.roleChanges}
              </Label>
              <Switch
                id="role-changes"
                checked={preferences.role_changes}
                onCheckedChange={(checked) => updatePreference('role_changes', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <Separator className="my-2" />
            
            <h3 className="text-sm font-medium">Do Not Disturb</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="do-not-disturb">
                {t.doNotDisturb}
              </Label>
              <Switch
                id="do-not-disturb"
                checked={preferences.do_not_disturb}
                onCheckedChange={(checked) => updatePreference('do_not_disturb', checked)}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours">
                {t.quietHours}
              </Label>
              <Switch
                id="quiet-hours"
                checked={preferences.quiet_hours.enabled}
                onCheckedChange={handleQuietHoursToggle}
                disabled={isUpdating}
              />
            </div>
            
            {preferences.quiet_hours.enabled && (
              <div className="flex flex-col space-y-2 pl-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-hours-start" className="mb-1 block text-xs">
                      {t.from}
                    </Label>
                    <input
                      type="time"
                      id="quiet-hours-start"
                      value={preferences.quiet_hours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className="w-full border rounded p-2 text-sm"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-hours-end" className="mb-1 block text-xs">
                      {t.to}
                    </Label>
                    <input
                      type="time"
                      id="quiet-hours-end"
                      value={preferences.quiet_hours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className="w-full border rounded p-2 text-sm"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  You won't receive notifications during these hours
                </p>
              </div>
            )}
          </div>
          
          {isUpdating && (
            <p className="text-sm text-muted-foreground mt-2">Updating preferences...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
