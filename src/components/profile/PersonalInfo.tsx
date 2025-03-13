
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

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
  const [formData, setFormData] = useState({
    first_name: firstName || '',
    last_name: lastName || '',
    email: email || '',
    phone: phone || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { toast } = useToast();

  const { language } = useLanguage();
  const t = translations[language];

  // Update form data when props change
  useEffect(() => {
    if (firstName !== undefined || lastName !== undefined || email !== undefined || phone !== undefined) {
      setFormData({
        first_name: firstName || '',
        last_name: lastName || '',
        email: email || '',
        phone: phone || ''
      });
    }
  }, [firstName, lastName, email, phone]);

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
    
    // Prevent double submission
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Log the data being submitted
      console.log("Submitting personal info:", formData);
      
      // Compare with previous data to see what's changed
      console.log("Previous data:", { firstName, lastName, email, phone });
      console.log("Has first_name changed?", formData.first_name !== firstName);
      console.log("Has last_name changed?", formData.last_name !== lastName);
      
      // Call the update function
      await onUpdate(formData);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success state
      setUpdateSuccess(true);
      
      // Show success toast
      toast({
        title: t.updateSuccess || "Success",
        description: t.personalInfoUpdated || "Personal information updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: t.error || "Error",
        description: t.updateFailed || "Failed to update personal information. Please try again.",
        variant: "destructive",
      });
      // Still exit edit mode even if there's an error
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      handleSubmit(new Event('submit') as any);
    } else {
      setIsEditing(true);
      // Clear success state when entering edit mode
      setUpdateSuccess(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">{t.personalInfo}</CardTitle>
        <div className="flex items-center space-x-2">
          {updateSuccess && !isEditing && (
            <div className="flex items-center text-green-600 text-sm mr-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>{t.savedSuccessfully || "Saved"}</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={isEditing ? handleSubmit : handleToggleEdit}
            disabled={isSubmitting}
            className="px-4"
          >
            {isEditing ? (isSubmitting ? t.saving || "Saving..." : t.save) : t.edit}
          </Button>
        </div>
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t.saving || "Saving..." : t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
