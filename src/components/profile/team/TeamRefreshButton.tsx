
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn("h-8 w-8 transition-all", loading && "bg-muted")}
      disabled={loading}
      aria-label="Refresh teams"
      title="Refresh teams"
    >
      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin text-primary")} />
      <span className="sr-only">Refresh teams</span>
    </Button>
  );
};

export default TeamRefreshButton;
