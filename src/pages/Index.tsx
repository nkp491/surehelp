import FormContainer from "@/components/FormContainer";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Routes, Route } from "react-router-dom";
import SubmittedForms from "./SubmittedForms";
import MetricsVisualization from "./MetricsVisualization";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-12">
        <Tabs defaultValue="client-tracker" className="w-full mb-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="client-tracker" className="flex-1">Client Tracker</TabsTrigger>
            <TabsTrigger value="commissions-tracker" className="flex-1">Commissions Tracker</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client-tracker">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Client Assessment
                </h1>
                <p className="text-lg text-gray-600">
                  Fill out the form below to store your medical information
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/submitted-forms">
                  <Button variant="outline">View Submissions</Button>
                </Link>
                <Link to="/metrics">
                  <Button variant="outline">View Metrics</Button>
                </Link>
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
            
            <FormContainer />

            <Routes>
              <Route path="/submitted-forms" element={<SubmittedForms />} />
              <Route path="/metrics" element={<MetricsVisualization />} />
            </Routes>
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