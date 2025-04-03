
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseSearchProps {
  onSearch: (filters: {
    searchTerm: string;
    selectedTags: string[];
    sortField: string;
    sortDirection: 'asc' | 'desc';
  }) => void;
}

const ExpenseSearch = ({ onSearch }: ExpenseSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState("purchase_date");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch unique tags from existing expenses
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from('lead_expenses')
        .select('lead_type');
      
      if (error) {
        console.error('Error fetching tags:', error);
        return;
      }

      // Flatten and get unique tags with type safety
      const uniqueTags = Array.from(new Set(
        data.flatMap(expense => {
          const leadType = expense.lead_type;
          // Ensure leadType is treated as string array
          return Array.isArray(leadType) ? leadType as string[] : [];
        })
      )).sort();

      setAvailableTags(uniqueTags);
    };

    fetchTags();
  }, []);

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      triggerSearch(searchTerm, newTags, sortField, sortDirection);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    triggerSearch(searchTerm, newTags, sortField, sortDirection);
  };

  const triggerSearch = (
    term: string,
    tags: string[],
    field: string,
    direction: 'asc' | 'desc'
  ) => {
    onSearch({
      searchTerm: term,
      selectedTags: tags,
      sortField: field,
      sortDirection: direction,
    });
  };

  return (
    <div className="space-y-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              triggerSearch(e.target.value, selectedTags, sortField, sortDirection);
            }}
            className="pl-8"
          />
        </div>
        <Select
          value={sortField}
          onValueChange={(value) => {
            setSortField(value);
            triggerSearch(searchTerm, selectedTags, value, sortDirection);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purchase_date">Date</SelectItem>
            <SelectItem value="source">Source</SelectItem>
            <SelectItem value="lead_count">Lead Count</SelectItem>
            <SelectItem value="total_cost">Total Cost</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          onClick={() => {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            triggerSearch(searchTerm, selectedTags, sortField, sortDirection === 'asc' ? 'desc' : 'asc');
          }}
          className="text-[#2A6F97]"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select onValueChange={handleTagSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select tags" />
          </SelectTrigger>
          <SelectContent>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSearch;
