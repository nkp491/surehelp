
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, PlusCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  content: string;
  date: Date;
}

interface TeamMemberOneOnOneNotesProps {
  userId: string;
  name: string;
}

export function TeamMemberOneOnOneNotes({ 
  userId, 
  name 
}: TeamMemberOneOnOneNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    // Initial demo note - in a real app these would be loaded from a database
    {
      id: "1",
      content: "Discussed lead generation strategies. Planning to follow up next week.",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  ]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([
        {
          id: Date.now().toString(),
          content: newNote,
          date: new Date()
        },
        ...notes
      ]);
      setNewNote("");
      setIsAddingNote(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            1:1 Notes with {name}
          </div>
          
          {!isAddingNote && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={() => setIsAddingNote(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAddingNote && (
          <div className="space-y-2 mb-4">
            <Textarea
              placeholder="Enter your 1:1 note here..."
              className="min-h-[80px] text-sm"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddNote}>
                Save Note
              </Button>
            </div>
          </div>
        )}
        
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-md p-3 space-y-1">
                <p className="text-sm">{note.content}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(note.date, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No 1:1 notes yet. Add your first note to keep track of discussions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
