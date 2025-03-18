
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface PersonalInfoFieldsProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  setFormData: (data: any) => void;
  isEditing: boolean;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export const PersonalInfoFields = ({
  formData,
  setFormData,
  isEditing,
  firstName,
  lastName,
  email,
  phone
}: PersonalInfoFieldsProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <label className="text-sm font-medium text-gray-700">{t.firstName}</label>
          <p className="text-base text-gray-900 pt-1">{firstName || '-'}</p>
        </div>
        <div className="space-y-2.5">
          <label className="text-sm font-medium text-gray-700">{t.lastName}</label>
          <p className="text-base text-gray-900 pt-1">{lastName || '-'}</p>
        </div>
        <div className="space-y-2.5">
          <label className="text-sm font-medium text-gray-700">{t.email}</label>
          <p className="text-base text-gray-900 pt-1">{email || '-'}</p>
        </div>
        <div className="space-y-2.5">
          <label className="text-sm font-medium text-gray-700">{t.phone}</label>
          <p className="text-base text-gray-900 pt-1">{phone || '-'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-gray-700">{t.firstName}</label>
        <Input
          value={formData.first_name}
          onChange={(e) =>
            setFormData({ ...formData, first_name: e.target.value })
          }
          className="w-full"
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-gray-700">{t.lastName}</label>
        <Input
          value={formData.last_name}
          onChange={(e) =>
            setFormData({ ...formData, last_name: e.target.value })
          }
          className="w-full"
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-gray-700">{t.email}</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full"
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-gray-700">{t.phone}</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className="w-full"
        />
      </div>
    </div>
  );
};
