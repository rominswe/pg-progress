import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Edit2, Loader2, User, Calendar as CalendarIcon } from "lucide-react";
import { milestoneService, progressService } from "@/services/api";

export default function MilestonesManagement() {
  const [templates, setTemplates] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTemplate, setFilterTemplate] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOverride, setSelectedOverride] = useState(null);
  const [adjustedDate, setAdjustedDate] = useState("");
  const [adjustedReason, setAdjustedReason] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);

  // New Override State
  const [students, setStudents] = useState([]);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newOverride, setNewOverride] = useState({
    studentId: "",
    milestoneName: "",
    date: "",
    reason: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, overridesRes, studentsRes] = await Promise.all([
        milestoneService.getTemplates(),
        milestoneService.getOverrides(),
        progressService.getMyStudents(),
      ]);
      setTemplates(templatesRes.data?.templates || []);
      setOverrides(overridesRes.data?.overrides || []);
      setStudents(studentsRes.data?.students || []);
    } catch (err) {
      console.error("Failed to load milestone data", err);
      toast.error(err.response?.data?.message || err.message || "Unable to load milestones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOverrides = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return overrides.filter((override) => {
      const matchesTemplate =
        filterTemplate === "all" || override.template_id?.toString() === filterTemplate;
      const matchesSearch =
        !query ||
        override.pg_student?.FirstName?.toLowerCase().includes(query) ||
        override.pg_student?.LastName?.toLowerCase().includes(query) ||
        override.name?.toLowerCase().includes(query);
      return matchesTemplate && matchesSearch;
    });
  }, [overrides, filterTemplate, searchTerm]);

  const uniqueStudents = useMemo(() => new Set(overrides.map((o) => o.pgstudent_id)).size, [overrides]);
  const upcomingCount = useMemo(() => {
    const today = new Date();
    return overrides.filter((override) => {
      if (!override.deadline_date) return false;
      return new Date(override.deadline_date) >= today;
    }).length;
  }, [overrides]);

  const handleOpenDialog = (override) => {
    setSelectedOverride(override);
    setAdjustedDate(override.deadline_date ? override.deadline_date.split("T")[0] : "");
    setAdjustedReason(override.reason || "");
    setDialogOpen(true);
  };

  const resetDialogState = () => {
    setSelectedOverride(null);
    setAdjustedDate("");
    setAdjustedReason("");
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetDialogState();
  };

  const handleSaveOverride = async () => {
    if (!selectedOverride) return;
    try {
      setIsSaving(true);
      await progressService.updateDeadline({
        pg_student_id: selectedOverride.pgstudent_id,
        milestone_name: selectedOverride.name,
        deadline_date: adjustedDate,
        reason: adjustedReason,
      });
      toast.success("Milestone deadline updated.");
      handleDialogClose();
      fetchData();
    } catch (err) {
      console.error("Failed to update deadline", err);
      toast.error("Unable to save the override.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateOverride = async () => {
    if (!newOverride.studentId || !newOverride.milestoneName || !newOverride.date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSaving(true);
      await progressService.updateDeadline({
        pg_student_id: newOverride.studentId,
        milestone_name: newOverride.milestoneName,
        deadline_date: newOverride.date,
        reason: newOverride.reason,
      });
      toast.success("New milestone override created.");
      setCreateDialogOpen(false);
      setNewOverride({ studentId: "", milestoneName: "", date: "", reason: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to create override", err);
      toast.error(err.response?.data?.message || "Unable to create override.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderHeaderBadge = (label, value, description) => (
    <Card className="shadow-lg border border-slate-100 rounded-2xl">
      <CardContent className="p-4 space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-full px-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Milestone Management
          </h1>
          <p className="text-sm text-slate-500">Administer system-wide milestone templates and student overrides.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/cgs/monitoring">
            <Button variant="outline">Return to Monitoring</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {renderHeaderBadge("Templates", templates.length, "Active milestone blueprints")}
        {renderHeaderBadge("Overrides", overrides.length, "Custom dates set by staff")}
        {renderHeaderBadge("Students", uniqueStudents, "Unique students with overrides")}
        {renderHeaderBadge("Upcoming", upcomingCount, "Deadlines in the future")}
      </div>

      <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <CardHeader className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl font-black text-slate-900">Milestone Templates</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              Templates drive the systemic roadmap for every student.
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 px-4 text-left">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Default Due (days)</TableHead>
                <TableHead>Sort Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-3 px-4 font-semibold text-slate-800">{template.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{template.type}</TableCell>
                  <TableCell className="text-sm text-slate-500">{template.document_type || "-"}</TableCell>
                  <TableCell className="text-sm text-slate-500">{template.default_due_days ?? "Auto"}</TableCell>
                  <TableCell className="text-sm text-slate-500">{template.sort_order}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-black text-slate-900">Student Overrides</CardTitle>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 px-6"
              onClick={() => setCreateDialogOpen(true)}
            >
              Add New Override
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search student or milestone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filterTemplate} onValueChange={(value) => setFilterTemplate(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter milestone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Milestones</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOverrides.length > 0 ? (
                  filteredOverrides.map((override) => {
                    const dueDate = override.deadline_date
                      ? new Date(override.deadline_date).toLocaleDateString()
                      : "System Default";
                    return (
                      <TableRow key={`${override.id}-${override.pgstudent_id}`} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-3 px-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {override.pg_student?.FirstName} {override.pg_student?.LastName}
                          </div>
                          <p className="text-[11px] text-slate-400">ID: {override.pgstudent_id}</p>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-800">{override.name}</span>
                        </TableCell>
                        <TableCell>{dueDate}</TableCell>
                        <TableCell className="text-xs text-slate-500 max-w-xs truncate">{override.reason || "N/A"}</TableCell>
                        <TableCell>
                          {override.staff ? (
                            <div>
                              <span className="font-semibold text-slate-800">
                                {override.staff?.FirstName} {override.staff?.LastName}
                              </span>
                              <p className="text-[11px] text-slate-400">Staff ID: {override.updated_by}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">System</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="gap-1" onClick={() => handleOpenDialog(override)}>
                            <Edit2 className="h-4 w-4" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400 font-bold">
                      No overrides found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? null : handleDialogClose())}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Milestone Deadline</DialogTitle>
            <DialogDescription>
              Modify the deadline and reason for <span className="font-semibold">{selectedOverride?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Student
              </label>
              <p className="text-sm font-semibold text-slate-900">
                {selectedOverride?.pg_student?.FirstName} {selectedOverride?.pg_student?.LastName}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">New Due Date</label>
              <input
                type="date"
                value={adjustedDate}
                onChange={(e) => setAdjustedDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Reason</label>
              <textarea
                value={adjustedReason}
                onChange={(e) => setAdjustedReason(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Why is this deadline different?"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveOverride} disabled={!adjustedDate}>
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Milestone Override</DialogTitle>
            <DialogDescription>
              Assign a custom deadline for a specific student and milestone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Student</label>
              <Select
                value={newOverride.studentId}
                onValueChange={(val) => setNewOverride(prev => ({ ...prev, studentId: val }))}
              >
                <SelectTrigger className="w-full rounded-2xl h-12 bg-slate-50">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id || student.pgstud_id} value={(student.id || student.pgstud_id).toString()}>
                      {student.name} ({student.id || student.pgstud_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Milestone</label>
              <Select
                value={newOverride.milestoneName}
                onValueChange={(val) => setNewOverride(prev => ({ ...prev, milestoneName: val }))}
              >
                <SelectTrigger className="w-full rounded-2xl h-12 bg-slate-50">
                  <SelectValue placeholder="Select a milestone" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">New Due Date</label>
              <input
                type="date"
                value={newOverride.date}
                onChange={(e) => setNewOverride(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Reason</label>
              <textarea
                value={newOverride.reason}
                onChange={(e) => setNewOverride(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-slate-50"
                placeholder="Why is this deadline different?"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreateOverride}
              disabled={isSaving || !newOverride.studentId || !newOverride.milestoneName || !newOverride.date}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
