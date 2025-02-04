import React from "react";
import HealthMetrics from "./health/HealthMetrics";
import MedicalConditions from "./health/MedicalConditions";
import DetailedHistory from "./health/DetailedHistory";
import HealthHistory from "./health/HealthHistory";
import PersonalInfo from "./health/PersonalInfo";

interface PrimaryHealthProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
}

const PrimaryHealth = ({ formData, setFormData, errors }: PrimaryHealthProps) => {
  return (
    <div className="space-y-6">
      <PersonalInfo formData={formData} setFormData={setFormData} errors={errors} />
      <HealthMetrics formData={formData} setFormData={setFormData} errors={errors} />
      <HealthHistory formData={formData} setFormData={setFormData} />
      <MedicalConditions formData={formData} setFormData={setFormData} />
      <DetailedHistory formData={formData} setFormData={setFormData} />
    </div>
  );
};

export default PrimaryHealth;