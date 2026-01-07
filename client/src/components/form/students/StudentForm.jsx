import { useState, useRef, useEffect } from 'react'
import '@/user/App.css'

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
    const [isDrawing, setIsDrawing] = useState(false)
    const canvasRef = useRef(null)
    const contextRef = useRef(null)

    const steps = [
        { number: 1, label: 'Student Info' },
        { number: 2, label: 'Service Type' },
        { number: 3, label: 'Details' },
        { number: 4, label: 'Declaration' }
    ]

    // Initialize canvas for signature
    useEffect(() => {
        if (currentStep === 4 && canvasRef.current) {
            const canvas = canvasRef.current
            // Handle high DPI screens
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
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
            if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required'
            else if (!/^AIU\s\d{8}$/.test(formData.studentId)) newErrors.studentId = 'Format: AIU 12345678'
            if (!formData.program) newErrors.program = 'Program is required'
            if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required'
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
            if (!formData.signature) newErrors.signature = 'Digital signature is required'
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

        // Handle both mouse and touch events
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
        e.preventDefault() // Prevent scrolling on touch
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

    const renderPage1 = () => (
        <div className="form-page">
            <h2 className="page-title">Student Information</h2>

            <div className="form-group">
                <label className="form-label required">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                />
                {errors.fullName && <div className="error-message">⚠ {errors.fullName}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Student ID</label>
                <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={`form-input ${errors.studentId ? 'error' : ''}`}
                    placeholder="AIU 12345678"
                />
                {errors.studentId && <div className="error-message">⚠ {errors.studentId}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Program</label>
                <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className={`form-select ${errors.program ? 'error' : ''}`}
                >
                    <option value="">Select your program</option>
                    <option value="Master of Business Management (by Research)">Master of Business Management (by Research)</option>
                    <option value="Master of Education (by Research)">Master of Education (by Research)</option>
                    <option value="Master in Social Business - (by Coursework)">Master in Social Business - (by Coursework)</option>
                    <option value="Doctor of Philosophy (Education)">Doctor of Philosophy (Education)</option>
                    <option value="Doctor of Philosophy (Business Management)">Doctor of Philosophy (Business Management)</option>
                </select>
                {errors.program && <div className="error-message">⚠ {errors.program}</div>}
            </div>

            <div className="form-group">
                <label className="form-label required">Current Semester</label>
                <input
                    type="number"
                    name="currentSemester"
                    value={formData.currentSemester}
                    onChange={handleInputChange}
                    className={`form-input ${errors.currentSemester ? 'error' : ''}`}
                    placeholder="e.g., 3"
                    min="1"
                />
                {errors.currentSemester && <div className="error-message">⚠ {errors.currentSemester}</div>}
            </div>
        </div>
    )

    const renderPage2 = () => (
        <div className="form-page">
            <h2 className="page-title">Select Service</h2>

            <div className="form-group">
                <label className="form-label required">Service Category</label>
                <select
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    className={`form-select ${errors.serviceCategory ? 'error' : ''}`}
                >
                    <option value="">Select a service</option>
                    <option value="Add/Drop Course">Add/Drop Course</option>
                    <option value="Deferment of Study">Deferment of Study</option>
                    <option value="Extension of Study">Extension of Study</option>
                    <option value="Withdrawal from University">Withdrawal from University</option>
                </select>
                {errors.serviceCategory && <div className="error-message">⚠ {errors.serviceCategory}</div>}
            </div>
        </div>
    )

    const renderPage3 = () => (
        <div className="form-page">
            <h2 className="page-title">Service Details</h2>

            {formData.serviceCategory === 'Add/Drop Course' && (
                <>
                    <div className="form-group">
                        <label className="form-label required">Course Code</label>
                        <input
                            type="text"
                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleInputChange}
                            className={`form-input ${errors.courseCode ? 'error' : ''}`}
                            placeholder="e.g., CS503"
                        />
                        {errors.courseCode && <div className="error-message">⚠ {errors.courseCode}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Course Name</label>
                        <input
                            type="text"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleInputChange}
                            className={`form-input ${errors.courseName ? 'error' : ''}`}
                            placeholder="Enter course name"
                        />
                        {errors.courseName && <div className="error-message">⚠ {errors.courseName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Action</label>
                        <div className="radio-group">
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="action-add"
                                    name="action"
                                    value="Add"
                                    checked={formData.action === 'Add'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="action-add" className="radio-label">
                                    <div className="radio-custom"></div>
                                    <span>Add</span>
                                </label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="action-drop"
                                    name="action"
                                    value="Drop"
                                    checked={formData.action === 'Drop'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="action-drop" className="radio-label">
                                    <div className="radio-custom"></div>
                                    <span>Drop</span>
                                </label>
                            </div>
                        </div>
                        {errors.action && <div className="error-message">⚠ {errors.action}</div>}
                    </div>
                </>
            )}

            {formData.serviceCategory === 'Deferment of Study' && (
                <>
                    <div className="form-group">
                        <label className="form-label required">Reason for Deferment</label>
                        <textarea
                            name="defermentReason"
                            value={formData.defermentReason}
                            onChange={handleInputChange}
                            className={`form-textarea ${errors.defermentReason ? 'error' : ''}`}
                            placeholder="Please provide detailed reason for deferment"
                        />
                        {errors.defermentReason && <div className="error-message">⚠ {errors.defermentReason}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Resuming Semester</label>
                        <input
                            type="text"
                            name="resumingSemester"
                            value={formData.resumingSemester}
                            onChange={handleInputChange}
                            className={`form-input ${errors.resumingSemester ? 'error' : ''}`}
                        />
                        {errors.resumingSemester && <div className="error-message">⚠ {errors.resumingSemester}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Medical/Personal Letter</label>
                        <div className="file-upload">
                            <input
                                type="file"
                                id="supportingDocument"
                                name="supportingDocument"
                                onChange={handleInputChange}
                                className="file-upload-input"
                                accept=".pdf,.doc,.docx"
                            />
                            <label htmlFor="supportingDocument" className="file-upload-label">
                                <div className="file-upload-icon">📄</div>
                                <span>{formData.supportingDocument ? formData.supportingDocument.name : 'Click to upload document'}</span>
                            </label>
                        </div>
                    </div>
                </>
            )}

            {formData.serviceCategory === 'Extension of Study' && (
                <>
                    <div className="form-group">
                        <label className="form-label required">Current End Date</label>
                        <input
                            type="date"
                            name="currentEndDate"
                            value={formData.currentEndDate}
                            onChange={handleInputChange}
                            className={`form-input ${errors.currentEndDate ? 'error' : ''}`}
                        />
                        {errors.currentEndDate && <div className="error-message">⚠ {errors.currentEndDate}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Requested New End Date</label>
                        <input
                            type="date"
                            name="requestedNewEndDate"
                            value={formData.requestedNewEndDate}
                            onChange={handleInputChange}
                            className={`form-input ${errors.requestedNewEndDate ? 'error' : ''}`}
                        />
                        {errors.requestedNewEndDate && <div className="error-message">⚠ {errors.requestedNewEndDate}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Gantt Chart/Progress Report</label>
                        <div className="file-upload">
                            <input
                                type="file"
                                id="ganttChart"
                                name="ganttChart"
                                onChange={handleInputChange}
                                className="file-upload-input"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                            />
                            <label htmlFor="ganttChart" className="file-upload-label">
                                <div className="file-upload-icon">📊</div>
                                <span>{formData.ganttChart ? formData.ganttChart.name : 'Click to upload Gantt chart or progress report'}</span>
                            </label>
                        </div>
                    </div>
                </>
            )}

            {formData.serviceCategory === 'Withdrawal from University' && (
                <>
                    <div className="form-group">
                        <label className="form-label required">Effective Date</label>
                        <input
                            type="date"
                            name="effectiveDate"
                            value={formData.effectiveDate}
                            onChange={handleInputChange}
                            className={`form-input ${errors.effectiveDate ? 'error' : ''}`}
                        />
                        {errors.effectiveDate && <div className="error-message">⚠ {errors.effectiveDate}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Withdrawal Reason</label>
                        <select
                            name="withdrawalReason"
                            value={formData.withdrawalReason}
                            onChange={handleInputChange}
                            className={`form-select ${errors.withdrawalReason ? 'error' : ''}`}
                        >
                            <option value="">Select a reason</option>
                            <option value="Financial">Financial</option>
                            <option value="Medical">Medical</option>
                            <option value="Personal">Personal</option>
                            <option value="Academic">Academic</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.withdrawalReason && <div className="error-message">⚠ {errors.withdrawalReason}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Clearance Form</label>
                        <div className="file-upload">
                            <input
                                type="file"
                                id="clearanceForm"
                                name="clearanceForm"
                                onChange={handleInputChange}
                                className="file-upload-input"
                                accept=".pdf,.doc,.docx"
                            />
                            <label htmlFor="clearanceForm" className="file-upload-label">
                                <div className="file-upload-icon">📋</div>
                                <span>{formData.clearanceForm ? formData.clearanceForm.name : 'Click to upload clearance form'}</span>
                            </label>
                        </div>
                    </div>
                </>
            )}

            {!formData.serviceCategory && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <p>Please select a service category from the previous step</p>
                </div>
            )}
        </div>
    )

    const renderPage4 = () => (
        <div className="form-page">
            <h2 className="page-title">Declaration</h2>

            <div className="declaration-text">
                I hereby certify that the information provided is true and accurate to the best of my knowledge.
            </div>

            <div className="form-group">
                <label className="form-label required">Digital Signature</label>
                <div className="signature-container">
                    <canvas
                        ref={canvasRef}
                        className="signature-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    <div className="signature-controls">
                        <button type="button" onClick={clearSignature} className="btn-clear">
                            Clear Signature
                        </button>
                    </div>
                </div>
                {errors.signature && <div className="error-message">⚠ {errors.signature}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Date of Submission</label>
                <input
                    type="date"
                    name="submissionDate"
                    value={formData.submissionDate}
                    readOnly
                    className="form-input"
                />
            </div>
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
        <div className="form-container">
            <div className="form-header">
                <h1>Postgraduate Service Request Form</h1>
                <p>Student Service Module</p>
            </div>

            <div className="progress-container">
                <div className="progress-steps">
                    <div className="progress-line">
                        <div
                            className="progress-line-fill"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {steps.map((step) => (
                        <div key={step.number} className="progress-step">
                            <div className={`step-circle ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                                {currentStep > step.number ? '✓' : step.number}
                            </div>
                            <div className={`step-label ${currentStep === step.number ? 'active' : ''}`}>
                                {step.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-body">
                {renderCurrentPage()}
            </div>

            <div className="form-actions">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="btn btn-secondary"
                >
                    <span>← Previous</span>
                </button>

                {currentStep < 4 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="btn btn-primary"
                    >
                        <span>Next →</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-primary"
                    >
                        <span>Submit to Supervisor</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default StudentForm
