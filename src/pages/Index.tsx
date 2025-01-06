import FormContainer from "@/components/FormContainer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, ExternalLink } from "lucide-react";
import { FormSubmission } from "@/types/form";
import SubmissionsTable from "@/components/SubmissionsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessMetrics from "@/components/BusinessMetrics";

const Index = () => {
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

  const scrollToSubmissions = () => {
    document.getElementById('submissions-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEdit = (submission: FormSubmission) => {
    setEditingSubmission(submission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormUpdate = (updatedSubmission: FormSubmission) => {
    const updatedSubmissions = submissions.map(sub => 
      sub.timestamp === updatedSubmission.timestamp ? updatedSubmission : sub
    );
    setSubmissions(updatedSubmissions);
    localStorage.setItem("formSubmissions", JSON.stringify(updatedSubmissions));
    setEditingSubmission(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-12">
        <Tabs defaultValue="client-tracker" className="w-full mb-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="client-tracker" className="flex-1">Client Tracker</TabsTrigger>
            <TabsTrigger value="commissions-tracker" className="flex-1">Commissions Tracker</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client-tracker">
            <BusinessMetrics />
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Client Assessment
                </h1>
                <p className="text-lg text-gray-600">
                  Fill out the form below to store your medical information
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={scrollToSubmissions}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Database className="h-4 w-4" />
                  View Submissions ({submissions.length})
                </Button>
                <Button
                  onClick={() => window.open('https://insurancetoolkits.com/login', '_blank')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Toolkits
                </Button>
              </div>
            </div>
            
            <FormContainer 
              editingSubmission={editingSubmission} 
              onUpdate={handleFormUpdate}
            />
            
            <div id="submissions-section" className="mt-16">
              <SubmissionsTable 
                submissions={submissions}
                onEdit={handleEdit}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="commissions-tracker">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-700">Commissions Tracker</h2>
              <p className="text-gray-500 mt-2">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;