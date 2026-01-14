import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ParamsTableProps {
  params: Param[];
  title?: string;
}

export function ParamsTable({ params, title = "Parameter" }: ParamsTableProps) {
  if (params.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px]">Name</TableHead>
              <TableHead className="w-[100px]">Typ</TableHead>
              <TableHead className="w-[100px]">Pflicht</TableHead>
              <TableHead>Beschreibung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map((param) => (
              <TableRow key={param.name}>
                <TableCell className="font-mono text-sm">{param.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {param.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {param.required ? (
                    <Badge variant="default" className="text-xs">Ja</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Nein</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{param.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
