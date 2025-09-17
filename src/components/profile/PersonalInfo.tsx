import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  onUpdate: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }) => void;
}

const PersonalInfo = ({
  firstName,
  lastName,
  email,
  phone,
  onUpdate,
}: PersonalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: firstName || "",
    last_name: lastName || "",
    email: email || "",
    phone: phone || "",
  });

  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [nameErrors, setNameErrors] = useState({ first_name: "", last_name: "" });

  // Validation functions for name fields
  const validateNameField = (value: string, fieldName: 'first_name' | 'last_name') => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setNameErrors(prev => ({ ...prev, [fieldName]: `${fieldName === 'first_name' ? 'First' : 'Last'} name is required` }));
      return false;
    }
    
    if (trimmedValue.length < 2) {
      setNameErrors(prev => ({ ...prev, [fieldName]: `${fieldName === 'first_name' ? 'First' : 'Last'} name must be at least 2 characters long` }));
      return false;
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedValue)) {
      setNameErrors(prev => ({ ...prev, [fieldName]: `${fieldName === 'first_name' ? 'First' : 'Last'} name can only contain letters, spaces, hyphens, and apostrophes` }));
      return false;
    }
    
    setNameErrors(prev => ({ ...prev, [fieldName]: "" }));
    return true;
  };

  const handleNameChange = (field: 'first_name' | 'last_name', value: string) => {
    // Remove any backspace characters and trim whitespace
    const cleanedValue = value.trim();
    
    setFormData(prev => ({
      ...prev,
      [field]: cleanedValue
    }));
    
    // Validate the field
    validateNameField(cleanedValue, field);
  };

  useEffect(() => {
    if (
      firstName !== undefined ||
      lastName !== undefined ||
      email !== undefined ||
      phone !== undefined
    ) {
      setFormData({
        first_name: firstName || "",
        last_name: lastName || "",
        email: email || "",
        phone: phone || "",
      });
    }
  }, [firstName, lastName, email, phone]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name fields before submission
    const isFirstNameValid = validateNameField(formData.first_name, 'first_name');
    const isLastNameValid = validateNameField(formData.last_name, 'last_name');
    
    if (!isFirstNameValid || !isLastNameValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the name field errors before saving.",
        variant: "destructive",
      });
      return;
    }
    
    // Trim the names before updating
    const trimmedFormData = {
      ...formData,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
    };
    
    onUpdate(trimmedFormData);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      onUpdate(formData);
    }
    setIsEditing(!isEditing);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.personalInfo}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
          >
            {isEditing ? t.save : t.edit}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.firstName}
              </label>
              {isEditing ? (
                <>
                  <Input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleNameChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    className="w-full"
                  />
                  {nameErrors.first_name && (
                    <p className="text-xs text-red-500 mt-1">{nameErrors.first_name}</p>
                  )}
                </>
              ) : (
                <Input
                  type="text"
                  value={formData.first_name}
                  placeholder="Enter first name"
                  readOnly
                  className="w-full"
                />
              )}
            </div>
            {/* Last Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.lastName}
              </label>
              {isEditing ? (
                <>
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleNameChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    className="w-full"
                  />
                  {nameErrors.last_name && (
                    <p className="text-xs text-red-500 mt-1">{nameErrors.last_name}</p>
                  )}
                </>
              ) : (
                <Input
                  type="text"
                  value={formData.last_name}
                  placeholder="Enter last name"
                  readOnly
                  className="w-full"
                />
              )}
            </div>
            {/* Email */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <Input
                type="email"
                value={formData.email}
                placeholder="Email is managed by the system"
                readOnly
                disabled
                className="w-full"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">
                {t.phone}
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter phone"
                  className="w-full"
                />
              ) : (
                <Input
                  type="tel"
                  value={formData.phone}
                  placeholder="Enter phone"
                  readOnly
                  className="w-full"
                />
              )}
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit">
                {t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
