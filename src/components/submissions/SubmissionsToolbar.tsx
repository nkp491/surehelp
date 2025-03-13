
import { FormSubmission } from "@/types/form";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import TableActionsMenu from "./TableActionsMenu";

interface SubmissionsToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: any;
  onFilterChange: (filters: any) => void;
  submissions: FormSubmission[];
  onExport: () => void;
  showAdvancedFiltering: boolean;
}

const SubmissionsToolbar = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  submissions,
  onExport,
  showAdvancedFiltering
}: SubmissionsToolbarProps) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-[#2A6F97]">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="flex-1">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        </div>
        <div className="flex items-center gap-4">
          {showAdvancedFiltering && (
            <FilterBar filters={filters} onFilterChange={onFilterChange} />
          )}
          <TableActionsMenu 
            submissions={submissions} 
            onExport={onExport} 
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionsToolbar;
