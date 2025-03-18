
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { usePersonalInfoForm } from "@/hooks/profile/usePersonalInfoForm";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { UpdateSuccessMessage } from "./UpdateSuccessMessage";

interface PersonalInfoProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  onUpdate: (data: any) => Promise<void>;
}

const PersonalInfo = ({
  firstName,
  lastName,
  email,
  phone,
  onUpdate
}: PersonalInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  
  const { formData, setFormData } = usePersonalInfoForm(firstName, lastName, email, phone);

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer: number;
    if (updateSuccess) {
      timer = window.setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [updateSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onUpdate(formData);
      setIsEditing(false);
      setUpdateSuccess(true);
      toast({
        title: t.updateSuccess,
        description: t.personalInfoUpdated,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: t.error,
        description: t.updateFailed,
        variant: "destructive",
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSubmit(new Event('submit') as any);
    } else {
      setIsEditing(true);
      setUpdateSuccess(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">
          {t.personalInfo}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <UpdateSuccessMessage show={updateSuccess && !isEditing} />
          <Button
            variant="outline"
            size="sm"
            onClick={isEditing ? handleSubmit : handleToggleEdit}
            disabled={isSubmitting}
            className="px-4"
          >
            {isEditing ? (isSubmitting ? t.saving : t.save) : t.edit}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <PersonalInfoFields
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
          />
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t.saving : t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
