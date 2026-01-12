import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, FileText, ShieldCheck, Clock, AlertCircle, Search, Filter } from 'lucide-react';

const mockDocuments = [
  { id: 1, title: 'English Proficiency Certificate', studentName: 'Ahmad bin Ibrahim', type: 'Certificate', submittedDate: '2025-01-10', status: 'Pending' },
  { id: 2, title: 'Master Degree Transcript', studentName: 'Siti Nurhaliza', type: 'Academic', submittedDate: '2025-01-09', status: 'Approved' },
  { id: 3, title: 'Research Proposal Draft', studentName: 'Muhammad Farhan', type: 'Research', submittedDate: '2025-01-08', status: 'Rejected' },
];

export default function CGSVerifyDocuments() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge className="bg-blue-600 text-white border-blue-600 shadow-sm px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="rounded-full">{status}</Badge>;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-full px-6 mx-auto pb-12"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-white" />
              Document Verification
            </h1>
            <p className="text-blue-100 font-medium text-lg">
              Perform administrative audits and verify authenticity of student credentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Pending</span>
              <span className="text-lg font-black">{pendingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Pending Review', count: pendingCount, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Approved', count: approvedCount, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Rejected', count: rejectedCount, icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50' }
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <div className="text-3xl font-black text-slate-900">{stat.count}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Documents Table Container */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Submission Queue
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search files..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 border-b border-slate-100">
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Document Title</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Type</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Submitted</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {documents.map((doc) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-800 truncate max-w-[180px]">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-600">{doc.studentName}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-500">
                            {doc.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(doc.submittedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <Eye className="h-5 w-5" />
                            </button>
                            {doc.status === 'Pending' && (
                              <>
                                <button
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  onClick={() => handleAction(doc, 'approve')}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-all"
                                  onClick={() => handleAction(doc, 'reject')}
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedDoc && !!actionType}
        onOpenChange={() => {
          setSelectedDoc(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">
                {actionType === 'approve' ? 'Verify Submission' : 'Reject Submission'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium text-lg mt-2">
                Are you sure you want to {actionType} this document? This action will be logged and visible to the student.
                {selectedDoc && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {selectedDoc.title}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 flex gap-3">
              <AlertDialogCancel className="grow py-4 rounded-2xl font-bold bg-slate-100 border-none text-slate-600 hover:bg-slate-200 transition-all">
                Close
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction}
                className={`grow py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${actionType === 'approve'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    : 'bg-blue-900 hover:bg-black shadow-slate-200'
                  }`}
              >
                Confirm {actionType === 'approve' ? 'Verification' : 'Rejection'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
