import React, { useState } from 'react';
import {
    User, Award, AlertTriangle, MessageSquare, Calendar, ChevronLeft,
    CheckCircle, TrendingUp, AlertCircle, FileText, BarChart, Download, ExternalLink, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import StudentProgressLogs from '../../common/StudentProgressLogs';
import { progressService, API_BASE_URL } from '../../../services/api';

const SupervisorAssessmentForm = ({ studentData, onBack }) => {
    // Initial State following your provided structure
    const [formData, setFormData] = useState({
        ratings: {
            researchProgress: 0,
            qualityOfWork: 0,
            initiative: 0,
            attendance: 0,
            englishProficiency: 0
        },
        hasIssues: null, // true/false
        issueDescription: '',
        milestones: '',
        nextSemesterPlan: '',
        overallStatus: '',
        recommendation: '',
        supervisorComments: '',
        evaluationDate: new Date().toISOString().split('T')[0]
    });

    const [showLogs, setShowLogs] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle standard inputs/textareas
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Rating Matrix (1-5)
    const handleRatingChange = (criterion, value) => {
        setFormData(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [criterion]: parseInt(value) }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            console.log("Form Submitted for:", studentData.fullName, formData);

            // Map frontend form to backend expectations
            await progressService.reviewProgressUpdate({
                update_id: studentData.id,
                supervisor_feedback: formData.supervisorComments,
                status: 'Reviewed'
            });

            alert("Assessment submitted and progress update marked as Reviewed!");
            onBack(); // Return to table view
        } catch (error) {
            console.error("Error submitting assessment:", error);
            alert("Failed to submit assessment: " + (error.response?.data?.error || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/${path.replace(/\\/g, '/')}`;
    };

    const isAtRisk = formData.overallStatus === 'Unsatisfactory';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <button
                    onClick={onBack}
                    className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-medium text-sm backdrop-blur-sm"
                >
                    <ChevronLeft size={16} /> Back to List
                </button>

                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
                        <Award className="w-7 h-7 text-white" />
                        Progress Assessment
                    </h1>
                    <p className="text-blue-100 font-medium text-base">Academic Supervisor Evaluation Portal • Semester Oct 2025/2026</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">

                {/* SECTION: STUDENT SUBMISSION DETAILS */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            Student Progress Submission
                        </h2>
                        {studentData?.documentPath && (
                            <a
                                href={getFileUrl(studentData.documentPath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100"
                            >
                                <Download size={16} /> View Attached Report
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary side */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Update Title</label>
                                <p className="text-slate-800 font-bold text-xl mb-4">{studentData?.title || 'Report Title Not Provided'}</p>

                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Student's Description</label>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 italic text-slate-600 leading-relaxed shadow-sm min-h-[100px]">
                                    {studentData?.description ? `"${studentData.description}"` : "No description provided."}
                                </div>
                            </div>
                        </div>

                        {/* Breakdown side */}
                        <div className="space-y-4">
                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <CheckCircle size={14} /> Key Achievements
                                </p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{studentData?.achievements || "N/A"}</p>
                            </div>
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Challenges
                                </p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{studentData?.challenges || "None reported."}</p>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TrendingUp size={14} /> Next Steps
                                </p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{studentData?.nextSteps || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 1: STUDENT INFO */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User size={20} />
                        </div>
                        Student Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student Name</label>
                            <p className="text-slate-800 font-bold text-lg mt-1">{studentData?.fullName || "N/A"}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student ID</label>
                            <p className="text-slate-800 font-bold text-lg mt-1">{studentData?.studentId || "N/A"}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Semester Session</label>
                            <p className="text-slate-800 font-bold text-lg mt-1">{studentData?.semester || "Oct 2025/2026"}</p>
                        </div>
                    </div>
                </div>

                {/* Logs Modal */}
                {showLogs && (
                    <StudentProgressLogs
                        studentId={studentData?.studentId || studentData?.id}
                        onClose={() => setShowLogs(false)}
                    />
                )}

                {/* SECTION 2: PERFORMANCE RATINGS */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <BarChart size={20} />
                            </div>
                            Performance Ratings
                        </h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">1 = Poor, 5 = Excellent</span>
                    </div>

                    <div className="space-y-6">
                        {[
                            { id: 'researchProgress', label: 'Research Progress & Milestones' },
                            { id: 'qualityOfWork', label: 'Quality of Work Produced' },
                            { id: 'initiative', label: 'Initiative & Independence' },
                            { id: 'attendance', label: 'Attendance & Consultations' },
                            { id: 'englishProficiency', label: 'English Writing Proficiency' }
                        ].map((criterion, idx) => (
                            <div key={criterion.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl transition-colors ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                                <span className="text-slate-700 font-bold text-sm md:text-base w-full md:w-1/3">{criterion.label}</span>
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <label
                                            key={score}
                                            className={`relative cursor-pointer w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold transition-all border-2 
                                                ${formData.ratings[criterion.id] === score
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-110 z-10'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={criterion.id}
                                                value={score}
                                                checked={formData.ratings[criterion.id] === score}
                                                onChange={() => handleRatingChange(criterion.id, score)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            {score}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION: RECOMMENDATION & DECLARATION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recommendation */}
                    <div className={`bg-white rounded-3xl p-8 shadow-sm border relative overflow-hidden ${isAtRisk ? 'border-red-200 shadow-red-100' : 'border-slate-100'}`}>
                        <div className={`absolute top-0 left-0 w-2 h-full ${isAtRisk ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isAtRisk ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                <FileText size={20} />
                            </div>
                            Final Recommendation
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Overall Progress Status <span className="text-red-500">*</span></label>
                                <select
                                    name="overallStatus"
                                    value={formData.overallStatus}
                                    onChange={handleChange}
                                    required
                                    className={`w-full p-3 rounded-xl border font-bold outline-none transition-all appearance-none cursor-pointer
                                        ${formData.overallStatus === 'Unsatisfactory'
                                            ? 'bg-red-50 border-red-300 text-red-600 focus:ring-red-200'
                                            : formData.overallStatus === 'Satisfactory'
                                                ? 'bg-green-50 border-green-300 text-green-600 focus:ring-green-200'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'
                                        }`}
                                >
                                    <option value="">Select Status Report</option>
                                    <option value="Satisfactory">Satisfactory (Proceed)</option>
                                    <option value="Unsatisfactory">Unsatisfactory (At Risk)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Declaration / Comments */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-slate-500"></div>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                                <MessageSquare size={20} />
                            </div>
                            Supervisor Declaration
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Supervisor Comments (Reply back to student)</label>
                                <textarea
                                    name="supervisorComments"
                                    value={formData.supervisorComments}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none font-medium text-slate-600"
                                    rows="3"
                                    placeholder="Your detailed feedback here..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Date of Evaluation</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        name="evaluationDate"
                                        value={formData.evaluationDate}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end gap-4 pt-4 pb-12">
                    <button type="button" onClick={onBack} disabled={isSubmitting} className="px-8 py-4 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all text-lg shadow-lg flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Submitting Assessment...
                            </>
                        ) : (
                            'Confirm & Submit Assessment'
                        )}
                    </button>
                </div>

            </form>
        </motion.div >
    );
};

export default SupervisorAssessmentForm;