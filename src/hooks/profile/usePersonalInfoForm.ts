
import { useState, useEffect } from "react";

interface PersonalInfoFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export const usePersonalInfoForm = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
  phone: string | null | undefined
) => {
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    first_name: firstName || '',
    last_name: lastName || '',
    email: email || '',
    phone: phone || ''
  });

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

  return { formData, setFormData };
};
