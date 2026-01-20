import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import api, { API_BASE_URL } from "@/services/api";
import { toast } from "sonner";
import {
  User, Mail, Phone, Shield, Save,
  Lock, Building2, Award, Camera,
  MapPin, Globe, Briefcase, Calendar,
  UserCircle, Fingerprint, ChevronRight, Check, ChevronsUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import UniversitySearch from "../users/UniversitySearch";

countries.registerLocale(enLocale);

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [openCountry, setOpenCountry] = useState(false);

  const countryList = useMemo(() => {
    return Object.values(countries.getNames("en", { select: "official" })).sort((a, b) =>
      a.localeCompare(b)
    );
  }, []);

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    EmailId: "",
    Phonenumber: "",
    Gender: "",
    Dob: "",
    Address: "",
    Country: "",
    Passport: "",
    Affiliation: "",
    univ_domain: "",
    Expertise: "",
    Honorific_Titles: "",
    Academic_Rank: "",
    Password: "",
    ConfirmPassword: ""
  });

  // Helper to normalize phone numbers to E.164 for the library (e.g. 017 -> +6017)
  const normalizePhone = (num) => {
    if (!num) return "";
    if (String(num).startsWith("+")) return num;
    if (String(num).startsWith("0")) return `+60${String(num).slice(1)}`;
    return num;
  };

  // Sync state when user context is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        FirstName: user.FirstName || "",
        LastName: user.LastName || "",
        EmailId: user.EmailId || "",
        Phonenumber: normalizePhone(user.Phonenumber),
        Gender: user.Gender || "",
        Dob: user.Dob || "",
        Address: user.Address || "",
        Country: user.Country || "",
        Passport: user.Passport || "",
        Affiliation: user.Affiliation || "",
        univ_domain: user.Univ_Domain || "",
        Expertise: user.Expertise || "",
        Honorific_Titles: user.Honorific_Titles || "",
        Academic_Rank: user.Academic_Rank || ""
      }));
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.Password && formData.Password !== formData.ConfirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsSubmitting(true);
    try {
      const res = await api.put("/api/profile/update", {
        ...formData,
        Univ_Domain: formData.univ_domain, // Backend expects Univ_Domain
        Password: formData.Password || undefined,
      });

      if (res.data.success) {
        // The backend returns the updated user object
        updateUser(res.data.data);
        setFormData(prev => ({ ...prev, Password: "", ConfirmPassword: "" }));
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await api.post("/api/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        updateUser({ Profile_Image: res.data.data.Profile_Image });
        toast.success("Profile picture updated");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-muted-foreground font-medium">Loading profile...</div>
    </div>
  );

  const isStudent = user.role_id === "STU";
  const isStaff = !isStudent;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- HEADER BANNER --- */}
      <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-200/50">
        <div className="absolute top-0 right-0 -m-10 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 shadow-xl overflow-hidden group/avatar">
              {user.Profile_Image ? (
                <img
                  src={`${API_BASE_URL}${user.Profile_Image}`}
                  alt={user.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold uppercase tracking-tighter">
                <Camera className="h-6 w-6 mb-1" />
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {user.Honorific_Titles && `${user.Honorific_Titles} `}{user.FirstName} {user.LastName}
              </h1>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/30">
                {user.role_name}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100 font-medium text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-200" />
                {user.EmailId}
              </div>
              {user.department_name && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-200" />
                  {user.department_name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT TABS --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-slate-100 p-1 rounded-2xl shadow-sm">
            <TabsTrigger value="personal" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all font-bold text-sm">
              Personal Information
            </TabsTrigger>
            <TabsTrigger value="professional" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all font-bold text-sm">
              {isStudent ? "Academic Info" : "Professional Profile"}
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all font-bold text-sm">
              Account Security
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 font-bold px-8"
          >
            {isSubmitting ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT: HELP CARD --- */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white group cursor-default overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-800">Profile Status</CardTitle>
                <CardDescription>Your account is currently {user.Status?.toLowerCase() || 'active'}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <Fingerprint className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unique Identifier</p>
                    <p className="text-sm font-bold text-slate-700">{user.stu_id || user.emp_id || user.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Type</p>
                    <p className="text-sm font-bold text-slate-700">{isStudent ? 'Postgraduate Researcher' : 'Academic Staff'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -m-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
              <h4 className="font-bold mb-2">Need Help?</h4>
              <p className="text-xs text-blue-100 mb-4 leading-relaxed">If you cannot change some of your locked information, please contact the Centre for Graduate Studies (CGS) administration.</p>
              <Button variant="secondary" size="sm" className="w-full rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50">
                Contact Support
              </Button>
            </div>
          </div>

          {/* --- RIGHT: FORM CONTENT --- */}
          <div className="lg:col-span-2">
            {/* PERSONAL TAB */}
            <TabsContent value="personal" className="m-0 focus-visible:outline-none">
              <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-800">Basic Background</CardTitle>
                  <CardDescription>Update your essential personal information for university records.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">First Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20"
                          value={formData.FirstName}
                          readOnly={user.role_id !== "CGSADM"}
                          onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Last Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20"
                          value={formData.LastName}
                          readOnly={user.role_id !== "CGSADM"}
                          onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Gender</Label>
                      <Select value={formData.Gender} onValueChange={(val) => setFormData({ ...formData, Gender: val })}>
                        <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 transition-colors focus:ring-offset-0 focus:ring-blue-500/10 h-11">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Date of Birth</Label>
                      <Input
                        type="date"
                        className="rounded-xl border-slate-100 bg-slate-50/50 h-11"
                        value={formData.Dob}
                        onChange={(e) => setFormData({ ...formData, Dob: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Phone Number</Label>
                      <PhoneInput
                        international
                        defaultCountry="MY"
                        value={formData.Phonenumber}
                        onChange={(val) => setFormData({ ...formData, Phonenumber: val })}
                        className={cn("flex h-11 w-full rounded-xl border bg-slate-50/50 px-3 py-2 text-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20",
                          "border-slate-100")}
                        numberInputProps={{ className: "border-none focus:ring-0 focus:outline-none bg-transparent w-full ml-2" }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Country</Label>
                      <Popover open={openCountry} onOpenChange={setOpenCountry}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-between font-normal rounded-xl border-slate-100 bg-slate-50/50 h-11 h-11 text-slate-700", !formData.Country && "text-slate-400")}
                          >
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-slate-400" />
                              {formData.Country || "Select country"}
                            </div>
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
                                  <CommandItem
                                    key={country}
                                    onSelect={() => {
                                      setFormData({ ...formData, Country: country });
                                      setOpenCountry(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", formData.Country === country ? "opacity-100" : "opacity-0")} />
                                    {country}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Passport / National ID</Label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11"
                        value={formData.Passport}
                        onChange={(e) => setFormData({ ...formData, Passport: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Mailing Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11"
                        value={formData.Address}
                        onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PROFESSIONAL TAB */}
            <TabsContent value="professional" className="m-0 focus-visible:outline-none">
              <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-800">
                    {isStudent ? "Academic Status" : "Professional Portfolio"}
                  </CardTitle>
                  <CardDescription>Professional and academic records registered in the CGSS database.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  {isStaff ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 ml-1">Honorific Title</Label>
                          <Select value={formData.Honorific_Titles} onValueChange={(val) => setFormData({ ...formData, Honorific_Titles: val })}>
                            <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11">
                              <SelectValue placeholder="Select Title" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                              {['Prof.', 'Assoc. Prof.', 'Dr.', 'Ir.', 'Ts.', 'Grs.', 'Sr.', 'Ar.', 'Tuan', 'Puan', 'Cik'].map(title => (
                                <SelectItem key={title} value={title}>{title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 ml-1">Academic Rank</Label>
                          <Select value={formData.Academic_Rank} onValueChange={(val) => setFormData({ ...formData, Academic_Rank: val })}>
                            <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11">
                              <SelectValue placeholder="Select Rank" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                              {['Associate Professor', 'Professor', 'Senior Lecturer', 'Lecturer', 'Assistant Lecturer', 'Research Fellow', 'Adjunct Professor', 'Visiting Professor'].map(rank => (
                                <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 ml-1">Affiliated Institution</Label>
                        <UniversitySearch
                          value={formData.Affiliation}
                          onSelect={(name, domain) => {
                            setFormData(prev => ({ ...prev, Affiliation: name, univ_domain: domain }));
                          }}
                        />
                        {formData.univ_domain && (
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                            Verified Domain: {formData.univ_domain}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 ml-1">Research Expertise (Comma Separated)</Label>
                        <div className="relative">
                          <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <Input
                            className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11"
                            value={formData.Expertise}
                            onChange={(e) => setFormData({ ...formData, Expertise: e.target.value })}
                            placeholder="Machine Learning, Renewable Energy, etc."
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">CGS Research Level</p>
                        <p className="text-md font-bold text-slate-700">{user.role_level}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Academic Year</p>
                        <p className="text-md font-bold text-slate-700">{user.Acad_Year || '2023/2024'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 md:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Enrolled Program</p>
                        <p className="text-md font-bold text-slate-700">{user.Prog_Code_program_info?.prog_name || user.department_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="m-0 focus-visible:outline-none">
              <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-800">Credential Control</CardTitle>
                  </div>
                  <CardDescription>Oversee and update your login credentials and security preferences.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="password"
                          className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11"
                          placeholder="Leave blank to keep current"
                          value={formData.Password}
                          onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 ml-1">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="password"
                          className="pl-11 rounded-xl border-slate-100 bg-slate-50/50 h-11"
                          placeholder="Re-type new password"
                          value={formData.ConfirmPassword}
                          onChange={(e) => setFormData({ ...formData, ConfirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}