import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import api from "@/services/api";
import { toast } from "sonner"; // Assuming you use Sonner for notifications
import {
  User, Mail, Phone, Shield, Save,
  Lock, Building2, Award, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Phonenumber: "",
    Password: "",
    ConfirmPassword: "",
    Affiliation: "",
    Expertise: ""
  });

  // Sync state when user context is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        Phonenumber: user.Phonenumber || "",
        Affiliation: user.Affiliation || "",
        Expertise: user.Expertise || ""
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
        Phonenumber: formData.Phonenumber,
        Password: formData.Password || undefined,
        Affiliation: formData.Affiliation,
        Expertise: formData.Expertise
      });

      if (res.data.success) {
        toast.success("Profile updated successfully");
        // Update local user context with new data
        setUser({ ...user, ...res.data.data });
        setFormData(prev => ({ ...prev, Password: "", ConfirmPassword: "" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">Manage your personal information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Summary Card */}
        <Card className="md:col-span-1 border-none shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-sm overflow-hidden">
                {user.Profile_Image ? (
                  <img
                    src={user.Profile_Image}
                    alt={`${user.FirstName} ${user.LastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-sm">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="font-bold text-lg">{user.FirstName} {user.LastName}</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
              {user.role_name || user.role_id}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.EmailId}
            </div>
            {user.department_name && user.department_name !== "N/A" && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {user.department_name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Detailed Form */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details and professional info.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={formData.Phonenumber}
                      onChange={(e) => setFormData({ ...formData, Phonenumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Fields for EXA (Examiner) */}
              {user.role_id === "EXA" && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Affiliation</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="affiliation"
                          className="pl-9"
                          value={formData.Affiliation}
                          onChange={(e) => setFormData({ ...formData, Affiliation: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expertise">Expertise</Label>
                      <div className="relative">
                        <Award className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="expertise"
                          className="pl-9"
                          value={formData.Expertise}
                          onChange={(e) => setFormData({ ...formData, Expertise: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-4" />
              <CardTitle className="text-md mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </CardTitle>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-9"
                      placeholder="••••••••"
                      value={formData.Password}
                      onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type="password"
                      className="pl-9"
                      placeholder="••••••••"
                      value={formData.ConfirmPassword}
                      onChange={(e) => setFormData({ ...formData, ConfirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}