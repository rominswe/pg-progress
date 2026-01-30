import { useState, useEffect } from 'react';
import { ClipboardCheck, User, BookOpen, Send, X, Clock, History, Calendar, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { evaluationService } from '../../services/api';

const ProgressEvaluation2 = () => {
    const [formData, setFormData] = useState({
        studentName: '',
        studentId: '',
        defenseType: '',
        semester: '',
        // Performance ratings
        knowledgeRating: '',
        presentationRating: '',
        responseRating: '',
        organizationRating: '',
        overallRating: '',
        // Comments
        strengths: '',
        weaknesses: '',
        recommendations: '',
        finalComments: '',
        // Supervisor info
        supervisorName: '',
        evaluationDate: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    // State for Final Thesis Status check
    const [finalThesisStatus, setFinalThesisStatus] = useState(null);

    // Auto-fill student name and semester when ID is entered
    useEffect(() => {
        const lookupStudent = async () => {
            // Trigger lookup if ID is at least 3 characters long
            if (formData.studentId && formData.studentId.trim().length >= 3) {
                try {
                    setIsSearching(true);
                    const res = await evaluationService.getStudentById(formData.studentId);
                    if (res?.data) {
                        setFormData(prev => ({
                            ...prev,
                            studentName: res.data.name || '',
                            semester: res.data.semester || '',
                            // Normalize studentId to the display ID version (stu_id)
                            studentId: res.data.stu_id || prev.studentId
                        }));
                        setErrors(prev => ({ ...prev, studentId: '' }));
                        // Store thesis status
                        setFinalThesisStatus(res.data.finalThesisStatus);
                    }
                } catch (error) {
                    // Clear secondary fields on error/not found but keep ID so they can correct it
                    setFormData(prev => ({ ...prev, studentName: '', semester: '' }));
                    setFinalThesisStatus(null);
                    console.error('Lookup student error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else if (!formData.studentId || formData.studentId.length === 0) {
                // Fully clear if ID is wiped
                setFormData(prev => ({ ...prev, studentName: '', semester: '' }));
                setFinalThesisStatus(null);
            }
        };

        const timer = setTimeout(lookupStudent, 600); // 600ms debounce
        return () => clearTimeout(timer);
    }, [formData.studentId]);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await evaluationService.getAllEvaluations();
            setHistory(res?.data?.evaluations || []);
        } catch (error) {
            console.error('Error fetching evaluation history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Strictly prevent manual edits to Student Name and Semester if a Student ID is present
        // This ensures the data stays synchronized with the database lookup
        // Strictly prevent manual edits to Student Name and Semester
        if (name === 'studentName' || name === 'semester') {
            return;
        }
        // Capitalize Supervisor Name for normalization
        if (name === 'supervisorName') {
            value = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const semesterValue = String(formData.semester ?? '');

        if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
        if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
        if (!formData.defenseType) newErrors.defenseType = 'Defense type is required';
        if (!semesterValue.trim()) newErrors.semester = 'Semester is required';

        // Validate ratings
        const ratings = ['knowledgeRating', 'presentationRating', 'responseRating', 'organizationRating', 'overallRating'];
        ratings.forEach(rating => {
            if (!formData[rating]) newErrors[rating] = 'Rating is required';
        });

        if (!formData.supervisorName.trim()) newErrors.supervisorName = 'Supervisor name is required';
        if (!formData.finalComments) newErrors.finalComments = 'Final decision is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit evaluation to backend
            await evaluationService.submitEvaluation(formData);

            setShowSuccess(true);
            fetchHistory(); // Refresh history

            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({
                    studentName: '',
                    studentId: '',
                    defenseType: '',
                    semester: '',
                    knowledgeRating: '',
                    presentationRating: '',
                    responseRating: '',
                    organizationRating: '',
                    overallRating: '',
                    strengths: '',
                    weaknesses: '',
                    recommendations: '',
                    finalComments: '',
                    supervisorName: '',
                    evaluationDate: new Date().toISOString().split('T')[0]
                });
                setShowSuccess(false);
            }, 2000);

        } catch (error) {
            console.error('Error submitting evaluation:', error);

            const errorData = error.response?.data;

            if (errorData?.error === 'Final Thesis Not Submitted') {
                toast.error(
                    'Evaluation not allowed: ' +
                    errorData.message +
                    '. Please ask the student to submit their Final Thesis before proceeding.'
                );
            } else if (errorData?.error === 'Student Not Found') {
                toast.error(
                    'Student not found: ' +
                    errorData.message +
                    '. Please verify the Student ID and try again.'
                );
            } else if (errorData?.error === 'Final Thesis Not Approved') {
                toast.error('Final Thesis pending approval: ' + errorData.message);
            } else {
                const errorMessage =
                    errorData?.error || errorData?.message || error.message || 'Failed to submit evaluation. Please try again.';
                toast.error('Error: ' + errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center min-vh-100 p-8"
            >
                <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Submitted!</h2>
                    <p className="text-gray-600">The evaluation has been sent to the student's feedback section.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-full px-6 mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
                        <ClipboardCheck className="w-7 h-7 text-white" />
                        Evaluation
                    </h1>
                    <p className="text-blue-100 font-medium text-base">Evaluate student's research progress, defense presentation, or final thesis.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 space-y-8">
                            {/* Student Information */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Student Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Student Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="studentName"
                                            value={formData.studentName}
                                            onChange={handleChange}
                                            readOnly={true}
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.studentName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'} focus:border-gray-200 focus:ring-0 outline-none transition-all`}
                                            placeholder="Auto-filled from Student ID"
                                        />
                                        {errors.studentName && <p className="mt-1 text-sm text-red-500">⚠ {errors.studentName}</p>}
                                        {formData.studentName && formData.studentId && (
                                            <p className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                                <ClipboardCheck className="w-3 h-3" /> User Found
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Student ID <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="studentId"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.studentId ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all`}
                                                placeholder="e.g., AIU000100"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.studentId && <p className="mt-1 text-sm text-red-500">⚠ {errors.studentId}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Evaluation Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="defenseType"
                                            value={formData.defenseType}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.defenseType ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all`}
                                        >
                                            <option value="">Select type</option>
                                            <option value="Proposal Defense">Proposal Defense</option>
                                            <option
                                                value="Final Thesis"
                                                disabled={!finalThesisStatus || finalThesisStatus === "Rejected"}
                                                title={!finalThesisStatus ? "Student has not submitted Final Thesis yet" : ""}
                                            >
                                                Final Thesis {!finalThesisStatus ? "(Not Submitted)" : ""}
                                            </option>
                                        </select>
                                        {errors.defenseType && <p className="mt-1 text-sm text-red-500">⚠ {errors.defenseType}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Semester <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            readOnly={true}
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.semester ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'} focus:border-gray-200 focus:ring-0 outline-none transition-all`}
                                            placeholder="Auto-filled from Student ID"
                                        />
                                        {errors.semester && <p className="mt-1 text-sm text-red-500">⚠ {errors.semester}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Performance Ratings */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    Performance Ratings
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">Rate from 1 (Poor) to 5 (Excellent)</p>

                                <div className="space-y-4">
                                    {[
                                        { name: 'knowledgeRating', label: 'Knowledge & Understanding' },
                                        { name: 'presentationRating', label: 'Presentation Skills' },
                                        { name: 'responseRating', label: 'Response to Questions' },
                                        { name: 'organizationRating', label: 'Organization & Structure' },
                                        { name: 'overallRating', label: 'Overall Performance' }
                                    ].map(({ name, label }) => (
                                        <div key={name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
                                            <label className="text-sm font-semibold text-gray-700">
                                                {label} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(rating => (
                                                    <label key={rating} className="cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={name}
                                                            value={rating}
                                                            checked={formData[name] === String(rating)}
                                                            onChange={handleChange}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${formData[name] === String(rating)
                                                            ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                            : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300'
                                                            }`}>
                                                            {rating}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors[name] && <p className="text-sm text-red-500">⚠</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comments */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Feedback</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Strengths</label>
                                        <textarea
                                            name="strengths"
                                            value={formData.strengths}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                                            placeholder="What did the student do well?"
                                        />
                                    </div>



                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations and Comments</label>
                                        <textarea
                                            name="recommendations"
                                            value={formData.recommendations}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                                            placeholder="Suggestions for next steps..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Final Decision <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="finalComments"
                                                value={formData.finalComments}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.finalComments ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none`}
                                            >
                                                <option value="">Select decision</option>
                                                <option value="Pass">Pass</option>
                                                <option value="Pass with Minor Corrections">Pass with Minor Corrections</option>
                                                <option value="Pass with Major Corrections">Pass with Major Corrections</option>
                                                <option value="Resubmission of Thesis">Resubmission of Thesis</option>
                                                <option value="Reject">Reject</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <ChevronRight className="w-5 h-5 rotate-90" />
                                            </div>
                                        </div>
                                        {errors.finalComments && <p className="mt-1 text-sm text-red-500">⚠ {errors.finalComments}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Supervisor Info */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Verification</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Supervisor Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="supervisorName"
                                            value={formData.supervisorName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.supervisorName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all`}
                                            placeholder="Your full name"
                                        />
                                        {errors.supervisorName && <p className="mt-1 text-sm text-red-500">⚠ {errors.supervisorName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Evaluation Date</label>
                                        <input
                                            type="date"
                                            name="evaluationDate"
                                            value={formData.evaluationDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600" />
                                History
                            </h2>
                            <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">
                                {history.length} Total
                            </span>
                        </div>

                        <div className="p-0 max-h-[70vh] overflow-y-auto">
                            {loadingHistory ? (
                                <div className="p-8 text-center">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500 font-medium">Fetching history...</p>
                                </div>
                            ) : history.length > 0 ? (
                                history.map((record, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-5 border-b border-gray-50 hover:bg-blue-50 transition-colors group cursor-default"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {record.pg_student ? `${record.pg_student.FirstName} ${record.pg_student.LastName}` : (record.student_name || 'Unknown Student')}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    ID: {record.pg_student?.stu_id || record.stu_id || record.student_id}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-100">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-xs font-bold">{record.overall_rating}/5</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-md text-gray-600 border border-gray-100 shadow-sm">
                                                {record.defense_type}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-md text-blue-600 border border-blue-100 shadow-sm">
                                                {record.semester}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                                            <span className="flex items-center gap-1 uppercase">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(record.evaluation_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <History className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-gray-400 font-medium italic">No evaluations yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressEvaluation2;
