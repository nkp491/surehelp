import { AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const ManagerDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your team and view performance metrics</p>
        </div>
      </div>
      
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="max-w-2xl mx-auto"
      >
        <Alert variant="default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Team Account Required</AlertTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle content</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <AlertDescription className="mt-4">
              <p className="mb-4">
                The Manager Dashboard is exclusively available to Team Account holders. Upgrade to unlock powerful features including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Team performance analytics</li>
                <li>Agent productivity tracking</li>
                <li>Custom reporting tools</li>
                <li>Team collaboration features</li>
              </ul>
              <Button 
                onClick={() => window.open('https://example.com/upgrade', '_blank')}
                className="mt-2"
              >
                Upgrade to Team Account
              </Button>
            </AlertDescription>
          </CollapsibleContent>
        </Alert>
      </Collapsible>
    </div>
  );
};

export default ManagerDashboard;