import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { INITIAL_FIELDS } from "./form/FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";

const FormContainer = ({ editingSubmission = null, onUpdate }: { 
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}) => {
  const [sections, setSections] = useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);

  // Initialize form data when editing submission changes
  useEffect(() => {
    if (editingSubmission) {
      // Create a new object with all the fields from editingSubmission
      const submissionData = {
        name: editingSubmission.name || "",
        dob: editingSubmission.dob || "",
        age: editingSubmission.age || "",
        height: editingSubmission.height || "",
        weight: editingSubmission.weight || "",
        tobaccoUse: editingSubmission.tobaccoUse || "no",
        selectedConditions: editingSubmission.selectedConditions || [],
        medicalConditions: editingSubmission.medicalConditions || "",
        hospitalizations: editingSubmission.hospitalizations || "",
        surgeries: editingSubmission.surgeries || "",
        prescriptionMedications: editingSubmission.prescriptionMedications || "",
        lastMedicalExam: editingSubmission.lastMedicalExam || "",
        familyMedicalConditions: editingSubmission.familyMedicalConditions || "",
        employmentStatus: editingSubmission.employmentStatus || [],
        occupation: editingSubmission.occupation || "",
        selectedInvestments: editingSubmission.selectedInvestments || [],
        socialSecurityIncome: editingSubmission.socialSecurityIncome || "",
        pensionIncome: editingSubmission.pensionIncome || "",
        survivorshipIncome: editingSubmission.survivorshipIncome || "",
        totalIncome: editingSubmission.totalIncome || "",
        expenses: editingSubmission.expenses || "",
        lifeInsuranceAmount: editingSubmission.lifeInsuranceAmount || "",
        rentOrMortgage: editingSubmission.rentOrMortgage || "",
        remainingBalance: editingSubmission.remainingBalance || "",
        yearsLeft: editingSubmission.yearsLeft || "",
        homeValue: editingSubmission.homeValue || "",
        equity: editingSubmission.equity || "",
        phone: editingSubmission.phone || "",
        email: editingSubmission.email || "",
        address: editingSubmission.address || "",
        notes: editingSubmission.notes || "",
        followUpNotes: editingSubmission.followUpNotes || "",
        coverageOptions: editingSubmission.coverageOptions || "",
        emergencyContact: editingSubmission.emergencyContact || "",
        beneficiaries: editingSubmission.beneficiaries || "",
        sourcedFrom: editingSubmission.sourcedFrom || "",
        leadType: editingSubmission.leadType || "",
        premium: editingSubmission.premium || "",
        effectiveDate: editingSubmission.effectiveDate || "",
        draftDay: editingSubmission.draftDay || "",
        coverageAmount: editingSubmission.coverageAmount || "",
        accidental: editingSubmission.accidental || "",
        carrierAndProduct: editingSubmission.carrierAndProduct || "",
        policyNumber: editingSubmission.policyNumber || "",
      };
      setFormData(submissionData);
    }
  }, [editingSubmission, setFormData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const allFields = sections.flatMap(section => section.fields);
      const newFields = arrayMove(
        allFields,
        allFields.findIndex(item => item.id === active.id),
        allFields.findIndex(item => item.id === over.id)
      );
      
      const newSections = sections.map(section => ({
        ...section,
        fields: newFields.filter(field => 
          section.fields.some(originalField => originalField.id === field.id)
        )
      }));
      
      setSections(newSections);
    }
  };

  const handleOutcomeSubmit = (outcome: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as any, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-7xl mx-auto p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.flatMap(section => section.fields).map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <div key={section.section} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.section}</h2>
                <div className="space-y-4">
                  {section.fields.map((field) => (
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
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl mx-auto">
        <Button 
          onClick={handleOutcomeSubmit('protected')}
          className="bg-green-600 hover:bg-green-700"
        >
          Protected
        </Button>
        <Button 
          onClick={handleOutcomeSubmit('follow-up')}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Follow-Up
        </Button>
        <Button 
          onClick={handleOutcomeSubmit('declined')}
          className="bg-red-600 hover:bg-red-700"
        >
          Declined
        </Button>
      </div>
    </form>
  );
};

export default FormContainer;