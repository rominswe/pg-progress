
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Save,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CRITERIA = [
    { id: 'knowledgeRating', label: 'Knowledge & Understanding' },
    { id: 'presentationRating', label: 'Presentation Quality' },
    { id: 'responseRating', label: 'Response to Questions' },
    { id: 'organizationRating', label: 'Organization & Structure' },
    { id: 'overallRating', label: 'Overall Quality' }
];

const VIVA_OUTCOMES = ['Pass', 'Minor Corrections', 'Major Corrections', 'Fail'];

export default function ThesisEvaluationForm({ studentData, onSubmit, onCancel, existingData = null }) {
    const isReadOnly = !!existingData;
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState(existingData || {
        studentName: studentData.fullName,
        studentId: studentData.id,
        defenseType: 'Final Thesis', // Defaulting for now
        semester: 'Sem 1 2025/2026', // Placeholder or fetch dynamic

        // Ratings
        knowledgeRating: 0,
        presentationRating: 0,
        responseRating: 0,
        organizationRating: 0,
        overallRating: 0,

        // Text Fields
        strengths: '',
        weaknesses: '',
        recommendations: '',
        finalComments: '',

        // Viva Details
        vivaOutcome: '',
        evaluationDate: new Date().toISOString().split('T')[0],
        supervisorName: 'Examiner' // Will be overwritten by backend or user context
    });

    const handleChange = (field, value) => {
        if (isReadOnly) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        // Validation for Step 1
        const missingRatings = CRITERIA.filter(c => formData[c.id] === 0);
        if (missingRatings.length > 0) {
            toast.error("Please provide ratings for all criteria.");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for Step 2
        if (!formData.vivaOutcome) {
            toast.error("Please select a Viva Voce outcome.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                studentId: studentData.id // Ensure ID is passed correctly
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2" onClick={onCancel}>
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Button>
                {isReadOnly && <Badge variant="secondary" className="text-sm">Read Only Mode</Badge>}
            </div>

            {/* Student Info Card */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500 font-medium block uppercase text-xs tracking-wide">Candidate</span>
                            <span className="font-bold text-slate-800 text-lg">{studentData.fullName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 font-medium block uppercase text-xs tracking-wide">Matric ID</span>
                            <span className="font-mono text-slate-800">{studentData.studentId}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 font-medium block uppercase text-xs tracking-wide">Thesis Title</span>
                            <span className="font-bold text-slate-800 line-clamp-2">{studentData.thesisTitle || 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Steps Progress */}
            <div className="flex items-center gap-2 mb-6">
                <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>

            <form onSubmit={handleSubmit}>
                {/* STEP 1: ASSESSMENT */}
                {step === 1 && (
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>1. Thesis Assessment</CardTitle>
                            <CardDescription>Rate the candidate's performance on a scale of 1 (Poor) to 5 (Excellent).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Ratings Grid */}
                            <div className="space-y-4">
                                {CRITERIA.map((criterion) => (
                                    <div key={criterion.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                                        <Label className="font-bold text-slate-700 text-base">{criterion.label}</Label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((score) => (
                                                <button
                                                    type="button"
                                                    key={score}
                                                    disabled={isReadOnly}
                                                    onClick={() => handleChange(criterion.id, score)}
                                                    className={`
                                                        w-10 h-10 rounded-lg font-bold transition-all
                                                        ${formData[criterion.id] === score
                                                            ? 'bg-blue-600 text-white shadow-md scale-105'
                                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                        }
                                                        ${isReadOnly ? 'cursor-default opacity-90' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    {score}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Qualitative Feedback */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Strengths</Label>
                                    <Textarea
                                        placeholder="Highlight strong points..."
                                        value={formData.strengths}
                                        onChange={(e) => handleChange('strengths', e.target.value)}
                                        readOnly={isReadOnly}
                                        className="resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weaknesses</Label>
                                    <Textarea
                                        placeholder="Areas for improvement..."
                                        value={formData.weaknesses}
                                        onChange={(e) => handleChange('weaknesses', e.target.value)}
                                        readOnly={isReadOnly}
                                        className="resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="button" onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* STEP 2: VIVA RESULT */}
                {step === 2 && (
                    <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>2. Viva Voce Result</CardTitle>
                            <CardDescription>Finalize the outcome and submit your report.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Date of Viva</Label>
                                    <Input
                                        type="date"
                                        value={formData.evaluationDate}
                                        onChange={(e) => handleChange('evaluationDate', e.target.value)}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base">Final Recommendation <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {VIVA_OUTCOMES.map((outcome) => (
                                        <div
                                            key={outcome}
                                            onClick={() => !isReadOnly && handleChange('vivaOutcome', outcome)}
                                            className={`
                                                relative p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between
                                                ${formData.vivaOutcome === outcome
                                                    ? 'border-blue-600 bg-blue-50/50'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }
                                                 ${isReadOnly ? 'cursor-default' : ''}
                                            `}
                                        >
                                            <span className={`font-bold ${formData.vivaOutcome === outcome ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {outcome}
                                            </span>
                                            {formData.vivaOutcome === outcome && (
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Final Comments / Remarks</Label>
                                <Textarea
                                    placeholder="Enter any final remarks for the academic committee..."
                                    value={formData.finalComments}
                                    onChange={(e) => handleChange('finalComments', e.target.value)}
                                    readOnly={isReadOnly}
                                    className="min-h-[120px]"
                                />
                            </div>

                            {/* Confirmation Note */}
                            {!isReadOnly && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div className="text-sm text-amber-800">
                                        <strong>Important:</strong> Once submitted, this evaluation cannot be edited. Please review all ratings and comments carefully.
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                {!isReadOnly && (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                                    >
                                        {isSubmitting ? 'Submitting...' : (
                                            <>
                                                <Save className="w-4 h-4" /> Submit Final Evaluation
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </div>
    );
}