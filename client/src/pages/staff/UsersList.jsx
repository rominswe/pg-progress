import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { Search, Filter, Download, ChevronDown, ChevronUp, User, Mail, Clock, CheckCircle2, Building, Loader2, MoreVertical, X, UserPlus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import adminService from "@/services/adminService";
import api from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * UsersList Component
 * Displays a comprehensive list of all PG users with advanced filtering, sorting, and export capabilities.
 */
export default function UsersList() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isCGSS = currentUser?.role_id === "CGSS";
    // --- States ---
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "regDate", direction: "desc" });
    const [filters, setFilters] = useState({
        department: "all",
        status: "all",
        role: "all"
    });

    // --- Data Fetching ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            await fetchDepartments();
            // Initial user fetch is handled by useEffect deps
        } catch (err) {
            console.error("Failed to fetch initial data:", err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get("/api/departments");
            const list = res.data?.departmentInfoAccess || res.data || [];
            setDepartments(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

    // --- Debounced Search ---
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchUsers = async (signal = null) => {
        try {
            setLoading(true);
            setUsers([]); // Clear old data to prevent "ghosting"

            const params = {
                dept: filters.department === "all" ? undefined : filters.department,
                status: filters.status === "all" ? undefined : filters.status,
                role: filters.role === "all" ? undefined : filters.role,
                search: debouncedSearch || undefined
            };

            const res = await adminService.getAllPGUsers(params, signal);

            if (res?.success) {
                setUsers(res.data.users);

                // Update role options only if we don't have them or on full list
                if (roleOptions.length === 0 || (params.dept === undefined && params.status === undefined && params.role === undefined)) {
                    const roles = new Set();
                    res.data.users.forEach(u => {
                        if (u.roleLabel) u.roleLabel.split(" / ").forEach(r => roles.add(r));
                    });
                    setRoleOptions(Array.from(roles).sort().map(r => ({ id: r, label: r })));
                }
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            console.error("Failed to fetch users:", err);
            toast.error("Failed to load users list");
        } finally {
            setLoading(false);
        }
    };

    // --- Effect for Filtering ---
    useEffect(() => {
        const controller = new AbortController();
        fetchUsers(controller.signal);
        return () => controller.abort();
    }, [filters, debouncedSearch]);

    // --- Sorting Logic ---
    const filteredUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            if (!sortConfig.key) return 0;

            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [users, sortConfig]);

    // --- Handlers ---
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setFilters({ department: "all", status: "all", role: "all" });
    };

    const handleStatusUpdate = async (user, newStatus) => {
        try {
            const userId = user.id || user.master_id; // Flexible ID handling

            await adminService.toggleUserStatus(userId, newStatus);

            toast.success(`User status updated to ${newStatus}`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleReactivateRequest = async (user) => {
        try {
            // For CGSS users: send email to admin
            if (isCGSS) {
                await api.post("/api/admin/request-reactivation", {
                    userId: user.id,
                    userName: user.fullName,
                    userEmail: user.email,
                    userRole: user.roleLabel,
                    requestedBy: currentUser.EmailId,
                    requestedByName: `${currentUser.FirstName} ${currentUser.LastName}`
                });
                toast.success("Reactivation request has been sent to the system admin.");
            } else {
                // For admin users: navigate to verify page
                navigate(`/cgs/users/${user.id}/verify?intent=reactivate`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send reactivation request");
        }
    };

    const exportToCSV = () => {
        if (filteredUsers.length === 0) return;

        const headers = ["ID", "Name", "Email", "Role", "Department", "Status", "Date Registered"];
        const rows = filteredUsers.map(u => [
            u.identifier,
            u.fullName,
            u.email,
            u.roleLabel,
            u.departmentLabel,
            u.status,
            new Date(u.regDate).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `PG_Users_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Dynamic Filter Options ---
    const filterOptions = useMemo(() => {
        const statuses = [...new Set(users.map(u => u.status))].filter(Boolean).sort();

        return {
            departments: departments.map(d => ({ code: d.Dep_Code, name: d.DepartmentName })),
            statuses: statuses.length > 0 ? statuses.map(s => ({ id: s, label: s })) : [
                { id: "Active", label: "Active" },
                { id: "Pending", label: "Pending" },
                { id: "Deactivated", label: "Deactivated" }
            ],
            roles: roleOptions
        };
    }, [users, departments, roleOptions]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Postgraduate Users</h1>
                    <p className="text-muted-foreground text-sm">Manage and monitor all students and staff members.</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2 self-start sm:self-auto" onClick={exportToCSV}>
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </header>

            {/* Filters Card */}
            <Card className="border-none shadow-sm bg-slate-50/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name, email, or ID..."
                                    className="pl-9 bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Department Filter */}
                        <Select value={filters.department} onValueChange={(val) => setFilters(prev => ({ ...prev, department: val }))}>
                            <SelectTrigger className="bg-white">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Departments" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Departments</SelectItem>
                                {filterOptions.departments.map(dept => (
                                    <SelectItem key={dept.code} value={dept.code}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
                            <SelectTrigger className="bg-white">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Statuses" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Statuses</SelectItem>
                                {filterOptions.statuses.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Role Filter */}
                        <Select value={filters.role} onValueChange={(val) => setFilters(prev => ({ ...prev, role: val }))}>
                            <SelectTrigger className="bg-white">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Roles" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Roles</SelectItem>
                                {filterOptions.roles.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(searchQuery || filters.department !== "all" || filters.status !== "all" || filters.role !== "all") && (
                        <div className="flex justify-end mt-4">
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-slate-50 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors w-[120px]" onClick={() => handleSort("identifier")}>
                                        <div className="flex items-center gap-2">
                                            ID {sortConfig.key === "identifier" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors min-w-[180px]" onClick={() => handleSort("fullName")}>
                                        <div className="flex items-center gap-2">
                                            Full Name {sortConfig.key === "fullName" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold min-w-[200px]">Contact</th>
                                    <th className="px-6 py-4 font-semibold min-w-[140px]">Role</th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors min-w-[250px]" onClick={() => handleSort("departmentCode")}>
                                        <div className="flex items-center gap-2">
                                            Department {sortConfig.key === "departmentCode" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors w-[120px]" onClick={() => handleSort("status")}>
                                        <div className="flex items-center gap-2">
                                            Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors w-[130px]" onClick={() => handleSort("regDate")}>
                                        <div className="flex items-center gap-2">
                                            Reg Date {sortConfig.key === "regDate" && (sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-right w-[80px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground font-medium">Fetching users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-20 text-center text-muted-foreground font-medium">
                                            No users found matching your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.identifier} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs font-semibold text-primary" title={user.identifierLabel}>
                                                    {user.identifier}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">{user.identifierLabel}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{user.fullName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="text-xs truncate max-w-[150px]">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roleLabel.split(" / ").map((role, idx) => (
                                                        <Badge key={idx} variant="outline" className="font-normal border-slate-200 whitespace-nowrap bg-white/50">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{user.departmentLabel}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "font-medium",
                                                        user.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                                                            user.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                                                                user.status === "Deactivated" ? "bg-red-100 text-red-700 hover:bg-red-100" :
                                                                    "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                                    )}
                                                >
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {new Date(user.regDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 text-xs">
                                                    {/* VIEW: Always visible for CGSADM/CGSS */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-primary transition-colors border-slate-200"
                                                        title="View Details"
                                                        onClick={() => navigate(`/cgs/users/${user.id}/verify?intent=view`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {/* PENDING: Verify + Deactivate (Admin only) */}
                                                    {user.status === "Pending" && !isCGSS && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-2 text-primary border-primary hover:bg-primary/5"
                                                                onClick={() => navigate(`/cgs/users/${user.id}/verify?intent=verify`)}
                                                            >
                                                                Verify
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-2 text-destructive border-destructive hover:bg-destructive/5"
                                                                onClick={() => navigate(`/cgs/users/${user.id}/verify?intent=deactivate`)}
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* ACTIVE: Assign + Deactivate (Admin) OR Assign only (CGSS) */}
                                                    {user.status === "Active" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                                                                onClick={() => navigate(`/cgs/users/${user.id}/assign`)}
                                                            >
                                                                <UserPlus className="h-4 w-4 mr-1" />
                                                                Assign
                                                            </Button>
                                                            {!isCGSS && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 px-2 text-destructive border-destructive hover:bg-destructive/5"
                                                                    onClick={() => navigate(`/cgs/users/${user.id}/verify?intent=deactivate`)}
                                                                >
                                                                    Deactivate
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* INACTIVE: Reactivate */}
                                                    {user.status === "Inactive" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 px-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleReactivateRequest(user)}
                                                        >
                                                            Reactivate
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {!loading && filteredUsers.length > 0 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>
                )
                }
            </Card >
        </div >
    );
}
