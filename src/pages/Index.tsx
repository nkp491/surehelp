import FormContainer from "@/components/FormContainer";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import SubmittedForms from "./SubmittedForms";
import Dashboard from "./Dashboard";
import ManagerDashboard from "./ManagerDashboard";
import MetricButtons from "@/components/MetricButtons";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";

const Index = () => {
  const [metrics, setMetrics] = useState<{[key: string]: number}>({
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedMetrics = localStorage.getItem("businessMetrics_24h");
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
    }
  }, []);

  const updateMetric = (metric: MetricType, increment: boolean) => {
    setMetrics((prev) => {
      const currentValue = prev[metric];
      let newValue;
      
      if (metric === 'ap') {
        newValue = currentValue + (increment ? 100 : -100);
        if (newValue < 0) newValue = 0;
      } else {
        newValue = currentValue + (increment ? 1 : -1);
        if (newValue < 0) newValue = 0;
      }

      const newMetrics = {
        ...prev,
        [metric]: newValue,
      };

      localStorage.setItem("businessMetrics_24h", JSON.stringify(newMetrics));
      toast({
        title: "Metric Updated",
        description: `${metric.toUpperCase()} has been ${increment ? 'increased' : 'decreased'}`,
      });
      return newMetrics;
    });
  };

  const handleSubmissionsClick = () => {
    if (location.pathname === '/submitted-forms') {
      setShowSubmissions(false);
      navigate('/');
    } else {
      setShowSubmissions(true);
      navigate('/submitted-forms');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Business Metrics
            </h1>
            <p className="text-lg text-gray-600">
              Track and manage your key performance indicators
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleSubmissionsClick}>
              View Submissions
            </Button>
            <Link to="/metrics">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to="/manager-dashboard">
              <Button variant="outline">Manager Dashboard</Button>
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

        <Card className="p-6 mb-12 bg-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {Object.entries(metrics).map(([metric, value]) => (
              <MetricButtons
                key={metric}
                metric={metric}
                value={value}
                onIncrement={() => updateMetric(metric as MetricType, true)}
                onDecrement={() => updateMetric(metric as MetricType, false)}
              />
            ))}
          </div>
        </Card>

        <Separator className="my-12" />
        
        <Collapsible
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Client Assessment
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below to store your medical information
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isFormOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle form</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <FormContainer />
          </CollapsibleContent>
        </Collapsible>

        <Routes>
          {showSubmissions && (
            <Route path="/submitted-forms" element={<SubmittedForms />} />
          )}
          <Route path="/metrics" element={<Dashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default Index;