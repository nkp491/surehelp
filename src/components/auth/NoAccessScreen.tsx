
import { Button } from "@/components/ui/button";
import { Shield, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NoAccessScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <Shield className="w-8 h-8 text-slate-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">No Role Assignment</h1>
        
        <p className="text-muted-foreground mb-6">
          Your account doesn't have any roles assigned yet. Roles determine what features 
          you can access in the application. Please contact your administrator to get roles assigned.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Return to Homepage
          </Button>
          
          <Button 
            onClick={() => window.location.href = "mailto:admin@surehelp.com"}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact Admin
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          If you believe this is an error, please try signing out and back in, 
          or contact support at <span className="underline">support@surehelp.com</span>
        </div>
      </div>
    </div>
  );
}
