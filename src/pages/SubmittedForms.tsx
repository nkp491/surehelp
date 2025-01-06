import SubmissionsTable from "@/components/SubmissionsTable";
import { FormSubmission } from "@/types/form";
import { useState, useEffect } from "react";

const SubmittedForms = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);

  useEffect(() => {
    try {
      const storedSubmissions = localStorage.getItem("formSubmissions");
      if (storedSubmissions) {
        setSubmissions(JSON.parse(storedSubmissions));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  const handleEdit = (submission: FormSubmission) => {
    setEditingSubmission(submission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Submitted Forms</h1>
      <SubmissionsTable 
        submissions={submissions}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default SubmittedForms;