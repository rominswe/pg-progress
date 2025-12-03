import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../../pages/cgs/ui/card';
import { Progress } from '../../pages/cgs/ui/progress';
import { Badge } from '../../pages/cgs/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../pages/cgs/ui/table';
import { mockProgress } from '../../data/mockUsers';

export default function CGSMonitoring() {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'On Track':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            {status}
          </Badge>
        );
      case 'Delayed':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            {status}
          </Badge>
        );
      case 'At Risk':
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">{status}</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitor Progress</h1>
        <p className="text-muted-foreground">
          Track student progress and supervisor assignments.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {mockProgress.filter((p) => p.status === 'On Track').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {mockProgress.filter((p) => p.status === 'Delayed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockProgress.filter((p) => p.status === 'At Risk').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProgress.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell>{item.supervisorName}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.progress} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground w-10">
                        {item.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}