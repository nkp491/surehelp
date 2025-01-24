import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NotesHistory from "../form/NotesHistory";
import { supabase } from "@/integrations/supabase/client";

interface TextFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  submissionId?: string;
}

const TextField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  submissionId,
}: TextFieldProps) => {
  const [showHistory, setShowHistory] = React.useState(false);
  const isNotesField = type === 'textarea' && (
    label.toLowerCase().includes('note') || 
    label.toLowerCase().includes('notes')
  );

  const handleNotesChange = async (newValue: string) => {
    if (onChange) {
      onChange(newValue);
      
      if (isNotesField && submissionId) {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        await supabase.from('notes_history').insert({
          submission_id: submissionId,
          user_id: user.data.user.id,
          previous_notes: value,
          new_notes: newValue,
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {isNotesField && submissionId && (
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <History className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notes History</DialogTitle>
              </DialogHeader>
              <NotesHistory submissionId={submissionId} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[100px]",
            error ? "border-destructive" : "border-input"
          )}
          required={required}
          readOnly={readOnly}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full",
            error ? "border-destructive" : "border-input"
          )}
          required={required}
          readOnly={readOnly}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default TextField;