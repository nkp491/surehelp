import FormContainer from "@/components/FormContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Plus } from "lucide-react";

interface FormSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

interface CounterHistory {
  date: string;
  count: number;
}

const Index = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [count, setCount] = useState(0);
  const [counterHistory, setCounterHistory] = useState<CounterHistory[]>([]);

  useEffect(() => {
    // Load submissions from localStorage
    const storedSubmissions = localStorage.getItem("formSubmissions");
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }

    // Load counter history from localStorage
    const storedHistory = localStorage.getItem("counterHistory");
    if (storedHistory) {
      setCounterHistory(JSON.parse(storedHistory));
    }
  }, []);

  const scrollToSubmissions = () => {
    document.getElementById('submissions-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIncrement = () => {
    setCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Update counter history
      const today = new Date().toISOString().split('T')[0];
      setCounterHistory(prev => {
        const existingEntry = prev.find(entry => entry.date === today);
        let newHistory;
        
        if (existingEntry) {
          newHistory = prev.map(entry =>
            entry.date === today ? { ...entry, count: entry.count + 1 } : entry
          );
        } else {
          newHistory = [...prev, { date: today, count: 1 }];
        }
        
        // Save to localStorage
        localStorage.setItem("counterHistory", JSON.stringify(newHistory));
        return newHistory;
      });

      return newCount;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Form Repository
            </h1>
            <p className="text-lg text-gray-600">
              Fill out the form below to store your information
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-md border">
              <Button
                onClick={handleIncrement}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Count: {count}
              </Button>
            </div>
            <Button
              onClick={scrollToSubmissions}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Database className="h-4 w-4" />
              View Submissions ({submissions.length})
            </Button>
          </div>
        </div>
        
        <FormContainer />
        
        <div id="submissions-section" className="mt-16 space-y-8">
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

          <Card>
            <CardHeader>
              <CardTitle>Counter History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counterHistory.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {counterHistory.length === 0 && (
                <p className="text-center text-gray-500 py-8">No counter history yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;