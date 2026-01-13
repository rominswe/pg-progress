import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import api, { API_BASE_URL } from "@/services/api";
import { toast } from "sonner";
import {
  User, Mail, Phone, Shield, Save,
  Lock, Camera, Fingerprint, Briefcase,
  GraduationCap, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    Phonenumber: "",
    Password: "",
    ConfirmPassword: ""
  });

  // Sync state when user context is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        Phonenumber: user.Phonenumber || ""
      }));
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.Password) {
      if (formData.Password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
      if (formData.Password !== formData.ConfirmPassword) {
        return toast.error("Passwords do not match");
      }
    }

    setIsSubmitting(true);
    try {
      const res = await api.put("/api/profile/update", {
        Phonenumber: formData.Phonenumber,
        Password: formData.Password || undefined
      });

      if (res.data.success) {
        toast.success("Profile updated successfully");
        setUser({ ...user, ...res.data.data });
        setFormData(prev => ({ ...prev, Password: "", ConfirmPassword: "" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File size must be less than 2MB");
    }

    const uploadFormData = new FormData();
    uploadFormData.append("profileImage", file);

    setIsUploading(true);
    try {
      const res = await api.post("/api/profile/upload-image", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        toast.success("Profile picture updated");
        setUser({ ...user, Profile_Image: res.data.data.Profile_Image });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  const profileImageUrl = user.Profile_Image
    ? `${API_BASE_URL}${user.Profile_Image}`
    : null;

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Active' };
      case 'pending':
        return { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Pending Verification' };
      default:
        return { color: 'text-slate-600 bg-slate-50 border-slate-100', icon: AlertCircle, label: status || 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(user.Status);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Account Settings</h2>
        <p className="text-slate-500 font-medium text-sm">Update your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Summary Card */}
        <Card className="lg:col-span-4 border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white sticky top-24">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <CardContent className="pt-0 text-center relative">
            <div className="relative inline-block -mt-12 mb-6 group cursor-pointer" onClick={handleImageClick}>
              <div className="h-32 w-32 rounded-full ring-8 ring-white shadow-2xl overflow-hidden flex items-center justify-center bg-slate-100 border border-slate-200 transition-transform group-hover:scale-105 duration-300">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-14 w-14 text-slate-300" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="h-8 w-8 border-3 border-white border-t-transparent animate-spin rounded-full" />
                  </div>
                )}
              </div>
              <Button
                size="icon"
                className="absolute bottom-1 right-1 h-10 w-10 rounded-full shadow-lg border-4 border-white bg-blue-600 hover:bg-blue-700 text-white transition-all group-hover:scale-110"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="font-bold text-2xl text-slate-900 tracking-tight">{user.FirstName} {user.LastName}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 tracking-wide uppercase">
                  {user.role_id === "STU" ? <GraduationCap className="h-3 w-3 mr-1.5" /> : <Briefcase className="h-3 w-3 mr-1.5" />}
                  {user.role_id === "STU" ? "Student" : user.role_id === "SUV" ? "Supervisor" : user.role_id}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-left bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Fingerprint className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                    {user.role_id === "STU" ? "Student ID" : user.role_id === "SUV" ? "Supervisor ID" : "Staff ID"}
                  </p>
                  <p className="font-mono font-bold text-slate-700">{user.university_id || user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="truncate font-bold text-slate-700 text-sm">{user.EmailId}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-lg", statusConfig.color.split(' ')[0])}>
                  <statusConfig.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Account Status</p>
                  <div className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border", statusConfig.color)}>
                    {statusConfig.label}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Detailed Form */}
        <Card className="lg:col-span-8 border-none shadow-xl shadow-slate-200/50 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              General Information
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Keep your contact information up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label htmlFor="phone" className="text-sm font-bold text-slate-700 ml-1">Phone Number</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-within:text-blue-600 text-slate-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <Input
                      id="phone"
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-700"
                      placeholder="+60 12-345 6789"
                      value={formData.Phonenumber}
                      onChange={(e) => setFormData({ ...formData, Phonenumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center uppercase">
                  <span className="bg-white px-4 text-xs font-black text-slate-400 tracking-[0.2em]">Security Checkpoint</span>
                </div>
              </div>

              <div className="space-y-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Password Security
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium -mt-4">Leave these fields blank if you don't wish to change your password.</CardDescription>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">New Password</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-within:text-blue-600 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                        placeholder="••••••••"
                        value={formData.Password}
                        onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="confirm" className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-within:text-blue-600 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="confirm"
                        type="password"
                        className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                        placeholder="••••••••"
                        value={formData.ConfirmPassword}
                        onChange={(e) => setFormData({ ...formData, ConfirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 flex items-center gap-3 font-bold transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {isSubmitting ? "Saving Updates..." : "Save All Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}