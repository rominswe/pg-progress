// import { useState, useEffect, useMemo } from "react";
// import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Check, ChevronsUpDown, User, Phone, Mail, Building, IdCard, CheckCircle2, Clock, Globe, GraduationCap, University, Calendar, BookOpen, MapPin } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";
// import api from "@/services/api";
// import countries from "i18n-iso-countries";
// import enLocale from "i18n-iso-countries/langs/en.json";
// import 'react-phone-number-input/style.css';
// import PhoneInput from 'react-phone-number-input';

// countries.registerLocale(enLocale);

// export default function ManualRegisterModal({ open, onOpenChange, onRegister, user }) {
//   const [form, setForm] = useState({});
//   const [departments, setDepartments] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [openCountry, setOpenCountry] = useState(false);
//   const [step, setStep] = useState(1);
//   const [errors, setErrors] = useState([]);
//   const totalSteps = 3;

//   const countryList = useMemo(() => {
//     return Object.values(countries.getNames("en", { select: "official" })).sort((a, b) =>
//       a.localeCompare(b)
//     );
//   }, []);

//   useEffect(() => {
//     if (user?.email) {
//       setForm((prev) => ({
//         ...prev,
//         EmailId: user.email || user.identifier || "",
//         FirstName: user.firstName || "",
//         LastName: user.lastName || "",
//         Dep_Code: user.Dep_Code || "",
//         roleLabel: user.roleLabel || "",
//       }));
//     }
//   }, [user]);

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const res = await api.get("/api/departments");
//         const list = res.data?.departmentInfoAccess || res.data || [];
//         setDepartments(Array.isArray(list) ? list : []);
//       } catch { setDepartments([]); }
//     };
//     fetchDepartments();
//   }, []);

//   const handleChange = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => prev.filter((item) => item !== field));
//   };

//   const validateStep = (currentStep) => {
//     let requiredFields = [];
//     if (currentStep === 1) requiredFields = ["FirstName", "LastName", "Gender", "Dob"];
//     if (currentStep === 2) requiredFields = ["EmailId", "Phonenumber", "Address", "Country"];
//     if (currentStep === 3) {
//       requiredFields = ["roleLabel", "Dep_Code", "Affiliation"];
//       if (["Examiner", "Supervisor"].includes(form.roleLabel)) requiredFields.push("Expertise");
//     }

//     const newErrors = requiredFields.filter((f) => !form[f]);

//     if (form.EmailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EmailId)) {
//       if (!newErrors.includes("EmailId")) newErrors.push("EmailId");
//       toast.error("Please enter a valid email address");
//     }

//     setErrors(newErrors);
//     if (newErrors.length > 0) {
//       if (newErrors.length === 1 && newErrors[0] === "EmailId" && form.EmailId) return false;
//       toast.error("Please fill in all required fields marked with *");
//       return false;
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (validateStep(step)) setStep((s) => s + 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(3)) return;
//     setIsSubmitting(true);
//     try {
//       await onRegister(form);
//       onOpenChange(false);
//       setStep(1);
//     } catch { toast.error("Manual registration failed."); }
//     finally { setIsSubmitting(false); }
//   };

//   return (
//     <Modal open={open} onOpenChange={onOpenChange}>
//       <ModalContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white shadow-2xl">
//         <ModalHeader className="px-6 pt-6 pb-4 border-b bg-white">
//           <div className="flex items-center justify-between w-full">
//           <ModalTitle className="text-2xl font-bold">External Staff Registration</ModalTitle>
//           <span className="text-xs font-medium text-muted-foreground bg-slate-100 px-2 py-1 rounded">
//               Step {step} of {totalSteps}
//             </span>
//           </div>
//           <ModalDescription>
//             Step {step} of {totalSteps} — {step === 1 ? "Personal" : step === 2 ? "Contact" : "Professional"}
//           </ModalDescription>
//         </ModalHeader>

//         {/* Step Indicator */}
//         <div className="flex justify-between px-8 py-4 bg-slate-50 text-xs border-b">
//           {["Personal", "Contact", "Professional"].map((label, i) => (
//             <div key={label} className="flex items-center gap-2">
//               <div className={cn("h-6 w-6 rounded-full flex items-center justify-center font-bold", step >= i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
//                 {i + 1}
//               </div>
//               <span className={cn(step === i + 1 ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
//             </div>
//           ))}
//         </div>

