import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
    Badge
} from '@/components/ui/badge';
import {
    Progress
} from '@/components/ui/progress';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    User, Mail, BookOpen, Clock, CheckCircle, AlertCircle,
    ArrowLeft, Send, Edit2, CheckCircle2, Circle, Eye, Loader2,
    Calendar as CalendarIcon, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { progressService, notificationService } from '@/services/api';
import { toast } from "sonner";
import ConfirmRegisterModal from "@/components/modal/ConfirmRegisterModal";

export default function StudentDetailView() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("roadmap");

    // Deadline Modal State
    const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [newDeadline, setNewDeadline] = useState("");
    const [extensionReason, setExtensionReason] = useState("");

    // Notify Modal State
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [notifyTemplate, setNotifyTemplate] = useState("Reminder: Deadline Approaching");
    const [customMessage, setCustomMessage] = useState("");
    const [isManualCompleteDialogOpen, setManualCompleteDialogOpen] = useState(false);
    const [pendingManualMilestone, setPendingManualMilestone] = useState("");
    const [isManualCompleting, setIsManualCompleting] = useState(false);

    const milestones = [
        { title: 'Research Proposal', docType: 'Research Proposal' },
        { title: 'Literature Review', docType: 'Literature Review' },
        { title: 'Methodology Chapter', docType: 'Methodology' },
        { title: 'Data Collection & Analysis', docType: 'Data Analysis' },
        { title: 'Final Thesis', docType: 'Final Thesis' }
    ];

    useEffect(() => {
        fetchStudentData();
    }, [id]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const res = await progressService.getStudentDetails(id);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch student details", err);
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-slate-500 font-bold">Loading student profile...</p>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center">Student not found.</div>;

    const { student, assignments } = data;
    const docs = student.documents_uploads || [];

    // Calculate Progress
    const completedMilestones = milestones.filter(m =>
        docs.some(d => d.document_type === m.docType && (d.status === 'Approved' || d.status === 'Completed'))
    );
    const progressPercent = Math.round((completedMilestones.length / milestones.length) * 100);

    // Derived Status
    const getDerivedStatus = (progress) => {
        if (progress >= 80) return 'On Track';
        if (progress >= 50) return 'Delayed';
        return 'At Risk';
    };
    const status = getDerivedStatus(progressPercent);

    const handleUpdateDeadline = async () => {
        try {
            await progressService.updateDeadline({
                pg_student_id: id,
                milestone_name: selectedMilestone,
                deadline_date: newDeadline,
                reason: extensionReason
            });
            toast.success("Deadline updated and student notified");
            setIsDeadlineModalOpen(false);
            fetchStudentData();
        } catch (err) {
            toast.error("Failed to update deadline");
        }
    };

    const handleSendNotification = async () => {
        try {
            const message = notifyTemplate === "Custom Message" ? customMessage : notifyTemplate;
            await notificationService.sendNotification({
                userId: id,
                title: "CGS Administrative Notice",
                message,
                type: "ADMIN_ALERT"
            });
            toast.success("Notification sent to student");
            setIsNotifyModalOpen(false);
        } catch (err) {
            toast.error("Failed to send notification");
        }
    };

    const handleManualComplete = (milestoneName) => {
        setPendingManualMilestone(milestoneName);
        setManualCompleteDialogOpen(true);
    };

    const confirmManualComplete = async () => {
        if (!pendingManualMilestone) return;
        setManualCompleteDialogOpen(false);
        setIsManualCompleting(true);
        try {
            await progressService.manualComplete({
                pg_student_id: id,
                milestone_name: pendingManualMilestone
            });
            toast.success("Milestone marked as completed");
            fetchStudentData();
        } catch (err) {
            toast.error("Failed to update milestone");
        } finally {
            setIsManualCompleting(false);
            setPendingManualMilestone("");
        }
    };

    return (
        <div className="max-w-full px-6 mx-auto pb-12 space-y-8 animate-fade-in">
            {/* Breadcrumbs / Back */}
            <Link to="/cgs/monitoring" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Monitoring
            </Link>

            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200 shrink-0">
                    {student.FirstName.charAt(0)}{student.LastName.charAt(0)}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl font-black text-slate-900">{student.FirstName} {student.LastName}</h1>
                        <Badge className={`
              ${status === 'On Track' ? 'bg-blue-600' : status === 'Delayed' ? 'bg-blue-400' : 'bg-red-400'} 
              text-white font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest
            `}>
                            {status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                            <Mail className="w-4 h-4 text-blue-600" />
                            {student.EmailId}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            {student.Prog_Code_program_info?.prog_name || student.Prog_Code}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                            <User className="w-4 h-4 text-blue-600" />
                            ID: {student.stu_id || student.pgstud_id}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Overall Progress</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" indicatorClassName="bg-blue-600" />
                    <button
                        onClick={() => setIsNotifyModalOpen(true)}
                        className="mt-2 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                        <Send className="w-4 h-4" />
                        Notify Student
                    </button>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="roadmap" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 gap-2 h-auto flex-wrap sm:flex-nowrap">
                    <TabsTrigger value="roadmap" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all text-sm">
                        Milestone Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all text-sm">
                        Submission History
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all text-sm">
                        Academic Timeline
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Roadmap */}
                <TabsContent value="roadmap" className="outline-none">
                    <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                            <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                Thesis Progress Roadmap
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
                                <div className="hidden lg:block absolute top-[50px] left-10 right-10 h-1 bg-slate-100 -z-0"></div>
                                {milestones.map((m, idx) => {
                                    const isCompleted = docs.some(d => d.document_type === m.docType && (d.status === 'Approved' || d.status === 'Completed'));
                                    const isPending = docs.some(d => d.document_type === m.docType && d.status === 'Pending');

                                    return (
                                        <div key={idx} className="flex flex-col items-center text-center gap-4 relative z-10">
                                            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white transition-all shadow-md
                        ${isCompleted ? 'border-blue-100 text-blue-600' : isPending ? 'border-blue-200 text-blue-600' : 'border-slate-100 text-slate-300'}
                      `}>
                                                {isCompleted ? <CheckCircle className="w-10 h-10" /> : isPending ? <Clock className="w-10 h-10 animate-pulse" /> : <Circle className="w-10 h-10" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{m.title}</h3>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-blue-600' : isPending ? 'text-blue-400' : 'text-slate-400'}`}>
                                                    {isCompleted ? 'Completed' : isPending ? 'Pending Review' : 'Locked'}
                                                </p>
                                            </div>
                                            {!isCompleted && (
                                                <button
                                                    onClick={() => handleManualComplete(m.docType)}
                                                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 underline"
                                                >
                                                    Manual Complete
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Submission History */}
                <TabsContent value="history" className="outline-none">
                    <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-blue-600" />
                                Submission Log
                            </CardTitle>
                            <Badge variant="outline" className="font-bold">{docs.length} Documents</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Document</TableHead>
                                        <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Type</TableHead>
                                        <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Uploaded At</TableHead>
                                        <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</TableHead>
                                        <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {docs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold">No submissions found</TableCell>
                                        </TableRow>
                                    ) : (
                                        docs.map((doc, idx) => (
                                            <TableRow key={idx} className="hover:bg-slate-50/50 transition-all group">
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 line-clamp-1">{doc.document_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="px-3 py-1 rounded-lg text-[10px] font-black uppercase">{doc.document_type}</Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-bold text-xs">{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge className={`
                              ${doc.status === 'Approved' || doc.status === 'Completed' ? 'bg-blue-600' : doc.status === 'Rejected' || doc.status === 'Resubmit' ? 'bg-red-400' : 'bg-blue-100 text-blue-700 shadow-none'} 
                              text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase
                            `}>
                                                        {doc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        onClick={() => window.open(`http://localhost:5000/api/documents/${doc.doc_up_id}/download`, '_blank')}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Academic Timeline */}
                <TabsContent value="timeline" className="outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden h-fit">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                                    Key Milestone Deadlines
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Milestone</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Target Date</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Custom Reason</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {milestones.map((m, idx) => {
                                            const customDeadline = student.milestone_deadlines?.find(d => d.milestone_name === m.docType);
                                            const isCompleted = docs.some(d => d.document_type === m.docType && (d.status === 'Approved' || d.status === 'Completed'));

                                            return (
                                                <TableRow key={idx} className="hover:bg-slate-50/50 transition-all">
                                                    <TableCell className="py-5 px-6 font-bold text-slate-900">{m.title}</TableCell>
                                                    <TableCell className="font-bold text-slate-500 text-sm">
                                                        {customDeadline ? new Date(customDeadline.deadline_date).toLocaleDateString() : 'System Default'}
                                                    </TableCell>
                                                    <TableCell className="italic text-slate-400 text-xs">
                                                        {customDeadline?.reason || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {!isCompleted && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMilestone(m.docType);
                                                                    setNewDeadline(customDeadline ? customDeadline.deadline_date.split('T')[0] : "");
                                                                    setExtensionReason(customDeadline?.reason || "");
                                                                    setIsDeadlineModalOpen(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Sidebar info */}
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Supervisory Committee</h3>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {assignments.length === 0 ? (
                                            <p className="text-slate-400 italic text-sm font-bold">No supervisors assigned.</p>
                                        ) : (
                                            assignments.map((a, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                        {a.pg_staff?.FirstName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm leading-none">
                                                            {a.pg_staff?.Honorific_Titles} {a.pg_staff?.FirstName} {a.pg_staff?.LastName}
                                                        </p>
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{a.assignment_type}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-gradient-to-br from-blue-700 to-blue-600 text-white">
                                <CardContent className="p-6">
                                    <h3 className="font-black text-white uppercase tracking-widest text-xs opacity-80 mb-4">Registration Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1">Signed Date</p>
                                            <p className="font-black text-lg">{new Date(student.RegDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1">Expected Graduation</p>
                                            <p className="font-black text-lg">{new Date(student.EndDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {isDeadlineModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsDeadlineModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
                        >
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Adjust Milestone Deadline</h2>
                            <p className="text-slate-500 font-bold mb-6">Updating: <span className="text-blue-600">{selectedMilestone}</span></p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Extension Date</label>
                                    <input
                                        type="date"
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Extension</label>
                                    <textarea
                                        value={extensionReason}
                                        onChange={(e) => setExtensionReason(e.target.value)}
                                        placeholder="Provide a justification for documenting this change..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all min-h-[120px]"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsDeadlineModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateDeadline}
                                        disabled={!newDeadline || !extensionReason}
                                        className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save & Notify
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isNotifyModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsNotifyModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Send Notification</h2>
                                    <p className="text-slate-500 font-bold text-sm">Target: {student.FirstName} {student.LastName}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Message Template</label>
                                    <select
                                        value={notifyTemplate}
                                        onChange={(e) => setNotifyTemplate(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10"
                                    >
                                        <option>Reminder: Deadline Approaching</option>
                                        <option>Urgent: Task Overdue</option>
                                        <option>Action Required: Please check your roadmap</option>
                                        <option>Custom Message</option>
                                    </select>
                                </div>

                                {notifyTemplate === "Custom Message" && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Custom Message Content</label>
                                        <textarea
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            placeholder="Type your message here..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10 min-h-[120px]"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsNotifyModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendNotification}
                                        className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                    >
                                        Send Alert
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmRegisterModal
                open={isManualCompleteDialogOpen}
                onOpenChange={(open) => {
                    setManualCompleteDialogOpen(open);
                    if (!open) {
                        setPendingManualMilestone("");
                    }
                }}
                title="Manual Completion"
                description={`Are you sure you want to manually mark "${pendingManualMilestone}" as completed?`}
                confirmText={isManualCompleting ? "Marking..." : "Confirm"}
                cancelText="Cancel"
                onConfirm={confirmManualComplete}
            />
        </div>
    );
}
