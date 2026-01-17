import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { CheckCircle, Loader2, User, Mail, Calendar, UserCheck, AlertCircle, XCircle, ShieldAlert, GraduationCap, Building2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Unified Approvals Page
 * Access: 
 * - Directors/Admins: Approve/Reject actions available.
 * - Executives: Read-only view of pending assignments.
 */
export default function UserAssignmentApproval() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);
    const [rejecting, setRejecting] = useState(null);

    // Rejection Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionRemark, setRejectionRemark] = useState("");
    const [targetAssignment, setTargetAssignment] = useState(null);

    // Boolean flags for role-based features
    const isAdmin = user?.role_id === "CGSADM";
    const isDirector = user?.role_id === "CGSS" && user?.role_level === "Director";
    const canPerformActions = isAdmin || isDirector;

    useEffect(() => {
        fetchPendingAssignments();
    }, []);

    const fetchPendingAssignments = async () => {
        try {
            setLoading(true);
            // Use the general pending assignments endpoint
            const res = await api.get("/api/admin/assignments/pending");
            if (res.data?.success) {
                setAssignments(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch pending assignments:", err);
            toast.error("Failed to load pending assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (assignmentId) => {
        if (!canPerformActions) return;
        try {
            setApproving(assignmentId);
            const res = await api.post("/api/admin/assignments/approve", {
                assignment_id: assignmentId,
            });

            if (res.data?.success) {
                toast.success("Assignment approved successfully");
                setAssignments((prev) => prev.filter((a) => a.assignment_id !== assignmentId));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve assignment");
        } finally {
            setApproving(null);
        }
    };

    const handleReject = async () => {
        if (!canPerformActions || !targetAssignment || rejectionRemark.length < 10) return;

        try {
            setRejecting(targetAssignment.assignment_id);
            const res = await api.post("/api/admin/assignments/reject", {
                assignment_id: targetAssignment.assignment_id,
                remarks: rejectionRemark
            });

            if (res.data?.success) {
                toast.success("Assignment rejected with reason.");
                setAssignments((prev) => prev.filter((a) => a.assignment_id !== targetAssignment.assignment_id));
                setIsRejectModalOpen(false);
                setRejectionRemark("");
                setTargetAssignment(null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject assignment");
        } finally {
            setRejecting(null);
        }
    };

    const openRejectModal = (assignment) => {
        if (!canPerformActions) return;
        setTargetAssignment(assignment);
        setRejectionRemark("");
        setIsRejectModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Role Assignment Approvals</h1>
                    <p className="text-muted-foreground text-sm">
                        {canPerformActions
                            ? "Review and approve role assignments requested by Executive staff"
                            : "View pending assignments awaiting Director approval"}
                    </p>
                </div>
                {!canPerformActions && (
                    <Badge variant="outline" className="h-fit bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-2 py-1 px-3">
                        <Info className="h-3.5 w-3.5" />
                        Read-Only View (Executive)
                    </Badge>
                )}
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Pending Assignments</span>
                        <Badge variant="secondary">{assignments.length} pending</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">Loading assignments...</span>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <p className="font-medium">No pending assignments to review</p>
                            <p className="text-sm mt-2">All assignments have been processed</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignments.map((assignment) => (
                                <Card key={assignment.assignment_id} className="border-l-4 border-l-blue-500 overflow-hidden">
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Student Info */}
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Student</p>
                                                <div className="flex items-start gap-2">
                                                    <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{assignment.studentName}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate text-wrap">
                                                            <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                                                            {assignment.studentLevel} • {assignment.studentProgram}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                                            <Mail className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{assignment.studentEmail}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1 font-mono bg-slate-100 w-fit px-1 rounded">
                                                            ID: {assignment.student_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Staff Info */}
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Proposed {assignment.staff_type_label || assignment.staff_type}</p>
                                                <div className="flex items-start gap-2">
                                                    <UserCheck className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{assignment.staffName}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate text-wrap">
                                                            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                                            {assignment.assignment_type}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                                            <Mail className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{assignment.staffEmail}</span>
                                                        </p>
                                                        <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-100">
                                                            {assignment.staff_type_label || (assignment.staff_type === 'SUV' ? 'Supervisor' : 'Examiner')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Requester Info */}
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Requested By</p>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{assignment.requesterName}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{assignment.requesterEmail}</p>
                                                    <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                                                        {assignment.requesterRoleType}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request Date & Action */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                Requested on {new Date(assignment.request_date).toLocaleDateString()}
                                            </div>

                                            {canPerformActions && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openRejectModal(assignment)}
                                                        disabled={approving === assignment.assignment_id || rejecting === assignment.assignment_id}
                                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleApprove(assignment.assignment_id)}
                                                        disabled={approving === assignment.assignment_id || rejecting === assignment.assignment_id}
                                                        className="bg-green-600 hover:bg-green-700 h-9"
                                                    >
                                                        {approving === assignment.assignment_id ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Approving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* REJECTION MODAL */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            Reject Assignment Request
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a clear justification for rejecting this assignment.
                            Min 10 characters required.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Reason for Rejection</Label>
                            <Textarea
                                id="remarks"
                                placeholder="e.g., Staff is currently over capacity for this semester..."
                                value={rejectionRemark}
                                onChange={(e) => setRejectionRemark(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">
                                {rejectionRemark.length} / 10 characters minimum
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={rejectionRemark.length < 10 || rejecting}
                            onClick={handleReject}
                        >
                            {rejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Confirm Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
