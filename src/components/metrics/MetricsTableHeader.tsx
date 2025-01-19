import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MetricsSortButton from "./MetricsSortButton";

interface MetricsTableHeaderProps {
  onSort: (key: string) => void;
}

const MetricsTableHeader = ({ onSort }: MetricsTableHeaderProps) => {
  const headers = [
    { key: 'date', label: 'Date' },
    { key: 'leads', label: 'Leads' },
    { key: 'calls', label: 'Calls' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'sits', label: 'Sits' },
    { key: 'sales', label: 'Sales' },
    { key: 'ap', label: 'AP' },
  ];

  return (
    <TableHeader>
      <TableRow>
        {headers.map(({ key, label }) => (
          <TableHead key={key} className="text-[#2A6F97] font-bold">
            <div className="flex items-center gap-1">
              {label}
              <MetricsSortButton onSort={() => onSort(key)} />
            </div>
          </TableHead>
        ))}
        <TableHead className="text-[#2A6F97] font-bold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MetricsTableHeader;