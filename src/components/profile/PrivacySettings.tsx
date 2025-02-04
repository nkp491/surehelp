import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface PrivacySettingsProps {
  settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  };
  onUpdate: (data: any) => void;
}

const PrivacySettings = ({ settings, onUpdate }: PrivacySettingsProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleToggle = (key: string) => {
    onUpdate({
      privacy_settings: {
        ...settings,
        [key]: !settings[key as keyof typeof settings],
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">{t.privacySettings}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">{t.showEmail}</span>
          <Switch
            checked={settings.show_email}
            onCheckedChange={() => handleToggle('show_email')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t.showPhone}</span>
          <Switch
            checked={settings.show_phone}
            onCheckedChange={() => handleToggle('show_phone')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{t.showPhoto}</span>
          <Switch
            checked={settings.show_photo}
            onCheckedChange={() => handleToggle('show_photo')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;