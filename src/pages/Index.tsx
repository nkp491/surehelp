import FormContainer from "@/components/FormContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";

interface FormSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

const Index = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  useEffect(() => {
    // Load submissions from localStorage
    const storedSubmissions = localStorage.getItem("formSubmissions");
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Form Repository
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to store your information
          </p>
        </div>
        <FormContainer />
        
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission, index) => (
                    <TableRow key={index}>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.phone || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">{submission.message}</TableCell>
                      <TableCell>{new Date(submission.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {submissions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No submissions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;