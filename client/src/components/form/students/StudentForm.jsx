import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authService, evaluationService } from '../../../services/api'
import { Loader2, CheckCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// --- HELPER COMPONENTS (Moved Outside) ---

const InputField = ({ label, name, value, onChange, error, type = 'text', placeholder, required, className, ...props }) => (
    <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={className || `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                ${error
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
            placeholder={placeholder}
            {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500 font-medium">⚠ {error}</p>}
    </div>
)

const SelectField = ({ label, name, value, onChange, error, options, required }) => (
    <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Select
            value={value}
            onValueChange={(val) => onChange({ target: { name, value: val } })}
        >
            <SelectTrigger
                className={cn(
                    "w-full h-[52px] px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-base",
                    error
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                )}
            >
                <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {error && <p className="mt-1 text-sm text-red-500 font-medium">⚠ {error}</p>}
    </div>
)

function StudentForm({ onSubmit }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Page 1: Student Details
        fullName: '',
        studentId: '',
        program: '',
        currentSemester: '',

        // Page 2: Request Type
        serviceCategory: '',

        // Page 3: Logic Branching Fields
        // Add/Drop Course
        courseCode: '',
        courseName: '',
        action: '',

        // Deferment of Study
        defermentReason: '',
        resumingSemester: '',
        supportingDocument: null,

        // Extension of Study
        currentEndDate: '',
        requestedNewEndDate: '',
        ganttChart: null,

        // Withdrawal
        effectiveDate: '',
        withdrawalReason: '',
        clearanceForm: null,

        // Page 4: Declaration
        signature: '',
        submissionDate: new Date().toISOString().split('T')[0]
    })

    const [errors, setErrors] = useState({})
    const [isSearching, setIsSearching] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)
    const canvasRef = useRef(null)
    const contextRef = useRef(null)

    // 1. Pre-fill form with logged-in student's data
    useEffect(() => {
        const prefillData = async () => {
            try {
                const res = await authService.me();
                if (res && res.data) {
                    const student = res.data;
                    setFormData(prev => ({
                        ...prev,
                        fullName: student.name || `${student.FirstName} ${student.LastName}`,
                        studentId: student.stu_id || student.id || '',
                        program: student.program_name || student.program || '',
                        currentSemester: student.Semester || student.current_semester || ''
                    }));
                }
            } catch (err) {
                console.error("Failed to pre-fill student data:", err);
            }
        };
        prefillData();
    }, []);

    // 2. Field locking logic for auto-populated data
    const isPrefilled = !!formData.fullName && !!formData.studentId;

    const steps = [
        { number: 1, label: 'Student Info' },
        { number: 2, label: 'Form Type' },
        { number: 3, label: 'Details' },
        { number: 4, label: 'Declaration' }
    ]

    // Initialize canvas for signature
    useEffect(() => {
        if (currentStep === 4 && canvasRef.current) {
            const canvas = canvasRef.current
            const ratio = window.devicePixelRatio || 1
            const rect = canvas.getBoundingClientRect()

            canvas.width = rect.width * ratio
            canvas.height = rect.height * ratio
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`

            const context = canvas.getContext('2d')
            context.scale(ratio, ratio)
            context.lineCap = 'round'
            context.strokeStyle = '#002147'
            context.lineWidth = 2
            contextRef.current = context
        }
    }, [currentStep])

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }))
        } else {
            let newValue = value;
            if (name === 'currentSemester') {
                const numValue = parseInt(value, 10);
                if (numValue > 10) {
                    setErrors(prev => ({ ...prev, currentSemester: 'Semester cannot exceed 10' }));
                } else if (errors.currentSemester === 'Semester cannot exceed 10') {
                    setErrors(prev => ({ ...prev, currentSemester: '' }));
                }
            }

            if (name === 'signature') {
                newValue = value.toUpperCase();
            }
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }))
        }

        if (errors[name] && name !== 'currentSemester') {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
            if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required'
            if (!formData.program) newErrors.program = 'Program is required'
            if (!formData.currentSemester) {
                newErrors.currentSemester = 'Current semester is required'
            } else if (parseInt(formData.currentSemester, 10) > 10) {
                newErrors.currentSemester = 'Semester cannot exceed 10'
            }
        }

        if (step === 2) {
            if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required'
        }

        if (step === 3) {
            if (formData.serviceCategory === 'Add/Drop Course') {
                if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required'
                if (!formData.courseName.trim()) newErrors.courseName = 'Course name is required'
                if (!formData.action) newErrors.action = 'Please select an action'
            }

            if (formData.serviceCategory === 'Deferment of Study') {
                if (!formData.defermentReason.trim()) newErrors.defermentReason = 'Reason is required'
                if (!formData.resumingSemester.trim()) newErrors.resumingSemester = 'Resuming semester is required'
            }

            if (formData.serviceCategory === 'Extension of Study') {
                if (!formData.currentEndDate) newErrors.currentEndDate = 'Current end date is required'
                if (!formData.requestedNewEndDate) newErrors.requestedNewEndDate = 'New end date is required'
            }

            if (formData.serviceCategory === 'Withdrawal from University') {
                if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required'
                if (!formData.withdrawalReason) newErrors.withdrawalReason = 'Reason is required'
            }
        }

        if (step === 4) {
            if (!formData.signature.trim()) newErrors.signature = 'Signature (your name) is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4))
        }
    }

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = () => {
        if (validateStep(4)) {
            onSubmit(formData)
        }
    }

    // Signature functions
    const getCoordinates = (event) => {
        if (!canvasRef.current) return { x: 0, y: 0 }
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        let clientX = event.clientX
        let clientY = event.clientY
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const startDrawing = (e) => {
        e.preventDefault()
        const { x, y } = getCoordinates(e)
        if (contextRef.current) {
            contextRef.current.beginPath()
            contextRef.current.moveTo(x, y)
            setIsDrawing(true)
        }
    }

    const draw = (e) => {
        e.preventDefault()
        if (!isDrawing || !contextRef.current) return
        const { x, y } = getCoordinates(e)
        contextRef.current.lineTo(x, y)
        contextRef.current.stroke()
    }

    const stopDrawing = (e) => {
        if (e) e.preventDefault()
        if (contextRef.current) {
            contextRef.current.closePath()
        }
        setIsDrawing(false)
        if (canvasRef.current) {
            setFormData(prev => ({
                ...prev,
                signature: canvasRef.current.toDataURL()
            }))
        }
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        const context = contextRef.current
        context.clearRect(0, 0, canvas.width, canvas.height)
        setFormData(prev => ({ ...prev, signature: '' }))
    }

    // Render Steps
    const renderPage1 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Student Information
            </h2>
            <div className="relative">
                <InputField
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    error={errors.studentId}
                    placeholder="Student ID"
                    required
                    readOnly={isPrefilled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none shadow-sm
                        ${isPrefilled ? 'border-slate-100 bg-slate-50 text-slate-500 font-bold' : 'border-slate-200 bg-slate-50'}`}
                />
            </div>

            <div className="relative">
                <InputField
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={errors.fullName}
                    placeholder="Full Name"
                    required
                    readOnly={isPrefilled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none shadow-sm
                        ${isPrefilled ? 'border-green-100 bg-green-50/20 text-green-700 font-bold' : 'border-slate-200 bg-slate-50'}`}
                />
                {isPrefilled && (
                    <div className="absolute right-4 top-[42px] text-green-600 flex items-center gap-1 font-bold text-xs bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                        <CheckCircle className="w-4 h-4" /> Verified
                    </div>
                )}
            </div>

            <div className="relative">
                <InputField
                    label="Program"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    error={errors.program}
                    placeholder="Program Information"
                    required
                    readOnly={isPrefilled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none shadow-sm
                        ${isPrefilled ? 'border-slate-100 bg-slate-50 text-slate-500 font-bold' : 'border-slate-200 bg-slate-50'}`}
                />
            </div>
            <InputField
                label="Current Semester"
                name="currentSemester"
                type="number"
                value={formData.currentSemester}
                onChange={handleInputChange}
                error={errors.currentSemester}
                placeholder="e.g., 3"
                required
                min="1"
                max="10"
            />
        </div>
    )

    const renderPage2 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Select Form
            </h2>
            <SelectField
                label="Form Category"
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleInputChange}
                error={errors.serviceCategory}
                required
                options={[
                    { value: "Add/Drop Course", label: "Add/Drop Course" },
                    { value: "Deferment of Study", label: "Deferment of Study" },
                    { value: "Extension of Study", label: "Extension of Study" },
                    { value: "Withdrawal from University", label: "Withdrawal from University" }
                ]}
            />
        </div>
    )

    const renderPage3 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Form Details
            </h2>

            {!formData.serviceCategory && (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p>Please go back and select a form category.</p>
                </div>
            )}

            {formData.serviceCategory === 'Add/Drop Course' && (
                <>
                    <InputField
                        label="Course Code"
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleInputChange}
                        error={errors.courseCode}
                        placeholder="e.g., CS503"
                        required
                    />
                    <InputField
                        label="Course Name"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleInputChange}
                        error={errors.courseName}
                        placeholder="Enter course name"
                        required
                    />
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Action <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Add', 'Drop'].map((actionOption) => (
                                <label key={actionOption} className={`
                                    cursor-pointer border-2 rounded-xl p-4 text-center transition-all
                                    ${formData.action === actionOption
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-blue-100 shadow-inner'
                                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                                    }
                                `}>
                                    <input
                                        type="radio"
                                        name="action"
                                        value={actionOption}
                                        checked={formData.action === actionOption}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <span className="font-medium">{actionOption}</span>
                                </label>
                            ))}
                        </div>
                        {errors.action && <p className="mt-1 text-sm text-red-500 font-medium">⚠ {errors.action}</p>}
                    </div>
                </>
            )}

            {formData.serviceCategory === 'Deferment of Study' && (
                <>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Deferment <span className="text-red-500">*</span></label>
                        <textarea
                            name="defermentReason"
                            value={formData.defermentReason}
                            onChange={handleInputChange}
                            rows="4"
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none resize-none
                                ${errors.defermentReason
                                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'
                                }`}
                            placeholder="Provide detailed reason..."
                        />
                        {errors.defermentReason && <p className="mt-1 text-sm text-red-500 font-medium">⚠ {errors.defermentReason}</p>}
                    </div>
                    <InputField
                        label="Resuming Semester"
                        name="resumingSemester"
                        value={formData.resumingSemester}
                        onChange={handleInputChange}
                        error={errors.resumingSemester}
                        required
                    />
                </>
            )}

            {formData.serviceCategory === 'Extension of Study' && (
                <>
                    <InputField
                        label="Current End Date"
                        name="currentEndDate"
                        type="date"
                        value={formData.currentEndDate}
                        onChange={handleInputChange}
                        error={errors.currentEndDate}
                        required
                    />
                    <InputField
                        label="Requested New End Date"
                        name="requestedNewEndDate"
                        type="date"
                        value={formData.requestedNewEndDate}
                        onChange={handleInputChange}
                        error={errors.requestedNewEndDate}
                        required
                    />
                </>
            )}

            {formData.serviceCategory === 'Withdrawal from University' && (
                <>
                    <InputField
                        label="Effective Date"
                        name="effectiveDate"
                        type="date"
                        value={formData.effectiveDate}
                        onChange={handleInputChange}
                        error={errors.effectiveDate}
                        required
                    />
                    <SelectField
                        label="Withdrawal Reason"
                        name="withdrawalReason"
                        value={formData.withdrawalReason}
                        onChange={handleInputChange}
                        error={errors.withdrawalReason}
                        required
                        options={[
                            { value: "Financial", label: "Financial" },
                            { value: "Medical", label: "Medical" },
                            { value: "Personal", label: "Personal" },
                            { value: "Academic", label: "Academic" },
                            { value: "Other", label: "Other" }
                        ]}
                    />
                </>
            )}
        </div>
    )

    const renderPage4 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                Declaration
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
                <p className="text-blue-800 text-sm leading-relaxed font-medium">
                    I hereby certify that the information provided in this form is true, correct, and complete to the best of my knowledge. I understand that any false statement may be grounds for rejection.
                </p>
            </div>

            <InputField
                label="Signature (Write your full name)"
                name="signature"
                value={formData.signature}
                onChange={handleInputChange}
                error={errors.signature}
                placeholder="Enter your full name as signature"
                required
            />

            <InputField
                label="Date of Submission"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleInputChange}
                readOnly
            />
        </div>
    )

    const renderCurrentPage = () => {
        switch (currentStep) {
            case 1: return renderPage1()
            case 2: return renderPage2()
            case 3: return renderPage3()
            case 4: return renderPage4()
            default: return null
        }
    }

    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

    return (
        <div className="w-full">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 md:p-8 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 relative z-10">PG-Forms Portal</h1>
                <p className="text-blue-100 font-medium relative z-10 text-lg">Postgraduate Student Services</p>
            </div>

            <div className="bg-white overflow-hidden">
                {/* Stepper */}
                <div className="bg-slate-50 border-b border-slate-100 p-8">
                    <div className="relative flex items-center justify-between max-w-2xl mx-auto z-0">
                        {/* Progress Line Background */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded"></div>
                        {/* Progress Line Active */}
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded transition-all duration-500 ease-in-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>

                        {steps.map((step) => {
                            const isCompleted = currentStep > step.number;
                            const isActive = currentStep === step.number;
                            return (
                                <div key={step.number} className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                                        ${isCompleted ? 'bg-blue-600 text-white scale-110 shadow-blue-200' :
                                            isActive ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-100' :
                                                'bg-white border-2 border-slate-200 text-slate-400'}
                                    `}>
                                        {isCompleted ? '✓' : step.number}
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 md:p-12">
                    {renderCurrentPage()}
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-xl font-bold transition-all
                            ${currentStep === 1
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}
                        `}
                    >
                        ← Back
                    </button>

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-8 py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            Submit 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudentForm;
