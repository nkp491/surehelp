
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const PersonalInfo = ({
  firstName,
  lastName,
  email,
  phone,
  managerId,
  onUpdate
}: PersonalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: firstName || '',
    last_name: lastName || '',
    email: email || '',
    phone: phone || '',
    manager_id: managerId || ''
  });

  const { language } = useLanguage();
  const t = translations[language];

  // Fetch managers for selection
  const { data: managers, isLoading: loadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isEditing, // Only fetch when editing
  });

  // Update form data when props change
  useEffect(() => {
    if (firstName !== undefined || lastName !== undefined || email !== undefined || phone !== undefined || managerId !== undefined) {
      setFormData({
        first_name: firstName || '',
        last_name: lastName || '',
        email: email || '',
        phone: phone || '',
        manager_id: managerId || ''
      });
    }
  }, [firstName, lastName, email, phone, managerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      console.log("Saving data via toggle:", formData);
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
            {/* Manager selection field */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Your Manager</label>
              {isEditing ? (
                <Select
                  value={formData.manager_id}
                  onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                  disabled={loadingManagers}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingManagers ? "Loading managers..." : "Select your manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {managers?.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.first_name} {manager.last_name} {manager.email ? `(${manager.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {managers?.find(m => m.id === managerId) 
                    ? `${managers.find(m => m.id === managerId)?.first_name} ${managers.find(m => m.id === managerId)?.last_name}`
                    : (managerId ? 'Loading manager details...' : 'None assigned')}
                </p>
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
