import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CounterHistoryEntry {
  date: string;
  count: number;
}

interface CounterHistoryProps {
  history: CounterHistoryEntry[];
}

const CounterHistory = ({ history }: CounterHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Counter History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {history.length === 0 && (
          <p className="text-center text-gray-500 py-8">No counter history yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CounterHistory;