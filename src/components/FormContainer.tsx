import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { differenceInYears, parse } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableFormField from "./DraggableFormField";
import { FormSubmission } from "@/types/form";

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}

interface FormContainerProps {
  editingSubmission: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const INITIAL_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "Name", required: true },
  { id: "dob", type: "date", label: "Date of Birth", required: true },
  { id: "age", type: "text", label: "Age" },
  { id: "height", type: "text", label: "Height", placeholder: "Enter your height" },
  { id: "weight", type: "text", label: "Weight", placeholder: "Enter your weight" },
  { id: "tobaccoUse", type: "tobaccoUse", label: "Tobacco Use" },
  { id: "selectedConditions", type: "medicalConditions", label: "Medical Conditions" },
  { id: "medicalConditions", type: "text", label: "Other Medical Conditions", placeholder: "Enter any other medical conditions" },
  { id: "hospitalizations", type: "text", label: "Hospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "surgeries", type: "text", label: "Surgeries", placeholder: "Enter any surgeries" },
  { id: "prescriptionMedications", type: "textarea", label: "Prescription Medications", placeholder: "Enter your prescription medications" },
  { id: "lastMedicalExam", type: "date", label: "Last Medical Exam" },
  { id: "familyMedicalConditions", type: "textarea", label: "Family Medical Conditions", placeholder: "Enter family medical conditions" },
];

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dob: "",
    age: "",
    height: "",
    weight: "",
    tobaccoUse: "no",
    selectedConditions: [],
    medicalConditions: "",
    hospitalizations: "",
    surgeries: "",
    prescriptionMedications: "",
    lastMedicalExam: "",
    familyMedicalConditions: "",
  });
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (editingSubmission) {
      setFormData(editingSubmission);
    }
  }, [editingSubmission]);

  useEffect(() => {
    if (formData.dob) {
      const birthDate = parse(formData.dob, 'yyyy-MM-dd', new Date());
      const age = differenceInYears(new Date(), birthDate);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dob]);

  const validateForm = () => {
    const newErrors: Partial<FormSubmission> = {};
    
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (editingSubmission) {
        onUpdate?.({
          ...formData,
          timestamp: editingSubmission.timestamp
        });
        
        toast({
          title: "Success!",
          description: "Your form has been updated successfully.",
        });
      } else {
        const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        const newSubmission = { ...formData, timestamp: new Date().toISOString() };
        submissions.push(newSubmission);
        localStorage.setItem("formSubmissions", JSON.stringify(submissions));
        
        toast({
          title: "Success!",
          description: "Your form has been submitted successfully.",
        });
      }
      
      setFormData({
        name: "",
        dob: "",
        age: "",
        height: "",
        weight: "",
        tobaccoUse: "no",
        selectedConditions: [],
        medicalConditions: "",
        hospitalizations: "",
        surgeries: "",
        prescriptionMedications: "",
        lastMedicalExam: "",
        familyMedicalConditions: "",
      });
    } else {
      toast({
        title: "Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {fields.map((field) => (
              <DraggableFormField
                key={field.id}
                id={field.id}
                fieldType={field.type}
                label={field.label}
                value={formData[field.id as keyof FormSubmission]}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, [field.id]: value }))
                }
                placeholder={field.placeholder}
                required={field.required}
                error={errors[field.id as keyof FormSubmission]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <Button type="submit" className="w-full">
        {editingSubmission ? "Update Form" : "Submit Form"}
      </Button>
    </form>
  );
};

export default FormContainer;
