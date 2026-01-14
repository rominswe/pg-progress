import React, { useState, useEffect } from 'react';
import ThesisEvaluationForm from '../../components/form/examiner/ThesisEvaluationForm';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/api'; // Assuming you have api service set up, or direct axios
import axios from 'axios';
import { API_BASE_URL } from '@/services/api';

const ExaminerDashboard = () => {
    const { user, logout } = useAuth(); // Assuming useAuth provides the user object

    // State
    const [view, setView] = useState('list'); // 'list' | 'form'
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, completed: 0 });

    // Fetch Assigned Students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/evaluations/assigned-students`, {
                withCredentials: true // Ensure cookies are sent
            });

            if (res.data?.students) {
                setStudents(res.data.students);

                // Calculate stats
                const pending = res.data.students.filter(s => s.status === 'Pending').length;
                const completed = res.data.students.filter(s => s.status === 'Submitted').length;
                setStats({ pending, completed });
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
            toast.error("Could not load assigned students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleEvaluateClick = (student) => {
        setSelectedStudent(student);
        setView('form');
    };

    const handleFormSubmit = async (formData) => {
        try {
            // Add supervisorName (Examiner Name) from Auth context if not in form
            const payload = {
                ...formData,
                supervisorName: user?.FirstName + " " + user?.LastName,
            };

            const res = await axios.post(`${API_BASE_URL}/api/evaluations`, payload, {
                withCredentials: true
            });

            if (res.status === 201) {
                toast.success("Evaluation submitted successfully!");
                setView('list');
                setSelectedStudent(null);
                fetchStudents(); // Refresh data
            }
        } catch (err) {
            console.error("Submission error", err);
            toast.error(err.response?.data?.error || "Failed to submit evaluation.");
        }
    };

    // --- VIEW: FORM ---
    if (view === 'form' && selectedStudent) {
        return (
            <ThesisEvaluationForm
                studentData={selectedStudent}
                existingData={selectedStudent.evaluationData}
                onSubmit={handleFormSubmit}
                onCancel={() => { setView('list'); setSelectedStudent(null); }}
            />
        );
    }

    // --- VIEW: DASHBOARD LIST ---
    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* Intro Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Examiner Dashboard</h1>
                    <p className="text-slate-500">Manage your viva voce assignments and evaluations.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="font-bold text-amber-900">{stats.pending} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-900">{stats.completed} Completed</span>
                    </div>
                </div>
            </div>

            {/* Students List */}
            <Card className="border-none shadow-md bg-white">
                <CardHeader>
                    <CardTitle>Assigned Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-8 text-center text-slate-500 animate-pulse">
                            Loading student assignments...
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-900">No Assignments Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                You currently have no students assigned for evaluation in your department.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 border rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all cursor-pointer shadow-sm hover:shadow"
                                    onClick={() => handleEvaluateClick(student)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                            ${student.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {student.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">
                                                {student.fullName}
                                            </h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                                <span className="font-mono">{student.studentId}</span>
                                                <span className="hidden md:inline text-slate-300">•</span>
                                                <span>{student.programme}</span>
                                            </div>
                                            <div className="text-xs font-medium text-slate-400 mt-2">
                                                Thesis: {student.thesisTitle}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <Badge className={`
                                            px-3 py-1 text-xs font-bold uppercase tracking-wide
                                            ${student.status === 'Submitted'
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}
                                        `}>
                                            {student.status}
                                        </Badge>

                                        <Button
                                            size="sm"
                                            variant={student.status === 'Submitted' ? "outline" : "default"}
                                            className={student.status === 'Submitted' ? "" : "bg-blue-600 hover:bg-blue-700"}
                                        >
                                            {student.status === 'Submitted' ? 'View Evaluation' : 'Evaluate Candidate'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ExaminerDashboard;