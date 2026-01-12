import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, FileCheck, AlertCircle, Info, User, CheckCircle, Clock } from 'lucide-react';

function SupervisorReviewForm({ studentData, onDecision, onBack }) {
    const { user } = useAuth();

    const [reviewData, setReviewData] = useState({
        supervisorStatus: '',
        approvalNote: '',
        rejectionReason: '',
        supervisorName: user?.name || '',
        staffId: user?.id || '',
        signature: '',
        decisionDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (user) {
            setReviewData(prev => ({
                ...prev,
                supervisorName: user.name,
                staffId: user.id
            }));
        }
    }, [user]);

    const [errors, setErrors] = useState({});

    if (!studentData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-xl">
                <AlertCircle className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
                <p className="text-slate-600 font-bold mb-6">Loading student request data...</p>
                <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                    Go Back to Table
                </button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReviewData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!reviewData.supervisorStatus) {
            newErrors.supervisorStatus = 'Please select a status';
        } else if ((reviewData.supervisorStatus === 'Rejected' || reviewData.supervisorStatus === 'More Info') && !reviewData.rejectionReason.trim()) {
            newErrors.rejectionReason = `Reason is required`;
        }

        if (!reviewData.signature.trim()) {
            newErrors.signature = 'Please type your full name to sign';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onDecision({
                decision: reviewData.supervisorStatus,
                fullData: { ...studentData, ...reviewData }
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <button
                    onClick={onBack}
                    className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all font-medium text-sm backdrop-blur-sm"
                >
                    <ChevronLeft size={16} /> Back to List
                </button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
                        <FileCheck className="w-7 h-7 text-white" />
                        Review Request
                    </h1>
                    <p className="text-blue-100 font-medium text-base">Evaluate student administrative application for approval.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* SECTION 1: STUDENT SUMMARY */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Student Submission
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem label="Student Name" value={studentData.fullName} />
                        <InfoItem label="Student ID" value={studentData.studentId} />
                        <InfoItem label="Request Type" value={studentData.serviceCategory} />
                        <InfoItem label="Submission Date" value={studentData.submissionDate} />
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Supporting Documents</label>
                            <div className="flex flex-wrap gap-2">
                                {studentData.supportingDocument ? (
                                    <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-sm font-bold">
                                        📎 {studentData.supportingDocument.name}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 text-sm font-medium italic">No documents attached</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: DECISION */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-blue-500" />
                        Academic Decision
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <DecisionOption
                            label="Recommend / Approved"
                            value="Approved"
                            selected={reviewData.supervisorStatus}
                            onChange={handleInputChange}
                            color="blue"
                        />
                        <DecisionOption
                            label="Not Recommended"
                            value="Rejected"
                            selected={reviewData.supervisorStatus}
                            onChange={handleInputChange}
                            color="red"
                        />
                        <DecisionOption
                            label="More Info Needed"
                            value="More Info"
                            selected={reviewData.supervisorStatus}
                            onChange={handleInputChange}
                            color="orange"
                        />
                    </div>
                    {errors.supervisorStatus && <p className="text-red-500 text-sm font-bold mt-2 mb-4">⚠ {errors.supervisorStatus}</p>}

                    {/* Conditional Remarks */}
                    <div className={`transition-all duration-300 ${reviewData.supervisorStatus ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                        <label className="text-sm font-bold text-slate-700 block mb-2">
                            {reviewData.supervisorStatus === 'Approved' ? 'Approval Note (Optional)' : 'Reason / Requirement'}
                            {reviewData.supervisorStatus !== 'Approved' && reviewData.supervisorStatus && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            name={reviewData.supervisorStatus === 'Approved' ? "approvalNote" : "rejectionReason"}
                            value={reviewData.supervisorStatus === 'Approved' ? reviewData.approvalNote : reviewData.rejectionReason}
                            onChange={handleInputChange}
                            placeholder="Enter your comments here..."
                            rows="4"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium"
                        />
                        {errors.rejectionReason && <p className="text-red-500 text-sm font-bold mt-2">⚠ {errors.rejectionReason}</p>}
                    </div>
                </div>

                {/* SECTION 3: DECLARATION */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-slate-400"></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-slate-400" />
                        Official Declaration
                    </h3>

                    <div className="bg-blue-50/50 border-l-4 border-blue-600 p-4 rounded-xl mb-6">
                        <p className="text-slate-700 text-sm font-medium leading-relaxed">
                            I hereby confirm that I have reviewed this student's application and the decision provided is final based on academic merit. By typing my name below, I digitally sign this document.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Supervisor Name</label>
                            <input type="text" value={reviewData.supervisorName} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none cursor-default" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Staff ID</label>
                            <input type="text" value={reviewData.staffId} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none cursor-default" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Digital Signature (Type Full Name) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="signature"
                                value={reviewData.signature}
                                onChange={handleInputChange}
                                placeholder="e.g. Dr. John Smith"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-bold ${errors.signature ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                            />
                            {errors.signature && <p className="text-red-500 text-sm font-bold mt-2">⚠ {errors.signature}</p>}
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all shadow-lg text-lg"
                    >
                        Submit Decision
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

const InfoItem = ({ label, value }) => (
    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
        <div className="text-slate-800 font-bold">{value || 'N/A'}</div>
    </div>
);

const DecisionOption = ({ label, value, selected, onChange, color }) => {
    const isSelected = selected === value;
    const colors = {
        blue: {
            border: isSelected ? 'border-blue-500' : 'border-slate-200',
            bg: isSelected ? 'bg-blue-50' : 'bg-white',
            text: isSelected ? 'text-blue-700' : 'text-slate-500',
            icon: isSelected ? 'bg-blue-500' : 'bg-slate-200'
        },
        red: {
            border: isSelected ? 'border-red-500' : 'border-slate-200',
            bg: isSelected ? 'bg-red-50' : 'bg-white',
            text: isSelected ? 'text-red-700' : 'text-slate-500',
            icon: isSelected ? 'bg-red-500' : 'bg-slate-200'
        },
        orange: {
            border: isSelected ? 'border-orange-500' : 'border-slate-200',
            bg: isSelected ? 'bg-orange-50' : 'bg-white',
            text: isSelected ? 'text-orange-700' : 'text-slate-500',
            icon: isSelected ? 'bg-orange-500' : 'bg-slate-200'
        }
    };

    const activeColor = colors[color];

    return (
        <label className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 gap-3 group
            ${activeColor.border} ${activeColor.bg} ${isSelected ? 'shadow-md scale-[1.02]' : 'hover:border-blue-300 hover:bg-slate-50'}`}>
            <input
                type="radio"
                name="supervisorStatus"
                value={value}
                onChange={onChange}
                checked={isSelected}
                className="hidden"
            />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${activeColor.icon}`}>
                {isSelected ? <CheckCircle size={20} /> : <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span className={`text-sm font-bold text-center leading-tight transition-colors ${activeColor.text}`}>
                {label}
            </span>
        </label>
    );
};

export default SupervisorReviewForm;