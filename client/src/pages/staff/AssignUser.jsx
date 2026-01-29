import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, ArrowLeft, Loader2, Plus, Trash2, Search, CheckCircle2, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import adminService from "@/services/adminService";
import UserDetailCard from "@/components/users/UserDetailCard";
import ConfirmRegisterModal from "@/components/modal/ConfirmRegisterModal";

export default function AssignUser() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Assignment State
    const [existingAssignments, setExistingAssignments] = useState([]);
    const [pendingAssignments, setPendingAssignments] = useState([]); // Drafts

    // Search State
    const [assignRole, setAssignRole] = useState(""); // Supervisor, Examiner, Student
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

    const [assignmentTypes, setAssignmentTypes] = useState([]);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

    useEffect(() => {
        fetchTypes();
        fetchData();
    }, [id]);

    const fetchTypes = async () => {
        try {
            const res = await adminService.getAssignmentTypes();
            if (res && res.success) {
                setAssignmentTypes(res.data);
            }
        } catch (err) {
            console.error("Failed to load assignment types", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Target User directly by ID
            const res = await adminService.getSystemUserById(id);
            if (res?.success && res.data) {
                const found = res.data;

                // Security check: Must be Registered or Active
                const isAcceptableStatus = found.status === 'Registered' || found.status === 'Active';
                if (!isAcceptableStatus) {
                    toast.error(`User is ${found.status}. Direct assignment is restricted.`);
                    navigate("/cgs/users");
                    return;
                }

                setTargetUser(found);

                // 2. Fetch Existing Assignments
                const type = found.userType === 'student' ? 'student' : 'staff';
                const lookupId = found.id;

                setAssignmentsLoading(true);
                try {
                    const assignRes = await adminService.getAssignments(lookupId, type);
                    if (assignRes?.success) {
                        setExistingAssignments(assignRes.data);
                    }
                } finally {
                    setAssignmentsLoading(false);
                }
            } else {
                toast.error("User profile not found in system.");
                navigate("/cgs/users");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load user record");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setSearching(true);
        setSearchResult(null);
        try {
            const searchType = targetUser.userType === 'student' ? 'staff' : 'student';
            const res = await adminService.searchUserForAssignment(searchQuery, searchType);

            if (res?.success && res.data) {
                const found = res.data;

                // Relaxed guard: ONLY block if it's the EXACT same account (Internal ID match)
                if (found.id === targetUser.id) {
                    toast.error("Cannot assign a user to themselves.");
                    return;
                }

                // Security check: Ensure search result matches expected type
                if (searchType !== found.userType) {
                    toast.error(`Expected ${searchType} but found ${found.userType}.`);
                    return;
                }

                setSearchResult(found);
            } else {
                toast.warning("User not found or not active.");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Search failed";
            toast.error(msg);
        } finally {
            setSearching(false);
        }
    };

    const addToStack = () => {
        if (!searchResult) return;

        // LIMIT CHECK (Frontend Draft)
        const totalCount = existingAssignments.length + pendingAssignments.length;
        if (totalCount >= 12) {
            toast.error("Limit Reached: Maximum 12 assignments allowed.");
            return;
        }

        // MAIN SUPERVISOR LOCK (Safeguard)
        const selectedRole = assignRole; // e.g., 'Main Supervisor'
        if (selectedRole === 'Main Supervisor') {
            const hasMain = existingAssignments.some(a => a.assignment_type === 'Main Supervisor' && ['Pending', 'Approved'].includes(a.status)) ||
                pendingAssignments.some(p => p.assignRole === 'Main Supervisor');

            if (hasMain) {
                toast.error("Validation Error: This student already has an active Main Supervisor.");
                return;
            }
        }

        // DUPLICATE CHECK
        // DUPLICATE CHECK (Use Internal ID for reliability)
        const isDuplicate = existingAssignments.some(a => (a.pgstaff_id === searchResult.id || a.pg_student_id === searchResult.id)) ||
            pendingAssignments.some(p => p.id === searchResult.id);

        if (isDuplicate) {
            toast.error("User is already assigned or in drafts.");
            return;
        }

        setPendingAssignments([...pendingAssignments, {
            ...searchResult,
            assignRole: selectedRole || (targetUser.userType === 'student' ? 'Co-Supervisor' : 'Student')
        }]);
        setSearchResult(null);
        setSearchQuery("");
        toast.success("Added to stack.");
    };

    const removeFromStack = (index) => {
        const newStack = [...pendingAssignments];
        newStack.splice(index, 1);
        setPendingAssignments(newStack);
    };

    const handleFinalAssign = async () => {
        if (pendingAssignments.length === 0) return;
        setSubmitting(true);
        try {
            let successCount = 0;
            for (const item of pendingAssignments) {
                const isStudentTarget = targetUser.userType === 'student';

                const payload = {
                    student_id: isStudentTarget ? targetUser.id : item.id,
                    staff_id: isStudentTarget ? item.id : targetUser.id,
                    // Map Role if generic
                    staff_type: isStudentTarget ? (item.assignRole?.includes('Supervisor') ? 'Supervisor' : 'Examiner') : (targetUser.roleId?.includes('EXA') ? 'Examiner' : 'Supervisor'),
                    assignment_type: isStudentTarget ? item.assignRole : 'Main Supervisor' // Use specific type
                };

                const res = await adminService.requestAssignment(payload);
                if (res?.success) successCount++;
            }

            if (successCount > 0) {
                toast.success(`Successfully requested ${successCount} assignments. Waiting for Director approval.`);
                setPendingAssignments([]);
                fetchData(); // Refresh existing
            }
        } catch (err) {
            console.error("Assign Error:", err);
            // 12-Slot Limit Feedback
            const msg = err.response?.data?.message || "";
            if (msg.includes("limit") || msg.includes("12")) {
                toast.error("Capacity Reached: Student or Staff has hit the maximum limit of 12 assignments.");
            } else {
                toast.error(msg || "Assignment failed.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAssignment = (assignmentId) => {
        setAssignmentToDelete(assignmentId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAssignment = async () => {
        if (!assignmentToDelete) return;
        setIsDeletingAssignment(true);
        try {
            const res = await adminService.deleteAssignment(assignmentToDelete);
            if (res?.success) {
                toast.success("Assignment deleted successfully.");
                fetchData(); // Refresh list
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete assignment.");
        } finally {
            setIsDeletingAssignment(false);
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!targetUser) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground space-y-4">
            <div className="p-4 bg-slate-100 rounded-full">
                <User className="h-12 w-12 opacity-30" />
            </div>
            <div className="text-center">
                <p className="font-bold text-lg text-foreground">Account Profile Not Found</p>
                <p className="text-sm">The user ID "{id}" does not exist or has been removed.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/cgs/users")}>
                Return to Directory
            </Button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-6">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/cgs/users")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Assign Academic Roles</h1>
                    <p className="text-muted-foreground">Manage thesis supervision and examination assignments.</p>
                </div>
            </header>

            {/* TARGET USER CARD */}
            <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Target User</h3>
                <UserDetailCard user={targetUser} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: ASSIGNMENT CONTROLS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add Assignment</CardTitle>
                        <CardDescription>Select role and search for user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {targetUser.userType === 'student' && (
                            <div className="space-y-2">
                                <Label>Select Role</Label>
                                <Select value={assignRole} onValueChange={setAssignRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignmentTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                        <Label>Search User (ID or Email)</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder={assignRole ? "Enter identifier..." : "Select a role first"}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={!assignRole || searching}
                                className={!assignRole ? "bg-slate-100 cursor-not-allowed" : ""}
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={!assignRole || searching || !searchQuery.trim()}
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                        {!assignRole && (
                            <p className="text-[11px] text-slate-400 mt-1">
                                Choose a role before searching for staff to assign.
                            </p>
                        )}
                        </div>

                        {searchResult && (
                            <div className="mt-4 border rounded-md p-3 relative bg-emerald-50/50">
                                <Button
                                    size="sm" variant="ghost" className="absolute top-2 right-2"
                                    onClick={() => setSearchResult(null)}
                                >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <p className="text-sm font-medium">{searchResult.fullName}</p>
                                <p className="text-xs text-muted-foreground">{searchResult.identifier}</p>
                                <div className="mt-3">
                                    <Button size="sm" className="w-full" onClick={addToStack}>
                                        <Plus className="h-4 w-4 mr-2" /> Add to Stack
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* RIGHT: STACK & ASSIGNED */}
                <div className="space-y-6">
                    {/* DRAFT STACK */}
                    {pendingAssignments.length > 0 && (
                        <Card className="border-emerald-200 bg-emerald-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                                    <Plus className="h-5 w-5" /> Pending Assignments (Draft)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {pendingAssignments.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border">
                                        <div>
                                            <p className="font-medium">{item.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{item.identifier} • {item.assignRole}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeFromStack(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleFinalAssign} disabled={submitting}>
                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Final Decision: Request Approval
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* EXISTING */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Assignments</CardTitle>
                            <CardDescription>{existingAssignments.length} / 12 slots used</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assignmentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : existingAssignments.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No active assignments.</p>
                            ) : (
                                <div className="space-y-3">
                                    {existingAssignments.map((a, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {a.otherUserName || 'User'}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] h-5",
                                                        a.status === 'Rejected' ? "border-red-200 bg-red-50 text-red-700" :
                                                            a.status === 'Approved' ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                                                "border-amber-200 bg-amber-50 text-amber-700"
                                                    )}
                                                >
                                                    {a.assignment_type || a.role} • {a.status}
                                                </Badge>
                                                {a.status === 'Rejected' && a.remarks && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button className="ml-2 text-red-500 hover:text-red-700 transition-colors">
                                                                    <Info className="h-3.5 w-3.5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[250px] bg-white border shadow-md p-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                                        <ShieldAlert className="h-3 w-3" />
                                                                        Rejection Reason
                                                                    </p>
                                                                    <p className="text-xs leading-relaxed">{a.remarks}</p>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                onClick={() => handleDeleteAssignment(a.assignment_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ConfirmRegisterModal
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setAssignmentToDelete(null);
                    }
                }}
                title="Delete Assignment"
                description="Are you sure you want to delete this assignment? This action cannot be undone."
                confirmText={isDeletingAssignment ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                onConfirm={confirmDeleteAssignment}
            />
        </div>
    );
}
