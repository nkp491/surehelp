
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface TableActionsMenuProps {
  submissions: FormSubmission[];
  onExport: () => void;
}

const TableActionsMenu = ({ submissions, onExport }: TableActionsMenuProps) => {
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();
  
  const showAdvancedFiltering = hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);

  return (
    <div className="flex items-center gap-4">
      {showAdvancedFiltering ? (
        <Button
          onClick={onExport}
          className="flex items-center gap-2"
          variant="outline"
          disabled={!submissions.length}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      ) : (
        <Button
          onClick={() => {}}
          className="flex items-center gap-2 opacity-60 cursor-not-allowed"
          variant="outline"
          disabled
        >
          <Download className="h-4 w-4" />
          Pro Feature
        </Button>
      )}
    </div>
  );
};

export default TableActionsMenu;
