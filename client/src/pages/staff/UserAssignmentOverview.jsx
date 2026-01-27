import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import {
    Search, Filter, ChevronDown, ChevronUp, User, Mail,
    Clock, CheckCircle2, Building, Loader2, X, Eye,
    AlertCircle, GraduationCap, Users, ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import adminService from "@/services/adminService";
import api from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * UserAssignmentOverview Component
 * Provides a birds-eye view of all users and their assignment counts (Approved, Pending, Rejected).
 */
export default function UserAssignmentOverview() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // --- States ---
    const [stats, setStats] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "totalApproved", direction: "desc" });

    const [filters, setFilters] = useState({
        type: "student", // default to students
        status: "All",
        depCode: "all",
        progCode: "all"
    });

    // --- Data Fetching ---
    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [filters.type, filters.status, filters.depCode, filters.progCode]);

    const fetchMetadata = async () => {
        try {
            const [deptRes, progRes] = await Promise.all([
                api.get("/api/departments"),
                api.get("/api/admin/program/assignable")
            ]);

            const deptList = deptRes.data?.departmentInfoAccess || deptRes.data || [];
            setDepartments(Array.isArray(deptList) ? deptList : []);

            const progList = progRes.data?.programs || progRes.data?.data || progRes.data || [];
            setPrograms(Array.isArray(progList) ? progList : []);
        } catch (err) {
            console.error("Failed to fetch metadata:", err);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAssignmentStats({
                type: filters.type,
                statusFilter: filters.status,
                depCode: filters.depCode === "all" ? "" : filters.depCode,
                progCode: filters.progCode === "all" ? "" : filters.progCode,
                searchQuery: searchQuery
            });

            if (res?.success) {
                setStats(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            toast.error("Failed to load assignment statistics");
        } finally {
            setLoading(false);
        }
    };

    // --- Debounced Search ---
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== "") fetchStats();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // --- Sorting Logic ---
    const sortedStats = useMemo(() => {
        return [...stats].sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aValue = a[sortConfig.key] ?? "";
            const bValue = b[sortConfig.key] ?? "";
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [stats, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const clearFilters = () => {
        setSearchQuery("");
        setFilters({ type: "student", status: "All", depCode: "all", progCode: "all" });
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Assignment Overview</h1>
                    <p className="text-muted-foreground text-sm">Monitor system workload and assignment statuses across all users.</p>
                </div>
            </header>

            {/* Filters Card */}
            <Card className="border-none shadow-sm bg-slate-50/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search Name/ID/Email..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* User Type */}
                        <Select value={filters.type} onValueChange={(val) => setFilters(p => ({ ...p, type: val }))}>
                            <SelectTrigger className="bg-white">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="User Type" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Students</SelectItem>
                                <SelectItem value="staff">Staff Members</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={filters.status} onValueChange={(val) => setFilters(p => ({ ...p, status: val }))}>
                            <SelectTrigger className="bg-white">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Status Filter" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Assignments</SelectItem>
                                <SelectItem value="Pending">Pending Requests</SelectItem>
                                <SelectItem value="Approved">Approved Workload</SelectItem>
                                <SelectItem value="Rejected">Rejected Records</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Program / Dept Filter */}
                        {filters.type === 'student' ? (
                            <Select value={filters.progCode} onValueChange={(val) => setFilters(p => ({ ...p, progCode: val }))}>
                                <SelectTrigger className="bg-white">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="All Programs" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {programs.map(p => (
                                        <SelectItem key={p.Prog_Code} value={p.Prog_Code}>{p.prog_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Select value={filters.depCode} onValueChange={(val) => setFilters(p => ({ ...p, depCode: val }))}>
                                <SelectTrigger className="bg-white">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="All Departments" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d.Dep_Code} value={d.Dep_Code}>{d.DepartmentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                            <X className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-muted-foreground border-b text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort("identifier")}>
                                        <div className="flex items-center gap-2">ID {sortConfig.key === "identifier" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort("fullName")}>
                                        <div className="flex items-center gap-2">User {sortConfig.key === "fullName" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                                    </th>
                                    <th className="px-6 py-4">Roles / Department</th>
                                    <th className="px-6 py-4 text-center">Approved</th>
                                    <th className="px-6 py-4 text-center">Pending</th>
                                    <th className="px-6 py-4 text-center">Rejected</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground">Fetching statistics...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedStats.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground font-medium">
                                            No assignment records found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedStats.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-bold text-primary">{item.identifier}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{item.fullName}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="h-3 w-3 text-slate-400" />
                                                    {item.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-semibold text-slate-600">{item.role}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.department}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge className={cn(
                                                    "font-bold",
                                                    item.totalApproved > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {item.totalApproved}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge className={cn(
                                                    "font-bold",
                                                    item.totalPending > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {item.totalPending}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge className={cn(
                                                    "font-bold",
                                                    item.totalRejected > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {item.totalRejected}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-2 hover:bg-slate-100"
                                                    onClick={() => navigate(`/cgs/users/${item.id}/assign`)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
