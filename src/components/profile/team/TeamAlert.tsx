
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TeamAlertProps {
  message: string;
  showForceButton?: boolean;
  onForceClick?: () => Promise<void>;
  isLoading?: boolean;
}

const TeamAlert = ({ 
  message, 
  showForceButton, 
  onForceClick, 
  isLoading 
}: TeamAlertProps) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Team Association Issue</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {showForceButton && onForceClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onForceClick}
            disabled={isLoading}
            className="self-start"
          >
            Force Team Association
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TeamAlert;
