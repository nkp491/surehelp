import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface NotesHistoryProps {
  submissionId: string;
}

interface HistoryEntry {
  id: string;
  previous_notes: string | null;
  new_notes: string;
  created_at: string;
}

const NotesHistory = ({ submissionId }: NotesHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('notes_history')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes history:', error);
        return;
      }

      setHistory(data);
    };

    if (submissionId) {
      loadHistory();
    }
  }, [submissionId]);

  if (!history.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No notes history available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="border-b pb-4 last:border-0">
            <div className="text-sm text-gray-500 mb-2">
              {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm:ss')}
            </div>
            <div className="space-y-2">
              {entry.previous_notes && (
                <div className="text-red-600 line-through text-sm">
                  {entry.previous_notes}
                </div>
              )}
              <div className="text-green-600 text-sm">
                {entry.new_notes}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotesHistory;