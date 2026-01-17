import { useState, useEffect, useMemo } from 'react';
import { User, Mail, Building, IdCard, CheckCircle2, Clock, Globe, GraduationCap, University, XCircle, Loader2, Phone, BookOpen, MapPin, Check, ChevronsUpDown, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import adminService from '@/services/adminService';
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

countries.registerLocale(enLocale);

export default function UserDetailCard({ user, onRegister, onReactivate, loading = false }) {
  // Mode Check
  const isRegistrationMode = user?.allowManualRegistration;
  const isInternalUnregistered = user?.source === 'internal' && user?.status === 'Unregistered';

  // -- Registration Form State --
  const [form, setForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [openCountry, setOpenCountry] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);
  const totalSteps = 3;

  // -- Internal Role Selection State --
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(user?.roleId || "");
  const [roleType, setRoleType] = useState('Executive'); // Default for CGS

  useEffect(() => {
    // Fetch assignable roles for ALL internal staff (registered or not) to support multi-role
    if (user?.source === 'internal') {
      const fetchRoles = async () => {
        try {
          const res = await adminService.getAssignableRoles();
          if (res.data?.success) {
            setAvailableRoles(res.data.roles);
          }
        } catch (err) {
          console.error("Failed to fetch roles", err);
        }
      };
      fetchRoles();
    }
  }, [user?.source]);

  // Sync effect for pre-filled role
  useEffect(() => {
    if (user?.roleId) setSelectedRole(user.roleId);
  }, [user]);


  const countryList = useMemo(() => {
    return Object.values(countries.getNames("en", { select: "official" })).sort((a, b) =>
      a.localeCompare(b)
    );
  }, []);

  // Initialize Form Data
  useEffect(() => {
    if (isRegistrationMode && user) {
      setForm((prev) => ({
        ...prev,
        EmailId: user.email || user.identifier || "",
        FirstName: user.firstName || "",
        LastName: user.lastName || "",
        Dep_Code: user.Dep_Code || "",
        roleLabel: user.roleLabel || "",
      }));
    }
  }, [isRegistrationMode, user]);

  // Fetch Departments
  useEffect(() => {
    if (isRegistrationMode) {
      const fetchDepartments = async () => {
        try {
          const res = await api.get("/api/departments");
          const list = res.data?.departmentInfoAccess || res.data || [];
          setDepartments(Array.isArray(list) ? list : []);
        } catch { setDepartments([]); }
      };
      fetchDepartments();
    }
  }, [isRegistrationMode]);


  // -- Form Logic --
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((item) => item !== field));
  };

  const validateStep = (currentStep) => {
    let requiredFields = [];
    if (currentStep === 1) requiredFields = ["FirstName", "LastName", "Gender", "Dob"];
    if (currentStep === 2) requiredFields = ["EmailId", "Phonenumber", "Address", "Country"];
    if (currentStep === 3) {
      requiredFields = ["roleLabel", "Dep_Code", "Affiliation"];
      if (["Examiner", "Supervisor"].includes(form.roleLabel)) requiredFields.push("Expertise");
    }

    const newErrors = requiredFields.filter((f) => !form[f]);
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

  const handleFormSubmit = () => {
    if (!validateStep(3)) return;
    onRegister(form); // Pass form data to parent
  };

  const handleInternalRegister = () => {
    // Pass role metadata
    onRegister({
      internal: true,
      roleId: selectedRole,
      roleType: selectedRole === 'CGSS' ? roleType : 'Internal'
    });
  };


  // -- Render Logic --

  if (isRegistrationMode) {
    return (
      <Card className="overflow-hidden border-t-4 border-t-emerald-600 shadow-xl">
        <CardHeader className="bg-emerald-50/30 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                External Staff Registration
              </CardTitle>
              <CardDescription>
                {step === 1 ? "Personal Profile" : step === 2 ? "Contact & Location" : "Professional Details"}
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Step {step} of {totalSteps}
            </span>
          </div>
        </CardHeader>

        {/* Stepper Indicator */}
        <div className="flex justify-between px-8 py-4 bg-slate-50/50 border-b">
          {["Personal", "Contact", "Professional"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn("h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all",
                step >= i + 1 ? "bg-emerald-600 text-white shadow-md" : "bg-muted text-muted-foreground")}>
                {i + 1}
              </div>
              <span className={cn("text-[10px] hidden sm:block uppercase tracking-wider font-semibold", step === i + 1 ? "text-emerald-700" : "text-muted-foreground")}>{label}</span>
            </div>
          ))}
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
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
                  <Label className={cn("flex items-center gap-2", errors.includes("Dob") && "text-destructive")}><Clock className="h-4 w-4" /> Date of Birth *</Label>
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
                <div className="md:col-span-2 space-y-2">
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
                    <PopoverContent className="p-0 w-[200px] bg-white shadow-xl border" align="start">
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
                  <Label className={cn("flex items-center gap-2", errors.includes("Passport") && "text-destructive")}><BookOpen className="h-4 w-4" /> Passport/ID Number</Label>
                  <Input placeholder="A1234567" className={cn(errors.includes("Passport") && "border-destructive")} value={form.Passport || ""} onChange={(e) => handleChange("Passport", e.target.value)} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", errors.includes("roleLabel") && "text-destructive")}><IdCard className="h-4 w-4" /> Assigned Role *</Label>
                  <Select value={form.roleLabel || ""} onValueChange={(v) => handleChange("roleLabel", v)}>
                    <SelectTrigger className={cn(errors.includes("roleLabel") && "border-destructive")}><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Examiner">Examiner</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="md:col-span-2 space-y-2">
                  <Label className={cn("flex items-center gap-2", errors.includes("Affiliation") && "text-destructive")}><University className="h-4 w-4" /> Current Affiliation *</Label>
                  <Input placeholder="e.g. University of Malaya" className={cn(errors.includes("Affiliation") && "border-destructive")} value={form.Affiliation || ""} onChange={(e) => handleChange("Affiliation", e.target.value)} />
                </div>
                {["Examiner", "Supervisor"].includes(form.roleLabel) && (
                  <div className="md:col-span-2 space-y-2">
                    <Label className={cn("flex items-center gap-2", errors.includes("Expertise") && "text-destructive")}><GraduationCap className="h-4 w-4" /> Research Expertise *</Label>
                    <Input placeholder="e.g. Artificial Intelligence, Molecular Biology" className={cn(errors.includes("Expertise") && "border-destructive")} value={form.Expertise || ""} onChange={(e) => handleChange("Expertise", e.target.value)} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button variant="outline" onClick={step === 1 ? null : () => setStep(step - 1)} disabled={step === 1}>
              {step === 1 ? "Start" : "Back"}
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">Next Step</Button>
            ) : (
              <Button onClick={handleFormSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Complete Registration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // -- Standard Read-Only View --
  const isRegistered = user.status === 'Registered' || user.status === 'Active';
  const isPending = user.status === 'Pending';
  const isUnregistered = user.status === 'Unregistered';
  const isDeactivated = user.status === 'Deactivated';
  const { showRole, showProgram, showExpertise, showAffiliation } = user.displayConfigs || {};

  return (
    <Card className="overflow-hidden border-t-4 border-t-primary shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{user.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {user.identifierLabel}: <span className="text-foreground">{user.identifier}</span>
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`capitalize py-1 px-2 ${isRegistered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                isDeactivated ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-slate-50 text-slate-600'
              }`}
          >
            {isRegistered && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {isPending && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
            {isDeactivated && <XCircle className="h-3 w-3 mr-1" />}
            {user.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
        <div className="space-y-3">
          {showRole && (
            <div className="flex items-center gap-3 text-sm">
              <IdCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Role</span>
              <span>{user.roleLabel || 'N/A'}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Dept</span>
            <span>{user.departmentLabel || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Email</span>
            <span className="truncate">{user.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Phone</span>
            <span>{user.phoneNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Address</span>
            <span className="truncate">{user.address || 'N/A'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Country</span>
            <span>{user.country || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Gender</span>
            <span>{user.gender || 'N/A'}</span>
          </div>
          {showProgram && (
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Program</span>
              <span>{user.programName || 'N/A'}</span>
            </div>
          )}
          {showExpertise && (
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Expertise</span>
              <span>{user.fieldExpertise || 'N/A'}</span>
            </div>
          )}
          {showAffiliation && (
            <div className="flex items-center gap-3 text-sm">
              <University className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider w-20">Affiliation</span>
              <span>{user.affiliation || 'N/A'}</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2 pt-4 border-t mt-2">
          {isUnregistered && user.source !== 'internal' ? (
            <Button
              onClick={onRegister}
              disabled={loading}
              className="w-full shadow-lg shadow-primary/20"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Register User
            </Button>
          ) : isDeactivated ? (
            <Button
              onClick={onReactivate}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reactivate User
            </Button>
          ) : (
            // Only show 'Already Registered' message for external/students if they are not deactivated.
            // Internal staff have the role assignment block above instead.
            user.source !== 'internal' && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-muted-foreground italic">
                  {isRegistered
                    ? "This user already has an active portal account."
                    : "Registration is currently awaiting user activation via email."}
                </p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}