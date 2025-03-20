
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/types/team";

interface MentionSelectorProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onChange: (ids: string[]) => void;
}

export function MentionSelector({ teamMembers, selectedMembers, onChange }: MentionSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      onChange(selectedMembers.filter(id => id !== userId));
    } else {
      onChange([...selectedMembers, userId]);
    }
  };

  const removeMember = (userId: string) => {
    onChange(selectedMembers.filter(id => id !== userId));
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground"
          >
            {selectedMembers.length > 0 
              ? `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`
              : "Select team members to mention"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandEmpty>No team members found.</CommandEmpty>
            <CommandGroup>
              {teamMembers.map((member) => (
                <CommandItem
                  key={member.user_id}
                  value={`${member.first_name} ${member.last_name}`}
                  onSelect={() => toggleMember(member.user_id)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedMembers.includes(member.user_id) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {member.first_name} {member.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedMembers.map(userId => {
            const member = teamMembers.find(m => m.user_id === userId);
            if (!member) return null;
            
            return (
              <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                {member.first_name} {member.last_name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeMember(userId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
