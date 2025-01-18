import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PrivacySettingsProps {
  settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  };
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

const PrivacySettings = ({ settings, onUpdate }: PrivacySettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="showEmail">Show email to others</Label>
          <Switch
            id="showEmail"
            checked={settings.show_email}
            onCheckedChange={(checked) =>
              onUpdate({
                privacy_settings: {
                  ...settings,
                  show_email: checked,
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="showPhone">Show phone number to others</Label>
          <Switch
            id="showPhone"
            checked={settings.show_phone}
            onCheckedChange={(checked) =>
              onUpdate({
                privacy_settings: {
                  ...settings,
                  show_phone: checked,
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="showPhoto">Show profile photo to others</Label>
          <Switch
            id="showPhoto"
            checked={settings.show_photo}
            onCheckedChange={(checked) =>
              onUpdate({
                privacy_settings: {
                  ...settings,
                  show_photo: checked,
                },
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;