
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettingsProps {
  settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  };
  onUpdate: (data: any) => Promise<void>;
}

const PrivacySettings = ({ settings, onUpdate }: PrivacySettingsProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [updatingSettings, setUpdatingSettings] = useState<Record<string, boolean>>({
    show_email: false,
    show_phone: false,
    show_photo: false
  });

  const handleToggle = async (key: string) => {
    try {
      setUpdatingSettings(prev => ({ ...prev, [key]: true }));
      
      const updatedSettings = {
        ...settings,
        [key]: !settings[key as keyof typeof settings],
      };
      
      await onUpdate({
        privacy_settings: updatedSettings,
      });
      
      toast({
        title: "Privacy Settings Updated",
        description: `Your privacy settings have been updated.`,
      });
    } catch (error) {
      console.error(`Error updating ${key} setting:`, error);
      toast({
        title: "Error",
        description: `Failed to update privacy settings. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUpdatingSettings(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{t.privacySettings}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">{t.showEmail}</span>
          <Switch
            checked={settings.show_email}
            onCheckedChange={() => handleToggle('show_email')}
            disabled={updatingSettings.show_email}
          />
          {updatingSettings.show_email && (
            <span className="text-xs text-gray-500 ml-2">Updating...</span>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">{t.showPhone}</span>
          <Switch
            checked={settings.show_phone}
            onCheckedChange={() => handleToggle('show_phone')}
            disabled={updatingSettings.show_phone}
          />
          {updatingSettings.show_phone && (
            <span className="text-xs text-gray-500 ml-2">Updating...</span>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">{t.showPhoto}</span>
          <Switch
            checked={settings.show_photo}
            onCheckedChange={() => handleToggle('show_photo')}
            disabled={updatingSettings.show_photo}
          />
          {updatingSettings.show_photo && (
            <span className="text-xs text-gray-500 ml-2">Updating...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
