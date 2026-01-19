import React, { useState, useEffect } from 'react';
import ThesisEvaluationForm from '@/components/form/examiner/ThesisEvaluationForm.jsx';
import DocumentViewer from '@/components/DocumentViewer.jsx';
import { useAuth } from '@/components/auth/AuthContext';
import { dashboardService, defenseEvaluationService } from '@/services/api';
import { Eye, Calendar as CalendarIcon, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCalendar } from '@/hooks/useCalendar';
import CalendarComponent from '@/components/common/CalendarComponent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ExaminerDashboard = () => {
    const { logout } = useAuth();

    // State for Views
    const [view, setView] = useState('list');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for Logout Confirmation
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Data State
    const [students, setStudents] = useState([]);
    const { data: calendarData } = useCalendar('staff');
    const calendarEvents = calendarData?.data || [];

    // Fetch Students on Mount
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await dashboardService.getExaminerStudents();
                setStudents(res.data?.students || []);
            } catch (error) {
                console.error("Failed to fetch students:", error);
                // alert("Failed to load students.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleEvaluateClick = (student) => {

        setSelectedStudent(student);
        setView('form');
    };

    const handleFormSubmit = async (data) => {


        try {
            // Calculate overall rating
            const { originality, methodology, analysis, presentation } = data.ratings;
            const overall = Math.round((originality + methodology + analysis + presentation) / 4);

            const payload = {
                student_id: data.studentId,
                student_name: selectedStudent.fullName,
                defense_type: selectedStudent.defenseType || 'Research Proposal',
                semester: selectedStudent.semester || '2023/2024',
                knowledge_rating: originality,
                organization_rating: methodology,
                response_rating: analysis,
                presentation_rating: presentation,
                overall_rating: overall,
                strengths: data.comments, // Using comments as strengths/general feedback
                recommendations: data.finalRemarks,
                final_comments: data.finalRemarks,
                viva_outcome: data.vivaOutcome,
                evaluation_date: data.vivaDate
            };

            await defenseEvaluationService.submitEvaluation(payload);

            alert("Evaluation submitted successfully!");

            // Refresh list
            const res = await dashboardService.getExaminerStudents();
            setStudents(res.data?.students || []);

            setView('list');
            setSelectedStudent(null);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit evaluation. Please try again.");
        }
    };

    const onLogoutConfirm = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    // --- RENDER DASHBOARD ---
    if (view === 'viewer' && selectedStudent) {
        return (
            <DocumentViewer
                documentId={selectedStudent.documentId}
                documentName={selectedStudent.thesisTitle}
                onClose={() => {

                    setView('list');
                    setSelectedStudent(null);
                }}
            />
        );
    }

    if (view === 'form' && selectedStudent) {
        return (
            <ThesisEvaluationForm
                studentData={selectedStudent}
                existingData={selectedStudent.evaluationData}
                onSubmit={handleFormSubmit}
                onCancel={() => {

                    setView('list');
                    setSelectedStudent(null);
                }}
            />
        );
    }

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading students...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-full px-6 mx-auto"
        >
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Examiner Dashboard</h1>
                    <p className="text-blue-100 font-medium text-lg">
                        Welcome back. You have <span className="text-white font-bold underline decoration-blue-300">{students.length}</span> students assigned for evaluation.
                    </p>
                </div>
            </div>

            {/* Students Table Section */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                                <th className="text-left px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Thesis Title</th>
                                <th className="text-left px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{student.fullName}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{student.studentId}</div>
                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 mt-2 uppercase">
                                            {student.programme}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <div className="font-medium text-slate-700 text-sm line-clamp-2 mb-2">{student.thesisTitle}</div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                            {student.defenseType}
                                        </div>
                                        {student.documentId && (
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setView('viewer');
                                                }}
                                                className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-700 mt-4 transition-colors"
                                            >
                                                <Eye size={14} />
                                                View Document
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${student.status === 'Submitted'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleEvaluateClick(student)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${student.status === 'Submitted'
                                                ? 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                                                }`}
                                        >
                                            {student.status === 'Submitted' ? 'Evaluate' : 'Start Evaluation'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {students.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-slate-200" size={32} />
                        </div>
                        <p className="text-slate-400 font-medium">No students currently assigned for evaluation.</p>
                    </div>
                )}
            </div>

            {/* Academic Calendar - Full Width Row */}
            <div className="w-full">
                <CalendarComponent events={calendarEvents} type="staff" />
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Confirm Log Out</h3>
                        <p className="text-slate-500 mb-8">Are you sure you want to exit the Examiner Portal?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onLogoutConfirm}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};


export default ExaminerDashboard;
