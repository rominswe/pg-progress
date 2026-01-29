import { useState, useEffect } from 'react';
import { ClipboardCheck, User, FolderOpen, Calendar, ChevronRight, Inbox, Clock } from 'lucide-react';
import SupervisorAssessmentForm from '../../components/form/supervisor/SupervisorAssessmentForm';
import { motion, AnimatePresence } from 'framer-motion';
import { progressService } from '../../services/api';

const ProgressEvaluation = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingEvaluations();
    }, []);

    const fetchPendingEvaluations = async () => {
        try {
            const res = await progressService.getPendingEvaluations();
            setReports(res.data?.evaluations || []);
        } catch (error) {
            console.error('Error fetching pending evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedStudent) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-6xl mx-auto p-8"
            >
                <SupervisorAssessmentForm
                    studentData={selectedStudent}
                    onBack={() => {
                        setSelectedStudent(null);
                        fetchPendingEvaluations();
                    }}
                />
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 max-w-full px-6 mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
                        <ClipboardCheck className="w-7 h-7 text-white" />
                        Student Progress Update
                    </h1>
                    <p className="text-blue-100 font-medium text-base">Review and assess student progress reports for the current semester.</p>
                </div>
            </div>

            {/* List Container */}
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 text-sm">{reports.length}</span>
                        Pending Reviews
                    </h2>
                    <span className="text-sm font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Calendar size={14} /> Current Semester
                    </span>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-300"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Inbox size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
                            <p className="text-slate-500 max-w-sm">No pending progress.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {reports.map((report, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={report.id}
                                    className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer"
                                    onClick={() => setSelectedStudent(report)}
                                >
                                    {/* Student Icon & Date */}
                                    <div className="flex flex-col items-center gap-2 text-center w-full md:w-auto shrink-0">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <User size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <Clock size={10} /> {report.submittedDate ? new Date(report.submittedDate).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{report.fullName}</h3>
                                            <span className="text-xs font-medium text-slate-400">{report.studentId}</span>
                                        </div>

                                        <p className="text-sm text-slate-500 line-clamp-1">{report.program}</p>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                                                <FolderOpen size={12} /> {report.title}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Arrow */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all md:ml-4">
                                        <ChevronRight size={20} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressEvaluation;