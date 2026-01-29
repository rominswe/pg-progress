import { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';
import { UserPlus, Building, CheckCircle2, User, Users, Search, BookOpen, Calendar, GraduationCap, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function InternalRegisterForm({ onRegister, isSubmitting }) {
    const [searching, setSearching] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [searchResult, setSearchResult] = useState(null);

    const [form, setForm] = useState({
        userType: "staff", // 'staff' | 'student'
        identifier: "",
        roleId: "",
        roleType: "Executive",
        expertise: "",
        acadYearStart: "",
        acadYearEnd: "",
        Semester: "1",
        Exp_GraduatedYear: "",
        Prog_Code: "",
        selectedDepCode: "",
        qualification_codes: [],
        expertise_codes: [],
        Honorific_Titles: "",
        Academic_Rank: ""
    });
    const [metadata, setMetadata] = useState({
        qualifications: [],
        expertise: [],
        staffMetadata: { honorificTitles: [], academicRanks: [] }
    });

    const yearRange = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 31 }, (_, i) => (currentYear - 10 + i).toString());
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [rolesRes, programsRes, deptsRes, qualRes, staffMetaRes, expertiseRes] = await Promise.all([
                    api.get('/api/admin/roles/assignable'),
                    api.get('/api/admin/program/assignable'),
                    api.get('/api/departments'),
                    api.get('/api/admin/academic-credentials/qualifications'),
                    api.get('/api/admin/academic-credentials/staff-metadata'),
                    api.get('/api/admin/academic-credentials/expertise')
                ]);

                if (rolesRes.data?.success && Array.isArray(rolesRes.data?.data)) {
                    const filtered = rolesRes.data.data.filter(r => !r.label.toLowerCase().includes('admin'));
                    setRoles(filtered);
                }
                setPrograms(programsRes.data?.data?.programs || []);
                setDepartments(deptsRes.data?.data?.departmentInfoAccess || []);
                setMetadata(prev => ({
                    ...prev,
                    qualifications: qualRes.data?.data || [],
                    staffMetadata: staffMetaRes.data?.data || { honorificTitles: [], academicRanks: [] },
                    expertise: expertiseRes?.data?.data || []
                }));
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        loadData();
    }, []);


    const expertiseOptions = useMemo(() => {
        return metadata.expertise.map(e => {
            const dept = departments.find(d => d.Dep_Code === e.Dep_Code);
            const deptName = dept ? dept.DepartmentName : e.Dep_Code;

            return {
                ...e,
                deptName
            };
        });
    }, [metadata.expertise, departments]);

    useEffect(() => {
        if (searchResult) {
            if (form.userType === 'student') {
                setForm(prev => ({
                    ...prev,
                    Prog_Code: searchResult.rawProgCode || prev.Prog_Code,
                    acadYearStart: searchResult.acadYearStart || prev.acadYearStart,
                    acadYearEnd: searchResult.acadYearEnd || prev.acadYearEnd,
                    Exp_GraduatedYear: searchResult.rawGradYear || prev.Exp_GraduatedYear
                }));
            } else if (form.userType === 'staff') {
                setForm(prev => ({
                    ...prev,
                    expertise: searchResult.fieldExpertise || prev.expertise,
                    selectedDepCode: searchResult.departmentCode || prev.selectedDepCode
                }));
            }
        }
    }, [searchResult, form.userType]);

    const handleSearch = async () => {
        if (!form.identifier) {
            toast.error("Please enter an ID to search");
            return;
        }
        setSearching(true);
        setSearchResult(null);
        try {
            const role = form.userType === 'student' ? 'Student' : 'Academic Staff';
            const res = await api.get(`/api/admin/search-info?role=${role}&type=internal&query=${form.identifier}`);
            const payload = res.data?.data || res.data;

            if (payload && payload.found) {
                let normalizedUser = null;
                if (payload.registered && payload.systemRecord) {
                    normalizedUser = payload.systemRecord;
                } else if (payload.source) {
                    const s = payload.source;
                    const deptObj = departments.find(d => d.Dep_Code === (s.Dep_Code || s.Department));
                    const deptName = deptObj ? deptObj.DepartmentName : (s.Department || s.Dep_Code || 'N/A');
                    const progObj = programs.find(p => p.Prog_Code === s.Prog_Code);
                    const progName = progObj ? progObj.prog_name : (s.Prog_Code || 'N/A');
                    const sourceRoleObj = roles.find(r => r.id === s.role);
                    const sourceRoleLabel = sourceRoleObj ? sourceRoleObj.label : (s.role || (form.userType === 'student' ? 'Student' : 'Academic Staff'));

                    normalizedUser = {
                        fullName: `${s.FirstName} ${s.LastName}`,
                        firstName: s.FirstName,
                        lastName: s.LastName,
                        email: s.EmailId,
                        departmentName: deptName,
                        departmentCode: s.Dep_Code,
                        roleLabel: sourceRoleLabel,
                        status: 'Unregistered',
                        identifier: s.emp_id || s.stu_id || s.pgstud_id || payload.source.id,
                        gender: s.Gender,
                        dob: s.Dob,
                        address: s.Address,
                        phoneNumber: s.Phonenumber,
                        country: s.Country || "Malaysia",
                        rawProgCode: s.Prog_Code,
                        progName: progName,
                        rawGradYear: s.Exp_GraduatedYear
                    };
                }

                if (normalizedUser) {
                    setSearchResult(normalizedUser);
                    toast.success("User found. Please confirm details.");
                } else {
                    toast.error("Invalid data received from server.");
                }
            } else {
                toast.error("User not found in master records");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "User not found in master records");
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!searchResult) return toast.error("Please search and confirm the user details first");

        if (form.userType === 'staff') {
            if (!form.roleId) return toast.error("Please select a role");
            // Fields are now optional as requested
        }

        if (form.userType === 'student') {
            if (!form.Prog_Code || !form.acadYearStart || !form.acadYearEnd || !form.Exp_GraduatedYear) {
                return toast.error("Please fill in all required academic details");
            }
            if (parseInt(form.acadYearStart) > parseInt(form.acadYearEnd)) {
                return toast.error("Academic Year start cannot be after the end year");
            }
        }

        const payload = {
            identifier: form.identifier,
            searchRole: form.userType === 'student' ? 'Student' : 'Academic Staff',
            staffType: 'internal',
            targetRole: form.userType === 'staff' ? form.roleId : undefined,
            roleType: form.roleId === 'CGSS' ? form.roleType : undefined,
            expertise: form.expertise,
            Acad_Year: form.userType === 'student' ? `${form.acadYearStart}/${form.acadYearEnd}` : undefined,
            Semester: form.Semester,
            Exp_GraduatedYear: form.Exp_GraduatedYear,
            Prog_Code: form.Prog_Code,
            EmailId: searchResult.email,
            FirstName: searchResult.firstName,
            LastName: searchResult.lastName,
            Gender: searchResult.gender,
            Dob: searchResult.dob,
            Address: searchResult.address,
            Phonenumber: searchResult.phoneNumber,
            Country: searchResult.country,
            Dep_Code: form.selectedDepCode || searchResult.departmentCode,
            qualification_codes: form.qualification_codes,
            expertise_codes: form.expertise_codes,
            Honorific_Titles: form.Honorific_Titles,
            Academic_Rank: form.Academic_Rank
        };

        onRegister(payload, () => {
            setForm({
                userType: "staff",
                identifier: "",
                roleId: "",
                roleType: "Executive",
                expertise: "",
                acadYearStart: "",
                acadYearEnd: "",
                Semester: "1",
                Exp_GraduatedYear: "",
                Prog_Code: "",
                selectedDepCode: "",
                qualification_codes: [],
                expertise_codes: [],
                Honorific_Titles: "",
                Academic_Rank: ""
            });
            setSearchResult(null);
        });
    };

    return (
        <Card className="border-t-4 border-t-primary shadow-md">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Internal User Registration
                </CardTitle>
                <CardDescription>
                    Search and confirm existing Students or Employees (AIU-ID required).
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Step 1: Select User Type</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => { setForm(p => ({ ...p, userType: 'staff' })); setSearchResult(null); }}
                                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 ${form.userType === 'staff' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-muted'}`}
                                >
                                    <Users className={`h-6 w-6 ${form.userType === 'staff' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className="font-medium">Academic Staff</span>
                                </div>
                                <div
                                    onClick={() => { setForm(p => ({ ...p, userType: 'student' })); setSearchResult(null); }}
                                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 ${form.userType === 'student' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-muted'}`}
                                >
                                    <User className={`h-6 w-6 ${form.userType === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className="font-medium">Student</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="identifier" className="text-base font-medium">
                                Step 2: {form.userType === 'student' ? 'Student ID' : 'Employee ID'} <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="identifier"
                                        placeholder={form.userType === 'student' ? 'Enter Student ID' : 'Enter Employee ID'}
                                        className="pl-10 h-11 text-lg"
                                        value={form.identifier}
                                        onChange={(e) => { setForm(p => ({ ...p, identifier: e.target.value })); setSearchResult(null); }}
                                    />
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                </div>
                                <Button type="button" onClick={handleSearch} disabled={searching} className="h-11 px-6">
                                    {searching ? "Searching..." : "Search"}
                                </Button>
                            </div>
                        </div>

                        {searchResult && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 animate-in fade-in zoom-in-95">
                                <h4 className="font-semibold text-emerald-900 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> User Confirmed
                                </h4>
                                <div className="grid grid-cols-2 text-sm gap-y-2">
                                    <span className="text-emerald-700 font-medium">Name:</span>
                                    <span className="text-emerald-900">{searchResult.fullName}</span>

                                    <span className="text-emerald-700 font-medium">{form.userType === 'student' ? 'Student ID' : 'Employee ID'}:</span>
                                    <span className="text-emerald-900">{searchResult.identifier}</span>

                                    <span className="text-emerald-700 font-medium">Email:</span>
                                    <span className="text-emerald-900 break-all">{searchResult.email || searchResult.EmailId}</span>

                                    <span className="text-emerald-700 font-medium">Role:</span>
                                    <span className="text-emerald-900">{searchResult.roleLabel || (form.userType === 'student' ? 'Student' : 'Academic Staff')}</span>

                                    <span className="text-emerald-700 font-medium">Department:</span>
                                    <span className="text-emerald-900">{searchResult.departmentName || searchResult.departmentLabel || searchResult.departmentCode || 'N/A'}</span>

                                    {form.userType === 'student' && searchResult.progName && (
                                        <>
                                            <span className="text-emerald-700 font-medium">Program:</span>
                                            <span className="text-emerald-900">{searchResult.progName}</span>
                                        </>
                                    )}

                                    <span className="text-emerald-700 font-medium">Gender:</span>
                                    <span className="text-emerald-900 capitalize">{searchResult.gender || '-'}</span>

                                    <span className="text-emerald-700 font-medium">Country:</span>
                                    <span className="text-emerald-900">{searchResult.country}</span>

                                    <span className="text-emerald-700 font-medium">Status:</span>
                                    <Badge variant="secondary" className={cn(
                                        "w-fit font-bold text-[10px]",
                                        searchResult.status === "Unregistered" ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {searchResult.status}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {searchResult ? (
                            <>
                                <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg border space-y-6 h-full shadow-inner animate-in slide-in-from-right-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-primary" />
                                        Step 3: Registration Details
                                    </h3>

                                    {form.userType === 'student' ? (
                                        <>
                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Select Program *</Label>
                                                <Select value={form.Prog_Code} onValueChange={(val) => setForm(p => ({ ...p, Prog_Code: val }))}>
                                                    <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Choose program..." /></SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        {programs.map(p => <SelectItem key={p.Prog_Code} value={p.Prog_Code}>{p.prog_name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Academic Intake Year *</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Select value={form.acadYearStart} onValueChange={(v) => setForm(p => ({ ...p, acadYearStart: v }))}>
                                                            <SelectTrigger className="bg-white"><SelectValue placeholder="Start" /></SelectTrigger>
                                                            <SelectContent className="bg-white">{yearRange.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                        <Select value={form.acadYearEnd} onValueChange={(v) => setForm(p => ({ ...p, acadYearEnd: v }))}>
                                                            <SelectTrigger className="bg-white"><SelectValue placeholder="End" /></SelectTrigger>
                                                            <SelectContent className="bg-white">{yearRange.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Current Semester (1-10) *</Label>
                                                    <Input type="number" min="1" max="10" value={form.Semester} onChange={(e) => setForm(p => ({ ...p, Semester: e.target.value }))} className="bg-white" placeholder="1" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Expected Graduation Year *</Label>
                                                <div className="flex items-center gap-2">
                                                    <Select value={form.Exp_GraduatedYear || ""} onValueChange={(v) => setForm(p => ({ ...p, Exp_GraduatedYear: v }))}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Year" /></SelectTrigger>
                                                        <SelectContent className="bg-white">{yearRange.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-3">
                                                <Label>Select Role *</Label>
                                                <Select value={form.roleId} onValueChange={(val) => setForm(p => ({ ...p, roleId: val }))}>
                                                    <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Choose a role..." /></SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label>Honorific Title (Optional)</Label>
                                                    <Select value={form.Honorific_Titles} onValueChange={(val) => setForm(p => ({ ...p, Honorific_Titles: val }))}>
                                                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select title" /></SelectTrigger>
                                                        <SelectContent className="bg-white">
                                                            {metadata.staffMetadata.honorificTitles.map(t => (
                                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label>Academic Rank (Optional)</Label>
                                                    <Select value={form.Academic_Rank} onValueChange={(val) => setForm(p => ({ ...p, Academic_Rank: val }))}>
                                                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select rank" /></SelectTrigger>
                                                        <SelectContent className="bg-white">
                                                            {metadata.staffMetadata.academicRanks.map(r => (
                                                                <SelectItem key={r} value={r}>{r}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>Assigned Department *</Label>
                                                <Select value={form.selectedDepCode} onValueChange={(val) => setForm(p => ({ ...p, selectedDepCode: val }))}>
                                                    <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        {departments.map(d => (
                                                            <SelectItem key={d.Dep_Code} value={d.Dep_Code}>{d.DepartmentName} ({d.Dep_Code})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {(form.roleId === 'CGSS' || roles.find(r => r.id === form.roleId)?.label === 'Centre for Graduate Studies Staff') && (
                                                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                                    <Label>CGS Role Type *</Label>
                                                    <Select
                                                        value={form.roleType}
                                                        defaultValue="Executive"
                                                        onValueChange={(val) => setForm(p => ({ ...p, roleType: val }))}
                                                    >
                                                        <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Executive">Executive</SelectItem>
                                                            <SelectItem value="Director">Director</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {(form.roleId === 'EXA' || form.roleId === 'SUV') && (
                                                <>
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                                        <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Academic Qualifications</Label>
                                                        <div className="flex flex-wrap gap-2 mb-1">
                                                            {form.qualification_codes.map(code => {
                                                                const qual = metadata.qualifications.find(q => q.qualification_code === code);
                                                                return (
                                                                    <Badge key={code} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                                                        {qual?.qualification_name || code}
                                                                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                                                                            setForm(prev => ({ ...prev, qualification_codes: prev.qualification_codes.filter(c => c !== code) }));
                                                                        }} />
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                        <Select onValueChange={(v) => {
                                                            if (!form.qualification_codes.includes(v)) {
                                                                setForm(p => ({ ...p, qualification_codes: [...p.qualification_codes, v] }));
                                                            }
                                                        }}>
                                                            <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Add qualification..." /></SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                {metadata.qualifications.map(q => (
                                                                    <SelectItem key={q.qualification_code} value={q.qualification_code}>{q.qualification_name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                                        <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Expertise Specialization</Label>
                                                        <div className="flex flex-wrap gap-2 mb-1">
                                                            {form.expertise_codes.map(code => {
                                                                const exp = metadata.expertise.find(e => e.expertise_code === code);
                                                                return (
                                                                    <Badge key={code} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1 border-primary/30">
                                                                        {exp?.expertise_name || code}
                                                                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                                                                            setForm(prev => ({ ...prev, expertise_codes: prev.expertise_codes.filter(c => c !== code) }));
                                                                        }} />
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                        <Select onValueChange={(v) => {
                                                            const opt = expertiseOptions.find(o => o.expertise_code === v);
                                                            if (opt?.isDisabled) return;
                                                            if (!form.expertise_codes.includes(v)) {
                                                                setForm(p => ({ ...p, expertise_codes: [...p.expertise_codes, v] }));
                                                            }
                                                        }}>
                                                            <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Add expertise..." /></SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                {expertiseOptions.map(e => (
                                                                    <SelectItem
                                                                        key={e.expertise_code}
                                                                        value={e.expertise_code}
                                                                    >
                                                                        {e.expertise_name}({e.deptName})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                                        <Label>Other Expertise (Manual)</Label>
                                                        <Input
                                                            placeholder="e.g. Machine Learning"
                                                            className="h-11 bg-white"
                                                            value={form.expertise}
                                                            onChange={(e) => setForm(p => ({ ...p, expertise: e.target.value }))}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className={cn(
                                                "w-full h-11 text-base shadow-md",
                                                (isSubmitting ||
                                                    (searchResult.status !== "Unregistered" && form.userType === 'student') ||
                                                    (form.userType === 'staff' && (!form.roleId || !form.selectedDepCode)) ||
                                                    (form.userType === 'staff' && form.roleId === 'CGSS' && !form.roleType) ||
                                                    (form.userType === 'staff' && (form.roleId === 'EXA' || form.roleId === 'SUV') && (!form.qualification_codes.length))
                                                ) && "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed border-none shadow-none"
                                            )}
                                            disabled={
                                                isSubmitting ||
                                                (searchResult.status !== "Unregistered" && form.userType === 'student') ||
                                                (form.userType === 'student' && (!form.Prog_Code || !form.acadYearStart || !form.acadYearEnd || !form.Exp_GraduatedYear)) ||
                                                (form.userType === 'staff' && (!form.roleId || !form.selectedDepCode)) ||
                                                (form.userType === 'staff' && form.roleId === 'CGSS' && !form.roleType) ||
                                                (form.userType === 'staff' && (form.roleId === 'EXA' || form.roleId === 'SUV') && (!form.qualification_codes.length))
                                            }
                                        >
                                            {isSubmitting ? "Processing..." :
                                                (searchResult.status !== "Unregistered" && form.userType === 'student') ? "Already Registered" :
                                                    (searchResult.status !== "Unregistered" ? "Add Role" : "Complete Registration")}
                                        </Button>
                                    </div>
                                </form>
                            </>) : (
                            <div className="bg-slate-50 p-6 rounded-lg border border-dashed flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                                <Search className="h-8 w-8 text-slate-400" />
                                <p className="text-slate-500 text-sm">Search for a user to begin registration.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent >
        </Card >
    );
}
