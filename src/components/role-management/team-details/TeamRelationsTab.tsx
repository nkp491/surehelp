
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RelatedTeam {
  id: string;
  name: string;
  relationship: string;
}

interface TeamRelationsTabProps {
  relatedTeams: RelatedTeam[];
}

export function TeamRelationsTab({ relatedTeams }: TeamRelationsTabProps) {
  return (
    <div className="rounded-md border max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Relationship</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relatedTeams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                This team has no relationships with other teams
              </TableCell>
            </TableRow>
          ) : (
            relatedTeams.map((relTeam, index) => (
              <TableRow key={index}>
                <TableCell>{relTeam.name}</TableCell>
                <TableCell>
                  <Badge variant={relTeam.relationship === 'Parent' ? 'default' : 'secondary'}>
                    {relTeam.relationship}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
