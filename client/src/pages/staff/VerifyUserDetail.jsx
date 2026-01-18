import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Building, Calendar, CheckCircle2, XCircle, ArrowLeft, Loader2, Shield, Phone, Briefcase, RefreshCw, AlertTriangle, GraduationCap, BookOpen, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import adminService from "@/services/adminService";
import api from "@/services/api";
import { cn } from "@/lib/utils";

/**
 * VerifyUserDetail Component
 * Premium read-only profile view with deep-fetch verification/management capabilities.
 */
export default function VerifyUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: currentUser } = useAuth();
    const isCGSADM = currentUser?.role_id === "CGSADM";
    const isCGSS = currentUser?.role_id === "CGSS";

    // Parse intent from query params (verify, reactivate, deactivate, view)
    const queryParams = new URLSearchParams(location.search);
    const intent = queryParams.get("intent") || "view";

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            // Perform Deep Fetch
            const res = await adminService.getUserDetails(id);
            if (res?.success && res?.data) {
                setUser(res.data);
            } else {
                toast.error("User not found in system records");
                navigate("/cgs/users");
            }
        } catch (err) {
            console.error("Error fetching user details:", err);
            toast.error(err.response?.data?.message || "Failed to load user details");
            navigate("/cgs/users");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            const userId = user.id;

            if ((intent === "reactivate" || (intent === 'view' && user.status === 'Inactive')) && isCGSS) {
                // Request Reactivation (Email for CGSS)
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
                // Direct Toggle (CGSADM)
                await adminService.toggleUserStatus(userId, newStatus);
                const actionVerb = newStatus === "Active" ? (user.status === 'Pending' ? "verified" : "reactivated") : "deactivated";
                toast.success(`User ${actionVerb} successfully.`);
            }

            navigate("/cgs/users");
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!user) return null;

    // Mode-specific configuration
    const config = {
        verify: {
            title: "Verify User Registration",
            description: "Critically review account details before granting system access.",
            primaryAction: "Approve & Register",
            primaryColor: "bg-emerald-600 hover:bg-emerald-700",
            secondaryAction: "Reject & Deactivate",
            secondaryVariant: "outline",
            icon: <Shield className="h-6 w-6 text-emerald-600" />
        },
        reactivate: {
            title: isCGSS ? "Request Reactivation" : "Reactivate Account",
            description: isCGSS
                ? "Send a request to the CGS Administrator to restore this user's access."
                : "Restore system access for this user immediately.",
            primaryAction: isCGSS ? "Send Request" : "Reactivate User",
            primaryColor: "bg-blue-600 hover:bg-blue-700",
            secondaryAction: "Back",
            secondaryVariant: "ghost",
            icon: <RefreshCw className="h-6 w-6 text-blue-600" />
        },
        deactivate: {
            title: "Deactivate User",
            description: "Revoke all system access and change account status to Inactive.",
            primaryAction: "Confirm Deactivation",
            primaryColor: "bg-destructive hover:bg-destructive/90",
            secondaryAction: "Cancel",
            secondaryVariant: "ghost",
            icon: <AlertTriangle className="h-6 w-6 text-destructive" />
        },
        view: {
            title: "User Profile Record",
            description: "Comprehensive read-only view of the user's system profile.",
            primaryAction: user.status === 'Pending' ? "Verify User" : (user.status === 'Active' ? "Deactivate" : "Reactivate"),
            primaryColor: user.status === 'Pending' ? "bg-emerald-600 hover:bg-emerald-700" : (user.status === 'Active' ? "bg-destructive hover:bg-destructive/90" : "bg-blue-600 hover:bg-blue-700"),
            secondaryAction: "Back to List",
            secondaryVariant: "ghost",
            icon: <Eye className="h-6 w-6 text-slate-400" />
        }
    }[intent] || config.view;

    const infoGroups = [
        {
            title: "Profile Details",
            icon: <User className="h-4 w-4 text-primary" />,
            items: [
                { label: "Full Name", value: user.fullName },
                { label: "Email Address", value: user.email },
                { label: "Gender", value: user.gender || "Not specified" },
                { label: "Identification", value: user.identifier, subLabel: user.identifierLabel },
                { label: "Registration Date", value: user.regDate ? new Date(user.regDate).toLocaleDateString() : "N/A" },
                { label: "Country", value: user.country }
            ]
        },
        {
            title: "Professional Details",
            icon: <Briefcase className="h-4 w-4 text-primary" />,
            items: [
                { label: "Primary Role", value: user.roleLabel },
                { label: "Academic Rank", value: user.Academic_Rank, condition: !!user.Academic_Rank },
                { label: "Department", value: user.departmentLabel },
                { label: "Program / Specialization", value: user.programName || "Internal Staff Profile", condition: user.userType === "student" },
                { label: "Contact Phone", value: user.phoneNumber || "Not provided" },
                { label: "Institutional Affiliation", value: user.affiliation || "AIU Internal", condition: user.userType === "staff" }
            ].filter(i => i.condition !== false)
        },
        {
            title: "Academic Qualifications",
            icon: <GraduationCap className="h-4 w-4 text-primary" />,
            condition: user.userType === "staff",
            type: "list",
            items: user.qualifications?.length > 0 ? user.qualifications.map(q => ({
                content: q.name,
                badge: q.level
            })) : [{ content: "No qualifications recorded", badge: null }]
        },
        {
            title: "Research Expertise",
            icon: <BookOpen className="h-4 w-4 text-primary" />,
            condition: user.userType === "staff",
            type: "cloud",
            items: user.expertises?.map(e => e.name) || [],
            footer: user.expertise && user.expertise !== "N/A" ? `Additional: ${user.expertise}` : null
        }
    ].filter(g => g.condition !== false);

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            {/* Premium Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/cgs/users")} className="h-10 w-10 text-slate-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-md">
                        <User className="h-10 w-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {user.Honorific_Titles && `${user.Honorific_Titles} `}
                                {user.FirstName} {user.LastName}
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <span className="font-mono text-xs text-primary bg-primary/5 px-2 py-0.5 rounded">{user.identifier}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm">{user.email}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1 relative z-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Type</span>
                    <Badge variant="outline" className="text-xs font-bold bg-white text-slate-700 border-slate-200 px-4 py-1">
                        {user.userType === 'staff' ? 'Academic Staff' : 'Postgraduate Student'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Section */}
                <div className="lg:col-span-2 space-y-6">
                    {infoGroups.map((group, idx) => (
                        <Card key={idx} className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary/30">
                            <CardHeader className="pb-4 bg-slate-50/50 flex flex-row items-center gap-2 border-b">
                                {group.icon}
                                <CardTitle className="text-base font-bold text-slate-800">{group.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {group.type === "list" ? (
                                    <div className="space-y-4">
                                        {group.items.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="text-sm font-semibold text-slate-700">{item.content}</span>
                                                {item.badge && <Badge className="bg-primary/10 text-primary border-none text-[10px]">{item.badge}</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                ) : group.type === "cloud" ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {group.items.length > 0 ? group.items.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="px-3 py-1 bg-white text-slate-600 border-slate-200 font-medium">
                                                    {tag}
                                                </Badge>
                                            )) : <span className="text-sm text-slate-400 italic">No expertise recorded</span>}
                                        </div>
                                        {group.footer && (
                                            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700 border border-amber-100 italic">
                                                {group.footer}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                                        {group.items.map((item, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-700 leading-tight">{item.value || "N/A"}</p>
                                                {item.subLabel && <p className="text-[10px] text-slate-400 italic font-medium">{item.subLabel}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sidebar: Status & Actions */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-slate-50 overflow-hidden">
                        <CardHeader className="pb-4 bg-slate-100/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-500">
                                <Shield className="h-4 w-4" />
                                Review Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="text-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Badge
                                    className={cn(
                                        "px-4 py-1.5 font-bold text-xs uppercase rounded-full",
                                        user.status === "Active" ? "bg-emerald-500 text-white" :
                                            user.status === "Pending" ? "bg-amber-500 text-white" :
                                                "bg-slate-500 text-white"
                                    )}
                                >
                                    {user.status}
                                </Badge>
                            </div>

                            {/* <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">User Account Verification Status</span>
                                    <span className="font-bold text-slate-700">{user.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200/60">
                                    <span className="text-slate-500">Access Level</span>
                                    <span className="font-bold text-slate-700">Restricted</span>
                                </div>
                            </div> */}
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/20 shadow-xl relative overflow-hidden bg-white">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                        <CardHeader className="pt-8 pb-4">
                            <h3 className="text-lg font-bold text-center flex items-center justify-center gap-2">
                                {config.icon}
                                Actions
                            </h3>
                            <CardDescription className="text-center text-xs px-4 mt-2">
                                {config.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 pb-8 pt-4 px-6">
                            <Button
                                className={cn("w-full h-12 text-sm font-bold shadow-md transition-all active:scale-[0.98]", config.primaryColor)}
                                disabled={actionLoading || (intent === 'view' && user.status === 'Active' && !isCGSADM)}
                                onClick={() => {
                                    if (intent === 'view') {
                                        if (user.status === 'Pending') navigate(`?intent=verify`);
                                        else if (user.status === 'Active') navigate(`?intent=deactivate`);
                                        else navigate(`?intent=reactivate`);
                                    } else {
                                        handleStatusUpdate(intent === 'deactivate' ? "Inactive" : "Active");
                                    }
                                }}
                            >
                                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                {config.primaryAction}
                            </Button>

                            <Button
                                variant={config.secondaryVariant}
                                className={cn(
                                    "w-full h-11 font-semibold text-xs",
                                    config.secondaryVariant === "outline" ? "text-destructive border-destructive hover:bg-destructive/5" : "text-slate-400 hover:text-slate-600"
                                )}
                                disabled={actionLoading}
                                onClick={() => {
                                    if (intent === 'view') navigate("/cgs/users");
                                    else if (intent === 'verify') handleStatusUpdate("Inactive");
                                    else navigate("?intent=view");
                                }}
                            >
                                {intent === 'verify' && <XCircle className="h-4 w-4 mr-2" />}
                                {config.secondaryAction}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
