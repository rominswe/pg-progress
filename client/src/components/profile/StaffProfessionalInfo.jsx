import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UniversitySearch from "../users/UniversitySearch";
import { Award, GraduationCap, X, Briefcase, UserCircle, Building2, Globe, Layers, ChevronsUpDown, Check } from "lucide-react";
import api from "@/services/api";
import ProfileField from "@/components/profile/ProfileField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function StaffProfessionalInfo({ formData, setFormData }) {
  const [qualifications, setQualifications] = useState([]);
  const [expertiseList, setExpertiseList] = useState([]);
  const [honorifics, setHonorifics] = useState(['Prof.', 'Assoc. Prof.', 'Dr.', 'Ir.', 'Ts.', 'Grs.', 'Sr.', 'Ar.', 'Tuan', 'Puan', 'Cik']);
  const [ranks, setRanks] = useState(['Associate Professor', 'Professor', 'Senior Lecturer', 'Lecturer', 'Assistant Lecturer', 'Research Fellow', 'Adjunct Professor', 'Visiting Professor']);
  const [loading, setLoading] = useState(true);
  const [openExpertise, setOpenExpertise] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [qRes, eRes, sRes] = await Promise.all([
        api.get("/api/admin/academic-credentials/qualifications"),
        api.get("/api/admin/academic-credentials/expertise"),
        api.get("/api/admin/academic-credentials/staff-metadata")
      ]);

      if (qRes.data.success) setQualifications(qRes.data.data);
      if (eRes.data.success) setExpertiseList(eRes.data.data);
      if (sRes.data.success) {
        if (sRes.data.data.honorificTitles) setHonorifics(sRes.data.data.honorificTitles);
        if (sRes.data.data.academicRanks) setRanks(sRes.data.data.academicRanks);
      }
    } catch (err) {
      console.error("Failed to fetch professional metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpertise = (code) => {
    const current = formData.expertise_codes || [];
    const updated = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];

    setFormData({ ...formData, expertise_codes: updated });
  };

  const handleQualificationChange = (code) => {
    const current = formData.qualification_codes || [];
    const updated = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];
    setFormData({ ...formData, qualification_codes: updated });
  };

  const getSelectedExpertiseNames = () => {
    if (!formData.expertise_codes?.length) return [];
    return formData.expertise_codes
      .map(code => ({
        code,
        name: expertiseList.find(e => e.expertise_code === code)?.expertise_name || code
      }));
  };

  const getSelectedQualificationNames = () => {
    if (!formData.qualification_codes?.length) return [];
    return formData.qualification_codes
      .map(code => ({
        code,
        name: qualifications.find(q => q.code === code)?.name || code
      }));
  };

  const currentQualName = qualifications.find(q => q.code === formData.qualification_codes?.[0])?.name;

  return (
    <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-2xl font-black tracking-tight text-slate-800">
          Professional Portfolio
        </CardTitle>
        <CardDescription>Professional and academic records registered in the CGSS database.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-slate-500">Honorific Title</Label>
            <Select
              value={formData.Honorific_Titles || ""}
              onValueChange={(val) => setFormData({ ...formData, Honorific_Titles: val })}
            >
              <SelectTrigger className="h-[44px] rounded-xl border-slate-100 bg-slate-50/50 font-bold hover:bg-slate-100/50 shadow-none focus-visible:ring-0">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-4 w-4 text-slate-400" />
                  <span className={formData.Honorific_Titles ? "" : "text-slate-400"}>
                    {formData.Honorific_Titles || "Select honorific title"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white">
                {(honorifics || []).map((h, i) => (
                  <SelectItem key={`honorific-${h}-${i}`} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-slate-500 ml-1">Academic Rank</Label>
            <Select
              value={formData.Academic_Rank || ""}
              onValueChange={(val) => setFormData({ ...formData, Academic_Rank: val })}
            >
              <SelectTrigger className="h-[44px] rounded-xl border border-slate-100 bg-slate-50/50 font-bold hover:bg-slate-100/50 transition-colors shadow-none focus-visible:ring-0 focus-visible:ring-offset-0">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span className={formData.Academic_Rank ? "" : "text-slate-400"}>
                    {formData.Academic_Rank || "Select academic rank"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white">
                {(ranks || []).map((r, i) => (
                  <SelectItem key={`rank-${r}-${i}`} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1 mb-1.5">
            <Label className="text-[13px] font-semibold text-slate-500">Affiliated Institution</Label>
          </div>
          <UniversitySearch
            value={formData.Affiliation}
            onSelect={(name, domain) => {
              setFormData({ ...formData, Affiliation: name, univ_domain: domain || formData.univ_domain });
            }}
            className="h-[44px] rounded-xl border-slate-100 bg-slate-50/50 font-bold hover:bg-slate-100/50 transition-colors shadow-none"
          />
          {formData.univ_domain && (
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-800 ml-1.5 mt-2">
              VERIFIED DOMAIN: <span className="text-blue-600 font-black">{formData.univ_domain}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-semibold text-slate-500 ml-1">
            Research Expertise (Select via Dropdown)
          </Label>

          <Popover open={openExpertise} onOpenChange={setOpenExpertise}>
            <PopoverTrigger asChild>
              <button type="button" className="w-full text-left">
                <ProfileField
                  value={
                    formData.expertise_codes?.length > 0
                      ? formData.expertise_codes
                        .map(
                          (code) =>
                            expertiseList.find((e) => e.expertise_code === code)
                              ?.expertise_name || code
                        )
                        .join(", ")
                      : ""
                  }
                  icon={Layers}
                  placeholder="Select or search expertise areas..."
                  readOnly
                  className="cursor-pointer"
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="p-0 w-[var(--radix-popover-trigger-width)] bg-white shadow-xl border border-slate-100 rounded-2xl overflow-hidden"
              align="start"
              sideOffset={8}
            >
              <Command className="border-0">
                <CommandInput
                  placeholder="Search expertise areas..."
                  className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>No expertise found.</CommandEmpty>

                  <CommandGroup title="Expertise Areas">
                    {(expertiseList || []).map((exp) => (
                      <CommandItem
                        key={`exp-item-${exp.expertise_code}`}
                        onSelect={() => toggleExpertise(exp.expertise_code)}
                        className="py-3 px-4 cursor-pointer flex items-center gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            formData.expertise_codes?.includes(exp.expertise_code)
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300"
                          )}
                        >
                          {formData.expertise_codes?.includes(exp.expertise_code) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        <span
                          className={cn(
                            "text-[13.5px] font-bold text-slate-700",
                            formData.expertise_codes?.includes(exp.expertise_code) &&
                            "text-blue-600"
                          )}
                        >
                          {exp.expertise_name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-semibold text-slate-500 ml-1">
            Academic Qualifications
          </Label>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2 space-y-2">
            {/* Selected qualifications */}
            <div className="flex flex-wrap gap-1.5 empty:hidden p-2">
              {(formData.qualification_codes || []).map((code) => (
                <Badge
                  key={`qual-badge-${code}`}
                  variant="secondary"
                  className="px-2.5 py-1 rounded-lg bg-white border-slate-200 text-[12px] text-slate-700 font-bold shadow-sm"
                >
                  {qualifications.find((q) => (q.code || q.qualification_code) === code)?.name ||
                    qualifications.find((q) => (q.code || q.qualification_code) === code)?.qualification_name ||
                    code}

                  <button
                    onClick={() => handleQualificationChange(code)}
                    className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <Select onValueChange={handleQualificationChange}>
              <SelectTrigger
                className="h-10 rounded-lg border-0 bg-white/50 text-slate-600 font-bold shadow-none
                   focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <SelectValue placeholder="Add another qualification..." />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white max-h-[300px]">
                {(qualifications || []).map((qual) => {
                  const value = qual.code || qual.qualification_code
                  return (
                    <SelectItem
                      key={`qual-item-${value}`}
                      value={value}
                      disabled={formData.qualification_codes?.includes(value)}
                      className="py-2.5 font-bold"
                    >
                      {qual.name || qual.qualification_name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
