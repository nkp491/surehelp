import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MetricsTableHeader = () => {
  const headers = [
    { key: "date", label: "Date" },
    { key: "leads", label: "Leads" },
    { key: "calls", label: "Calls" },
    { key: "contacts", label: "Contacts" },
    { key: "scheduled", label: "Scheduled" },
    { key: "sits", label: "Sits" },
    { key: "sales", label: "Sales" },
    { key: "ap", label: "AP" },
  ];

  return (
    <TableHeader>
      <TableRow>
        {headers.map(({ key, label }) => (
          <TableHead key={key} className="text-[#2A6F97] font-bold text-center">
            {label}
          </TableHead>
        ))}
        <TableHead className="text-[#2A6F97] font-bold text-center">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MetricsTableHeader;
