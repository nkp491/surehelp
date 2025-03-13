
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  onUpdate: (data: any) => void;
}

const PersonalInfo = ({
  firstName,
  lastName,
  email,
  phone,
  onUpdate
}: PersonalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: firstName || '',
    last_name: lastName || '',
    email: email || '',
    phone: phone || ''
  });

  const { language } = useLanguage();
  const t = translations[language];

  // Update form data when props change
  useEffect(() => {
    setFormData({
      first_name: firstName || '',
      last_name: lastName || '',
      email: email || '',
      phone: phone || ''
    });
  }, [firstName, lastName, email, phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      onUpdate(formData);
    }
    setIsEditing(!isEditing);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">{t.personalInfo}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleEdit}
          className="px-4"
        >
          {isEditing ? t.save : t.edit}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.firstName}</label>
              {isEditing ? (
                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{firstName || '-'}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.lastName}</label>
              {isEditing ? (
                <Input
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{lastName || '-'}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.email}</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{email || '-'}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.phone}</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{phone || '-'}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit">{t.save}</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
