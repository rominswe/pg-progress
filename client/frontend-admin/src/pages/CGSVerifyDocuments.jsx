import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/ui/alert-dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';

export default function CGSVerifyDocuments() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAction = (doc, action) => {
    setSelectedDoc(doc);
    setActionType(action);
  };

  const confirmAction = () => {
    if (selectedDoc && actionType) {
      const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id ? { ...doc, status: newStatus } : doc
        )
      );
      toast.success(
        `Document ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`
      );
      setSelectedDoc(null);
      setActionType(null);
    }
  };

  const pendingCount = documents.filter((d) => d.status === 'Pending').length;
  const approvedCount = documents.filter((d) => d.status === 'Approved').length;
  const rejectedCount = documents.filter((d) => d.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verify Documents</h1>
        <p className="text-muted-foreground">
          Review and verify submitted documents from students.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {doc.title}
                  </TableCell>
                  <TableCell>{doc.studentName}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.submittedDate}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.status === 'Pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => handleAction(doc, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => handleAction(doc, 'reject')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedDoc && !!actionType}
        onOpenChange={() => {
          setSelectedDoc(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Document' : 'Reject Document'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to {actionType} this document?</p>
              {selectedDoc && (
                <p className="font-medium text-foreground">{selectedDoc.title}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground hover:bg-muted/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === 'approve'
                  ? 'bg-emerald-600 text-primary-foreground hover:bg-emerald-700'
                  : 'bg-red-600 text-primary-foreground hover:bg-red-700'
              }
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}