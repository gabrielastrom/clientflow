import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revenues } from "@/lib/data";

export default function FinancePage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Track your agency's revenue and financial performance.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Log</CardTitle>
          <CardDescription>
            A detailed record of all incoming revenue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Revenue</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Month</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenues.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    ${item.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.month}
                  </TableCell>
                  <TableCell>{item.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