//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
//             {step === 1 && (
//               <>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("FirstName") && "text-destructive")}>First Name *</Label>
//                   <Input className={cn("flex items-center gap-2", errors.includes("FirstName") ? "border-destructive" : "")} value={form.FirstName || ""} onChange={(e) => handleChange("FirstName", e.target.value)} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("LastName") && "text-destructive")}>Last Name *</Label>
//                   <Input className={cn("flex items-center gap-2", errors.includes("LastName") ? "border-destructive" : "")} value={form.LastName || ""} onChange={(e) => handleChange("LastName", e.target.value)} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Gender") && "text-destructive")}><User className="h-4 w-4" />Gender *</Label>
//                   <Select value={form.Gender || ""} onValueChange={(v) => handleChange("Gender", v)}>
//                     <SelectTrigger className={cn("flex items-center gap-2", errors.includes("Gender") ? "border-destructive" : "")}><SelectValue placeholder="Select gender" /></SelectTrigger>
//                     <SelectContent className="bg-white opacity-100 shadow-md">
//                       <SelectItem value="Male">Male</SelectItem>
//                       <SelectItem value="Female">Female</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Dob") && "text-destructive")}><Calendar className="h-4 w-4" /> Date of Birth *</Label>
//                   <Input type="date" className={cn("flex items-center gap-2", errors.includes("Dob") ? "border-destructive" : "")} value={form.Dob || ""} onChange={(e) => handleChange("Dob", e.target.value)} />
//                 </div>
//               </>
//             )}

//             {step === 2 && (
//               <>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("EmailId") && "text-destructive")}><Mail className="h-4 w-4" /> Email *</Label>
//                   <Input type="email" placeholder="example@gmail.com" className={cn("flex items-center gap-2", errors.includes("EmailId") ? "border-destructive" : "")} value={form.EmailId || ""} onChange={(e) => handleChange("EmailId", e.target.value)} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Phonenumber") && "text-destructive")}>
//                     <Phone className="h-4 w-4" /> Phone *
//                   </Label>
//                   <PhoneInput international defaultCountry="MY" placeholder="Enter phone number" value={form.Phonenumber} onChange={(val) => handleChange("Phonenumber", val)} className={cn(
//                     "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
//                     errors.includes("Phonenumber")
//                       ? "border-destructive focus-within:ring-destructive"
//                       : "border-input"
//                   )}
//                     numberInputProps={{
//                       className: "border-none focus:ring-0 focus:outline-none bg-transparent w-full ml-2",
//                     }}
//                     style={{
//                       "--PhoneInputCountrySelect-marginRight": "10px",
//                       "--PhoneInputCountryFlag-borderColor": "transparent",
//                     }}
//                   />
//                 </div>
//                 <div className="sm:col-span-2 space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Address") && "text-destructive")}><MapPin className="h-4 w-4" /> Address *</Label>
//                   <Input className={cn("flex items-center gap-2", errors.includes("Address") ? "border-destructive" : "")} value={form.Address || ""} onChange={(e) => handleChange("Address", e.target.value)} />
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Country") && "text-destructive")}><Globe className="h-4 w-4" /> Country *</Label>
//                   <Popover open={openCountry} onOpenChange={setOpenCountry}>
//                     <PopoverTrigger asChild>
//                       <Button variant="outline" className={cn("w-full justify-between font-normal", errors.includes("Country") && "border-destructive")}>
//                         {form.Country || "Select country"}
//                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] bg-white opacity-100 shadow-xl border" align="start">
//                       <Command>
//                         <CommandInput placeholder="Search country..." />
//                         <CommandList className="max-h-[200px]">
//                           <CommandEmpty>No country found.</CommandEmpty>
//                           <CommandGroup>
//                             {countryList.map((country) => (
//                               <CommandItem key={country} onSelect={() => { handleChange("Country", country); setOpenCountry(false); }}>
//                                 <Check className={cn("mr-2 h-4 w-4", form.Country === country ? "opacity-100" : "opacity-0")} />
//                                 {country}
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </CommandList>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Passport") && "text-destructive")}><BookOpen className="h-4 w-4" /> Passport *</Label>
//                   <Input className={cn("flex items-center gap-2", errors.includes("Passport") ? "border-destructive" : "")} value={form.Passport || ""} onChange={(e) => handleChange("Passport", e.target.value)} />
//                 </div>
//               </>
//             )}

//             {step === 3 && (
//               <>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("roleLabel") && "text-destructive")}><IdCard className="h-4 w-4" /> Role *</Label>
//                   <Select value={form.roleLabel || ""} onValueChange={(v) => handleChange("roleLabel", v)}>
//                     <SelectTrigger className={cn("flex items-center gap-2", errors.includes("roleLabel") ? "border-destructive" : "")}><SelectValue placeholder="Select role" /></SelectTrigger>
//                     <SelectContent className="bg-white opacity-100 shadow-md">
//                       <SelectItem value="Examiner">Examiner</SelectItem>
//                       <SelectItem value="Supervisor">Supervisor</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Dep_Code") && "text-destructive")}><Building className="h-4 w-4" /> Department *</Label>
//                   <Select value={form.Dep_Code || ""} onValueChange={(v) => handleChange("Dep_Code", v)}>
//                     <SelectTrigger className={cn("flex items-center gap-2", errors.includes("Dep_Code") ? "border-destructive" : "")}><SelectValue placeholder="Select department" /></SelectTrigger>
//                     <SelectContent className="bg-white opacity-100 shadow-md">
//                       {departments.map((d) => (
//                         <SelectItem key={d.Dep_Code} value={d.Dep_Code}>{d.DepartmentName}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {["Examiner", "Supervisor"].includes(form.roleLabel) && (
//                   <div className="sm:col-span-2 space-y-2">
//                     <Label className={cn("flex items-center gap-2", errors.includes("Expertise") && "text-destructive")}>
//                       <GraduationCap className="h-4 w-4" /> Area of Expertise *
//                     </Label>
//                     <Input className={cn("flex items-center gap-2", errors.includes("Expertise") ? "border-destructive" : "")} value={form.Expertise || ""} onChange={(e) => handleChange("Expertise", e.target.value)} />
//                   </div>
//                 )}
//                 <div className="sm:col-span-2 space-y-2">
//                   <Label className={cn("flex items-center gap-2", errors.includes("Affiliation") && "text-destructive")}><University className="h-4 w-4" /> Affiliation *</Label>
//                   <Input className={cn("flex items-center gap-2", errors.includes("Affiliation") ? "border-destructive" : "")} value={form.Affiliation || ""} onChange={(e) => handleChange("Affiliation", e.target.value)} />
//                 </div>
//               </>
//             )}
//           </div>
//         </div>

//         <ModalFooter className="p-6 border-t flex flex-row items-center justify-between">
//           <Button variant="ghost" onClick={step === 1 ? () => onOpenChange(false) : () => setStep(step - 1)}>
//             {step === 1 ? "Cancel" : "Back"}
//           </Button>
//           {step < totalSteps ? (
//             <Button onClick={handleNext}>Next Step</Button>
//           ) : (
//             <Button onClick={handleSubmit} disabled={isSubmitting}>
//               {isSubmitting ? "Registering..." : "Complete Registration"}
//             </Button>
//           )}
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, User, Phone, Mail, Building, IdCard, Globe, GraduationCap, University, Calendar, BookOpen, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

countries.registerLocale(enLocale);

export default function ManualRegisterModal({ open, onOpenChange, onRegister, user }) {
  const [form, setForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (user) {
      setForm((prev) => ({
        ...prev,
        EmailId: user.email || user.identifier || "",
        FirstName: user.firstName || "",
        LastName: user.lastName || "",
        Dep_Code: user.Dep_Code || "",
        roleLabel: user.roleLabel || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/api/departments");
        const list = res.data?.departmentInfoAccess || res.data || [];
        setDepartments(Array.isArray(list) ? list : []);
      } catch { setDepartments([]); }
    };
    fetchDepartments();
  }, []);

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

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      await onRegister(form);
      onOpenChange(false);
      setStep(1);
    } catch { toast.error("Manual registration failed."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white shadow-2xl">
        <ModalHeader className="px-8 pt-8 pb-4 border-b">
          <div className="flex items-center justify-between w-full">
            <ModalTitle className="text-2xl font-bold">External Staff Registration</ModalTitle>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Step {step} of {totalSteps}
            </span>
          </div>
          <ModalDescription className="mt-1">
            {step === 1 ? "Personal Profile" : step === 2 ? "Contact & Location" : "Professional Details"}
          </ModalDescription>
        </ModalHeader>

        <div className="flex justify-between px-12 py-5 bg-slate-50 border-b">
          {["Personal", "Contact", "Professional"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className={cn("h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-all", 
                step >= i + 1 ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground")}>
                {i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block", step === i + 1 ? "font-bold text-foreground" : "text-muted-foreground")}>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
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
                <div className="sm:col-span-2 space-y-2">
                  <Label className={cn("flex items-center gap-2", errors.includes("Affiliation") && "text-destructive")}><University className="h-4 w-4" /> Current Affiliation *</Label>
                  <Input placeholder="e.g. University of Malaya" className={cn(errors.includes("Affiliation") && "border-destructive")} value={form.Affiliation || ""} onChange={(e) => handleChange("Affiliation", e.target.value)} />
                </div>
                {["Examiner", "Supervisor"].includes(form.roleLabel) && (
                  <div className="sm:col-span-2 space-y-2">
                    <Label className={cn("flex items-center gap-2", errors.includes("Expertise") && "text-destructive")}><GraduationCap className="h-4 w-4" /> Research Expertise *</Label>
                    <Input placeholder="e.g. Artificial Intelligence, Molecular Biology" className={cn(errors.includes("Expertise") && "border-destructive")} value={form.Expertise || ""} onChange={(e) => handleChange("Expertise", e.target.value)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ModalFooter className="p-8 border-t flex flex-row items-center justify-between bg-slate-50/50">
          <Button variant="outline" className="px-6" onClick={step === 1 ? () => onOpenChange(false) : () => setStep(step - 1)}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < totalSteps ? (
            <Button className="px-8 shadow-md" onClick={handleNext}>Next Step</Button>
          ) : (
            <Button className="px-8 shadow-md" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Complete Registration"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}