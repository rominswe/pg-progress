import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Clock, Download, FileText, Loader2, ExternalLink } from "lucide-react";
import { serviceRequestService } from "@/services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ServiceRequestOverview() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await serviceRequestService.getAll();
            if (res.success) {
                setRequests(res.data.requests || []);
            }
        } catch (err) {
            console.error("Failed to fetch service requests:", err);
            toast.error("Failed to load service requests");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch =
                req.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.student_id_display.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.service_category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "All" || req.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, searchQuery, statusFilter]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">Approved</Badge>;
            case 'Rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">Rejected</Badge>;
            case 'Pending':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">Pending</Badge>;
            case 'More Info':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">More Info</Badge>;
            default:
                return <Badge variant="secondary" className="uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">{status}</Badge>;
        }
    };

    const handleExport = () => {
        if (filteredRequests.length === 0) return;

        const headers = ["ID", "Student Name", "Category", "Submission Date", "Status", "Program"];
        const rows = filteredRequests.map(req => [
            req.student_id_display,
            req.full_name,
            req.service_category,
            new Date(req.submission_date).toLocaleDateString(),
            req.status,
            req.program
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Service_Requests_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Request Monitoring</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor and track all postgraduate student form submissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2 rounded-xl border-slate-200 hover:bg-slate-50" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2" onClick={fetchRequests}>
                        <Clock className="h-4 w-4" />
                        Refresh Data
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Requests", value: requests.length, color: "bg-blue-50 text-blue-600" },
                    { label: "Pending", value: requests.filter(r => r.status === 'Pending').length, color: "bg-amber-50 text-amber-600" },
                    { label: "Approved", value: requests.filter(r => r.status === 'Approved').length, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Rejected/More Info", value: requests.filter(r => ['Rejected', 'More Info'].includes(r.status)).length, color: "bg-red-50 text-red-600" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-3xl font-black mt-2 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Request List
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search requests..."
                                className="pl-10 pr-4 py-2 bg-white border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] rounded-xl border-slate-200 bg-white">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                                    <SelectValue placeholder="All Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="More Info">More Info</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            <p className="mt-4 text-slate-500 font-bold">Loading requests...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-medium">
                            No service requests found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30 border-b border-slate-100">
                                        <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</TableHead>
                                        <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Category</TableHead>
                                        <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Program</TableHead>
                                        <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</TableHead>
                                        <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</TableHead>
                                        <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((req) => (
                                        <TableRow key={req.request_id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{req.full_name}</span>
                                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-1">{req.student_id_display}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold text-slate-700">{req.service_category}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    {req.program}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-500">{new Date(req.submission_date).toLocaleDateString()}</span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(req.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl text-blue-600 hover:bg-blue-50 font-bold flex items-center gap-2"
                                                    onClick={() => navigate(`/cgs/service-requests/${req.request_id}`)}
                                                >
                                                    View
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
