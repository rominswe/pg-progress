import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, User, Phone, Mail, Building, IdCard, Globe, GraduationCap, University, Calendar, BookOpen, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import UniversitySearch from "./UniversitySearch";

countries.registerLocale(enLocale);

export default function ExternalRegisterForm({ onRegister, isSubmitting }) {
    const [form, setForm] = useState({
        userType: 'staff',
        roleLabel: 'Examiner',
        qualification_codes: [],
        expertise_codes: [],
        Affiliation: '',
        univ_domain: '',
        Honorific_Titles: '',
        Academic_Rank: ''
    });
    const [departments, setDepartments] = useState([]);
    const [metadata, setMetadata] = useState({
        qualifications: [],
        expertise: [],
        staffMetadata: { honorificTitles: [], academicRanks: [] }
    });
    const [openCountry, setOpenCountry] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState([]);
    const totalSteps = 3;

    const countryList = useMemo(() => {
        return Object.values(countries.getNames("en", { select: "official" })).sort((a, b) =>
            a.localeCompare(b)
        );
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [deptsRes, qualRes, staffMetaRes, expertiseRes] = await Promise.all([
                    api.get('/api/departments'),
                    api.get('/api/admin/academic-credentials/qualifications'),
                    api.get('/api/admin/academic-credentials/staff-metadata'),
                    api.get('/api/admin/academic-credentials/expertise')
                ]);
                setDepartments(deptsRes.data?.data?.departmentInfoAccess || deptsRes.data?.departmentInfoAccess || []);
                setMetadata(prev => ({
                    ...prev,
                    qualifications: qualRes.data?.data || [],
                    staffMetadata: staffMetaRes.data?.data || { honorificTitles: [], academicRanks: [] },
                    expertise: expertiseRes?.data?.data || []
                }));
            } catch (err) {
                console.error("Failed to fetch initial reference data", err);
            }
        };
        fetchInitialData();
    }, []);

    // Reset expertise selection if department changes to an incompatible one
    useEffect(() => {
        if (!form.Dep_Code) {
            if (form.expertise_codes.length > 0) {
                setForm(p => ({ ...p, expertise_codes: [] }));
            }
            return;
        }

        const validCodes = form.expertise_codes.filter(code => {
            const exp = metadata.expertise.find(e => e.expertise_code === code);
            return !exp || exp.Dep_Code === form.Dep_Code;
        });

        if (validCodes.length !== form.expertise_codes.length) {
            setForm(p => ({ ...p, expertise_codes: validCodes }));
            toast.error("Some selected expertise areas were removed as they are not valid for the new department.");
        }
    }, [form.Dep_Code]);

    const expertiseOptions = useMemo(() => {
        return metadata.expertise.map(e => {
            const isDisabled = !form.Dep_Code || e.Dep_Code !== form.Dep_Code;
            const dept = departments.find(d => d.Dep_Code === e.Dep_Code);
            const deptName = dept ? dept.DepartmentName : e.Dep_Code;

            return {
                ...e,
                isDisabled,
                tooltip: isDisabled
                    ? (!form.Dep_Code ? "Please select a department first." : `Only available for ${deptName}`)
                    : null
            };
        });
    }, [metadata.expertise, form.Dep_Code, departments]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => prev.filter((item) => item !== field));
    };

    const validateStep = (currentStep) => {
        let requiredFields = [];
        const newErrors = [];

        if (currentStep === 1) requiredFields = ["FirstName", "LastName", "Gender", "Dob"];
        if (currentStep === 2) requiredFields = ["EmailId", "Phonenumber", "Address", "Country", "Passport"];
        if (currentStep === 3) {
            requiredFields = ["roleLabel", "Dep_Code", "Affiliation"];
            if (!form.qualification_codes || form.qualification_codes.length === 0) {
                newErrors.push("qualification_codes");
                toast.error("At least one qualification is required for external examiners");
            }
        }

        const filteredFields = requiredFields.filter((f) => !form[f]);
        newErrors.push(...filteredFields);
        if (form.EmailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EmailId)) {
            if (!newErrors.includes("EmailId")) newErrors.push("EmailId");
            toast.error("Please enter a valid email address");
        }

        setErrors(newErrors);
        if (newErrors.length > 0) {
            toast.error("Please fill in all required fields marked with *");
            return false;
        }
        return true;
    };

    const handleNext = () => { if (validateStep(step)) setStep((s) => s + 1); };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        // Final mapping before submission
        const payload = {
            ...form,
            staffType: 'external',
            searchRole: 'Academic Staff'
        };
        onRegister(payload, () => {
            // Reset form on success
            setForm({
                userType: 'staff',
                roleLabel: 'Examiner',
                qualification_codes: [],
                expertise_codes: []
            });
            setStep(1);
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
            <div className="px-8 pt-8 pb-4 border-b">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold">External Examiner Registration</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {step === 1 ? "Identity Profile" : step === 2 ? "Contact & Location" : "Professional Details"}
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Step {step} of {totalSteps}
                    </span>
                </div>
            </div>

            <div className="flex justify-between px-12 py-5 bg-slate-50 border-b">
                {["Identity", "Contact", "Professional"].map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                            step >= i + 1 ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground")}>
                            {i + 1}
                        </div>
                        <span className={cn("text-xs hidden sm:block", step === i + 1 ? "font-bold text-foreground" : "text-muted-foreground")}>{label}</span>
                    </div>
                ))}
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label className={cn(errors.includes("FirstName") && "text-destructive")}>First Name *</Label>
                                <Input placeholder="John" className={cn(errors.includes("FirstName") && "border-destructive")} value={form.FirstName || ""} onChange={(e) => handleChange("FirstName", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className={cn(errors.includes("LastName") && "text-destructive")}>Last Name *</Label>
                                <Input placeholder="Doe" className={cn(errors.includes("LastName") && "border-destructive")} value={form.LastName || ""} onChange={(e) => handleChange("LastName", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Gender") && "text-destructive")}><User className="h-4 w-4" />Gender *</Label>
                                <Select value={form.Gender || ""} onValueChange={(v) => handleChange("Gender", v)}>
                                    <SelectTrigger className={cn(errors.includes("Gender") && "border-destructive")}><SelectValue placeholder="Select gender" /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Dob") && "text-destructive")}><Calendar className="h-4 w-4" /> Date of Birth *</Label>
                                <Input type="date" className={cn(errors.includes("Dob") && "border-destructive")} value={form.Dob || ""} onChange={(e) => handleChange("Dob", e.target.value)} />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("EmailId") && "text-destructive")}><Mail className="h-4 w-4" /> Email *</Label>
                                <Input type="email" placeholder="john.doe@example.com" className={cn(errors.includes("EmailId") && "border-destructive")} value={form.EmailId || ""} onChange={(e) => handleChange("EmailId", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Phonenumber") && "text-destructive")}><Phone className="h-4 w-4" /> Phone *</Label>
                                <PhoneInput international defaultCountry="MY" value={form.Phonenumber} onChange={(val) => handleChange("Phonenumber", val)}
                                    className={cn("flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all focus-within:ring-2 focus-within:ring-ring",
                                        errors.includes("Phonenumber") ? "border-destructive" : "border-input")}
                                    numberInputProps={{ className: "border-none focus:ring-0 focus:outline-none bg-transparent w-full ml-2" }}
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Address") && "text-destructive")}><MapPin className="h-4 w-4" /> Address *</Label>
                                <Input placeholder="Street name, City, Postcode" className={cn(errors.includes("Address") && "border-destructive")} value={form.Address || ""} onChange={(e) => handleChange("Address", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Country") && "text-destructive")}><Globe className="h-4 w-4" /> Country *</Label>
                                <Popover open={openCountry} onOpenChange={setOpenCountry}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-between font-normal", errors.includes("Country") && "border-destructive")}>
                                            {form.Country || "Select country"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] bg-white shadow-xl border" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search country..." />
                                            <CommandList className="max-h-[200px]">
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countryList.map((country) => (
                                                        <CommandItem key={country} onSelect={() => { handleChange("Country", country); setOpenCountry(false); }}>
                                                            <Check className={cn("mr-2 h-4 w-4", form.Country === country ? "opacity-100" : "opacity-0")} />
                                                            {country}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Passport") && "text-destructive")}><BookOpen className="h-4 w-4" /> Passport/ID Number *</Label>
                                <Input placeholder="A1234567" className={cn(errors.includes("Passport") && "border-destructive")} value={form.Passport || ""} onChange={(e) => handleChange("Passport", e.target.value)} />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <div className="sm:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("roleLabel") && "text-destructive")}><IdCard className="h-4 w-4" /> Assigned Role *</Label>
                                <Select value={form.roleLabel || ""} onValueChange={(v) => handleChange("roleLabel", v)}>
                                    <SelectTrigger className={cn(errors.includes("roleLabel") && "border-destructive")}><SelectValue placeholder="Select role" /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="Examiner">Examiner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><IdCard className="h-4 w-4" /> Honorific Title (Optional)</Label>
                                    <Select value={form.Honorific_Titles || ""} onValueChange={(v) => handleChange("Honorific_Titles", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {metadata.staffMetadata.honorificTitles.map(t => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Academic Rank (Optional)</Label>
                                    <Select value={form.Academic_Rank || ""} onValueChange={(v) => handleChange("Academic_Rank", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="Not Applicable">Not Applicable / Other</SelectItem>
                                            {metadata.staffMetadata.academicRanks.map(r => (
                                                <SelectItem key={r} value={r}>{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Dep_Code") && "text-destructive")}><Building className="h-4 w-4" /> Department *</Label>
                                <Select value={form.Dep_Code || ""} onValueChange={(v) => handleChange("Dep_Code", v)}>
                                    <SelectTrigger className={cn(errors.includes("Dep_Code") && "border-destructive")}><SelectValue placeholder="Select department" /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {departments.map((d) => (
                                            <SelectItem key={d.Dep_Code} value={d.Dep_Code}>{d.DepartmentName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("qualification_codes") && "text-destructive")}><GraduationCap className="h-4 w-4" /> Academic Qualifications *</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
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
                                        handleChange("qualification_codes", [...form.qualification_codes, v]);
                                    }
                                }}>
                                    <SelectTrigger className={cn("bg-white", errors.includes("qualification_codes") && "border-destructive")}>
                                        <SelectValue placeholder="Add qualification..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {metadata.qualifications.map(q => (
                                            <SelectItem key={q.qualification_code} value={q.qualification_code}>
                                                {q.qualification_name} ({q.qualification_level})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Areas of Expertise (Select from List)</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {form.expertise_codes.map(code => {
                                        const exp = metadata.expertise.find(e => e.expertise_code === code);
                                        return (
                                            <Badge key={code} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1 border-primary/30 bg-primary/5">
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
                                        handleChange("expertise_codes", [...form.expertise_codes, v]);
                                    }
                                }}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={form.Dep_Code ? "Add expertise specialization..." : "Please select a department first"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-[300px]">
                                        {expertiseOptions.map(e => (
                                            <SelectItem
                                                key={e.expertise_code}
                                                value={e.expertise_code}
                                                disabled={e.isDisabled}
                                                title={e.tooltip}
                                                className={cn(e.isDisabled && "opacity-50 cursor-not-allowed")}
                                            >
                                                {e.expertise_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label className={cn("flex items-center gap-2", errors.includes("Affiliation") && "text-destructive")}><University className="h-4 w-4" /> Institutional Affiliation *</Label>
                                <UniversitySearch
                                    value={form.Affiliation}
                                    onSelect={(name, domain) => {
                                        setForm(prev => ({ ...prev, Affiliation: name, univ_domain: domain }));
                                        setErrors(prev => prev.filter(e => e !== "Affiliation"));
                                    }}
                                />
                                {form.univ_domain && (
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                                        Verified Domain: {form.univ_domain}
                                    </p>
                                )}
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Other Research Expertise (Optional)</Label>
                                <Input placeholder="e.g. Artificial Intelligence, Molecular Biology" value={form.expertise || ""} onChange={(e) => handleChange("expertise", e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 border-t flex flex-row items-center justify-between bg-slate-50/50">
                <Button variant="outline" className="px-6" onClick={step === 1 ? () => { } : () => setStep(step - 1)} disabled={step === 1}>
                    {step === 1 ? "Start" : "Back"}
                </Button>
                {step < totalSteps ? (
                    <Button type="button" className="px-8 shadow-md" onClick={handleNext}>Next Step</Button>
                ) : (
                    <Button type="button" className="px-8 shadow-md" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Complete Registration"}
                    </Button>
                )}
            </div>
        </div >
    );
}
