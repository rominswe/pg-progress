import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serviceRequestService } from "@/services/api";
import {
    ChevronLeft,
    User,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Info,
    Tag,
    BookOpen,
    ClipboardCheck,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ServiceRequestDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequestDetails();
    }, [id]);

    const fetchRequestDetails = async () => {
        try {
            setLoading(true);
            const res = await serviceRequestService.getById(id);
            if (res.success) {
                setRequest(res.data.request);
            }
        } catch (err) {
            console.error("Failed to fetch request details:", err);
            toast.error("Failed to load request details");
            navigate("/cgs/service-requests");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-xs font-bold tracking-wider px-4 py-1.5 rounded-full">Approved</Badge>;
            case 'Rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 uppercase text-xs font-bold tracking-wider px-4 py-1.5 rounded-full">Rejected</Badge>;
            case 'Pending':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 uppercase text-xs font-bold tracking-wider px-4 py-1.5 rounded-full">Pending</Badge>;
            case 'More Info':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase text-xs font-bold tracking-wider px-4 py-1.5 rounded-full">More Info</Badge>;
            default:
                return <Badge variant="secondary" className="uppercase text-xs font-bold tracking-wider px-4 py-1.5 rounded-full">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-slate-500 font-bold">Loading request details...</p>
            </div>
        );
    }

    if (!request) return null;

    const details = request.request_details || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8 pb-12"
        >
            {/* Header & Back Button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all"
                    onClick={() => navigate("/cgs/service-requests")}
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to List
                </Button>
                {getStatusBadge(request.status)}
            </div>

            {/* Request Title Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full w-fit">
                            <Tag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{request.service_category}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight tracking-tight">Request Details</h1>
                        <p className="text-blue-100 font-medium">Submitted on {new Date(request.submission_date).toLocaleDateString()} at {new Date(request.submission_date).toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Student info & Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Student Identity */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Student Identity</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                                    <p className="text-lg font-black text-slate-900">{request.full_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</p>
                                    <p className="text-lg font-mono font-bold text-blue-600">{request.student_id_display}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Program</p>
                                    <p className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 mt-1">{request.program}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Request Specifics */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Request Content</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Semester</p>
                                    <p className="text-lg font-bold text-slate-900">{request.current_semester}</p>
                                </div>

                                {Object.entries(details).map(([key, value]) => {
                                    // Skip internal/system keys
                                    if (['supervisor_comments', 'supervisor_signature', 'reviewed_by'].includes(key)) return null;

                                    // Format label
                                    const label = key.split('_')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');

                                    return (
                                        <div key={key} className="space-y-1">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-lg font-bold text-slate-900">{value || "N/A"}</p>
                                        </div>
                                    );
                                })}

                                <div className="md:col-span-2 pt-4 border-t border-slate-50">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Student Digital Signature</p>
                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                                        <p className="font-serif italic text-2xl text-slate-400 text-center opacity-70 select-none">
                                            {request.signature}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Processing info */}
                <div className="space-y-8">
                    {/* Status Info */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Info className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Processing Status</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${request.status === 'Approved' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700">Workflow State</p>
                                        <p className="text-xs text-slate-500">{request.status === 'Pending' ? 'Waiting for Supervisor Review' : `Request has been ${request.status.toLowerCase()}`}</p>
                                    </div>
                                </div>

                                {request.status !== 'Pending' && (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supervisor Response</p>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-500 italic">" {details.supervisor_comments || "No comments provided."} "</p>
                                        </div>
                                        {details.supervisor_signature && (
                                            <div className="pt-2 border-t border-slate-100">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                                    <ClipboardCheck className="w-3 h-3" /> Digitally Signed
                                                </p>
                                                <p className="font-serif italic text-slate-400 text-sm mt-1">{details.supervisor_signature}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Timeline (Static for now) */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Timeline
                            </h2>
                            <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
                                <div className="relative pl-10">
                                    <div className="absolute left-1 top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-50 flex items-center justify-center">
                                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Submitted</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{new Date(request.submission_date).toLocaleDateString()}</p>
                                </div>

                                {request.status !== 'Pending' && (
                                    <div className="relative pl-10">
                                        <div className={`absolute left-1 top-0 w-4 h-4 rounded-full flex items-center justify-center ${request.status === 'Approved' ? 'bg-emerald-500 ring-emerald-50' : 'bg-red-500 ring-red-50'} ring-4`}>
                                            {request.status === 'Approved' ? <CheckCircle className="w-2.5 h-2.5 text-white" /> : <XCircle className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{request.status}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Review Complete</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
