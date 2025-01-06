import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FormField from "./FormField";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp?: string;
}

interface FormContainerProps {
  editingSubmission: FormData | null;
  onUpdate?: (submission: FormData) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (editingSubmission) {
      setFormData(editingSubmission);
    }
  }, [editingSubmission]);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.message) {
      newErrors.message = "Message is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (editingSubmission) {
        // Update existing submission
        onUpdate?.({
          ...formData,
          timestamp: editingSubmission.timestamp
        });
        
        toast({
          title: "Success!",
          description: "Your form has been updated successfully.",
        });
      } else {
        // Store new submission in localStorage
        const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        const newSubmission = { ...formData, timestamp: new Date().toISOString() };
        submissions.push(newSubmission);
        localStorage.setItem("formSubmissions", JSON.stringify(submissions));
        
        toast({
          title: "Success!",
          description: "Your form has been submitted successfully.",
        });
      }
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } else {
      toast({
        title: "Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
      <FormField
        label="Name"
        type="text"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        placeholder="Enter your name"
        required
        error={errors.name}
      />
      
      <FormField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => setFormData({ ...formData, email: value })}
        placeholder="Enter your email"
        required
        error={errors.email}
      />
      
      <FormField
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(value) => setFormData({ ...formData, phone: value })}
        placeholder="Enter your phone number (optional)"
      />
      
      <FormField
        label="Message"
        type="text"
        value={formData.message}
        onChange={(value) => setFormData({ ...formData, message: value })}
        placeholder="Enter your message"
        required
        error={errors.message}
      />
      
      <Button type="submit" className="w-full">
        {editingSubmission ? "Update Form" : "Submit Form"}
      </Button>
    </form>
  );
};

export default FormContainer;