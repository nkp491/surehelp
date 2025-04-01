
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TeamRefreshButtonProps {
  onClick: () => Promise<void>;
  loading: boolean;
}

const TeamRefreshButton = ({ onClick, loading }: TeamRefreshButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className="h-8 w-8"
      disabled={loading}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
    </Button>
  );
};

export default TeamRefreshButton;
