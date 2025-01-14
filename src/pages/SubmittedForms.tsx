import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import SubmissionsTable from "@/components/SubmissionsTable";
import FormContainer from "@/components/FormContainer";
import { useToast } from "@/components/ui/use-toast";

const SubmittedForms = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    try {
      const storedSubmissions = localStorage.getItem("formSubmissions");
      if (storedSubmissions) {
        setSubmissions(JSON.parse(storedSubmissions));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (submission: FormSubmission) => {
    console.log("Editing submission:", submission);
    setEditingSubmission(submission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = (updatedSubmission: FormSubmission) => {
    console.log("Updated submission:", updatedSubmission);
    loadSubmissions();
    setEditingSubmission(null);
    toast({
      title: "Success",
      description: "Submission updated successfully",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-[#2A6F97]">Submitted Forms</h1>
      
      {editingSubmission && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#2A6F97]">Edit Submission</h2>
          <FormContainer 
            editingSubmission={editingSubmission} 
            onUpdate={handleUpdate}
          />
        </div>
      )}

      <SubmissionsTable 
        submissions={submissions}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default SubmittedForms;