import React, { useState } from 'react';
import {
    User, Award, FileText, BarChart, Calendar,
    CheckCircle, AlertCircle, ChevronLeft, Loader2,
    MessageSquare, ClipboardCheck, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThesisEvaluationForm({ studentData, existingData, onSubmit, onCancel }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        studentId: studentData.studentId,
        ratings: existingData?.ratings || {
            originality: 0,
            methodology: 0,
            analysis: 0,
            presentation: 0
        },
        comments: existingData?.comments || '',
        vivaDate: existingData?.vivaDate || new Date().toISOString().split('T')[0],
        vivaOutcome: existingData?.vivaOutcome || '',
        finalRemarks: existingData?.finalRemarks || ''
    });

    const handleRatingChange = (criterion, value) => {
        setFormData(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [criterion]: value }
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            onSubmit(formData);
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit evaluation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const criteria = [
        { id: 'originality', label: 'Originality of Research' },
        { id: 'methodology', label: 'Soundness of Methodology' },
        { id: 'analysis', label: 'Data Analysis & Interpretation' },
        { id: 'presentation', label: 'Clarity of Presentation' }
    ];

    const outcomes = ['Pass', 'Pass with Minor Corrections', 'Pass with Major Corrections', 'Resubmit', 'Fail'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="bg-gradient-to-r from-blue-800 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <button
                    onClick={(e) => {
                        e.preventDefault();

                        onCancel();
                    }}
                    className="absolute top-8 right-8 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm backdrop-blur-md border border-white/10 cursor-pointer"
                >
                    <ChevronLeft size={16} /> Back to Dashboard
                </button>

                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
                        <Award className="w-8 h-8" />
                        Defense Evaluation Form
                    </h1>
                    <p className="text-blue-100 font-medium opacity-90">Official External & Internal Examiner Assessment Portal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <User className="text-blue-600" size={22} />
                            Candidate Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                                <p className="text-slate-800 font-bold">{studentData.fullName}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Student ID</label>
                                <p className="text-slate-800 font-bold">{studentData.studentId}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Semester</label>
                                <p className="text-slate-800 font-bold">{studentData.semester || "N/A"}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Defense Type</label>
                                <p className="text-slate-800 font-bold">{studentData.defenseType || "Not Specified"}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Research Title</label>
                                <p className="text-slate-800 font-bold leading-snug">{studentData.thesisTitle}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                            <BarChart className="text-blue-600" size={22} />
                            Academic Assessment (1-5)
                        </h2>
                        <div className="space-y-6">
                            {criteria.map((item) => (
                                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-slate-50/50 gap-4">
                                    <span className="font-bold text-slate-700">{item.label}</span>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => handleRatingChange(item.id, num)}
                                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-bold transition-all border-2 
                                                    ${formData.ratings[item.id] === num
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <MessageSquare className="text-blue-600" size={22} />
                            Detailed Examiner Comments
                        </h2>
                        <textarea
                            name="comments"
                            value={formData.comments}
                            onChange={handleChange}
                            placeholder="Provide your professional feedback on the thesis content, research contribution, and presentation..."
                            className="w-full min-h-[150px] p-6 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-slate-700 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Calendar className="text-blue-600" size={22} />
                            Viva Voce
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-600 mb-2 block">Examination Date</label>
                                <input
                                    type="date"
                                    name="vivaDate"
                                    value={formData.vivaDate}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-600 mb-2 block">Viva Outcome</label>
                                <select
                                    name="vivaOutcome"
                                    value={formData.vivaOutcome}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-blue-500 appearance-none"
                                >
                                    <option value="">Select Outcome</option>
                                    {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ClipboardCheck className="text-blue-400" size={22} />
                            Final Recommendation
                        </h2>
                        <textarea
                            name="finalRemarks"
                            value={formData.finalRemarks}
                            onChange={handleChange}
                            placeholder="Summary and final justification..."
                            className="w-full min-h-[120px] p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/15 outline-none transition-all resize-none mb-8"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-900/40 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={22} />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={22} />
                                    Submit Evaluation
                                </>
                            )}
                        </button>
                        <p className="mt-4 text-center text-xs text-blue-300 font-medium opacity-70">
                            By submitting, you confirm this assessment is final and adheres to AIU academic standards.
                        </p>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
