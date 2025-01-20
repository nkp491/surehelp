import { AlertCircle, ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const ManagerDashboard = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isBulletinOpen, setIsBulletinOpen] = useState(true);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
          <p className="text-muted-foreground mt-1">View performance metrics and manage your settings</p>
        </div>
      </div>
      
      <Collapsible
        open={isDashboardOpen}
        onOpenChange={setIsDashboardOpen}
        className="max-w-2xl mx-auto"
      >
        <Alert variant="default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Manager Features Coming Soon</AlertTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isDashboardOpen ? (
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
                We're working on new features specifically designed for managers. Stay tuned for updates including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Performance analytics</li>
                <li>Productivity tracking</li>
                <li>Custom reporting tools</li>
                <li>Advanced management features</li>
              </ul>
            </AlertDescription>
          </CollapsibleContent>
        </Alert>
      </Collapsible>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          <p className="text-muted-foreground mt-1">Important updates and communications</p>
        </div>
      </div>

      <Collapsible
        open={isBulletinOpen}
        onOpenChange={setIsBulletinOpen}
        className="max-w-2xl mx-auto"
      >
        <Alert variant="default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <AlertTitle>Communication Features Coming Soon</AlertTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isBulletinOpen ? (
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
                We're developing new communication features. Coming soon:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Important announcements</li>
                <li>Updates sharing</li>
                <li>Direct messaging</li>
                <li>Resource sharing</li>
              </ul>
            </AlertDescription>
          </CollapsibleContent>
        </Alert>
      </Collapsible>
    </div>
  );
};

export default ManagerDashboard;