// import { useState, useRef, useEffect } from 'react'
// import '@/user/App.css'

// function StudentForm({ onSubmit }) {
//     const [currentStep, setCurrentStep] = useState(1)
//     const [formData, setFormData] = useState({
//         // Page 1: Student Details
//         fullName: '',
//         studentId: '',
//         program: '',
//         currentSemester: '',

//         // Page 2: Request Type
//         serviceCategory: '',

//         // Page 3: Logic Branching Fields
//         // Add/Drop Course
//         courseCode: '',
//         courseName: '',
//         action: '',

//         // Deferment of Study
//         defermentReason: '',
//         resumingSemester: '',
//         supportingDocument: null,

//         // Extension of Study
//         currentEndDate: '',
//         requestedNewEndDate: '',
//         ganttChart: null,

//         // Withdrawal
//         effectiveDate: '',
//         withdrawalReason: '',
//         clearanceForm: null,

//         // Page 4: Declaration
//         signature: '',
//         submissionDate: new Date().toISOString().split('T')[0]
//     })

//     const [errors, setErrors] = useState({})
//     const [isDrawing, setIsDrawing] = useState(false)
//     const canvasRef = useRef(null)
//     const contextRef = useRef(null)

//     const steps = [
//         { number: 1, label: 'Student Info' },
//         { number: 2, label: 'Service Type' },
//         { number: 3, label: 'Details' },
//         { number: 4, label: 'Declaration' }
//     ]

//     // Initialize canvas for signature
//     useEffect(() => {
//         if (currentStep === 4 && canvasRef.current) {
//             const canvas = canvasRef.current
//             // Handle high DPI screens
//             const ratio = window.devicePixelRatio || 1
//             const rect = canvas.getBoundingClientRect()

//             canvas.width = rect.width * ratio
//             canvas.height = rect.height * ratio
//             canvas.style.width = `${rect.width}px`
//             canvas.style.height = `${rect.height}px`

//             const context = canvas.getContext('2d')
//             context.scale(ratio, ratio)
//             context.lineCap = 'round'
//             context.strokeStyle = '#002147'
//             context.lineWidth = 2
//             contextRef.current = context
//         }
//     }, [currentStep])

//     const handleInputChange = (e) => {
//         const { name, value, type, files } = e.target

//         if (type === 'file') {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: files[0]
//             }))
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value
//             }))
//         }

//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }))
//         }
//     }

//     const validateStep = (step) => {
//         const newErrors = {}

//         if (step === 1) {
//             if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
//             if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required'
//             else if (!/^AIU\s\d{8}$/.test(formData.studentId)) newErrors.studentId = 'Format: AIU 12345678'
//             if (!formData.program) newErrors.program = 'Program is required'
//             if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required'
//         }

//         if (step === 2) {
//             if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required'
//         }

//         if (step === 3) {
//             if (formData.serviceCategory === 'Add/Drop Course') {
//                 if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required'
//                 if (!formData.courseName.trim()) newErrors.courseName = 'Course name is required'
//                 if (!formData.action) newErrors.action = 'Please select an action'
//             }

//             if (formData.serviceCategory === 'Deferment of Study') {
//                 if (!formData.defermentReason.trim()) newErrors.defermentReason = 'Reason is required'
//                 if (!formData.resumingSemester.trim()) newErrors.resumingSemester = 'Resuming semester is required'
//             }

//             if (formData.serviceCategory === 'Extension of Study') {
//                 if (!formData.currentEndDate) newErrors.currentEndDate = 'Current end date is required'
//                 if (!formData.requestedNewEndDate) newErrors.requestedNewEndDate = 'New end date is required'
//             }

//             if (formData.serviceCategory === 'Withdrawal from University') {
//                 if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required'
//                 if (!formData.withdrawalReason) newErrors.withdrawalReason = 'Reason is required'
//             }
//         }

//         if (step === 4) {
//             if (!formData.signature) newErrors.signature = 'Digital signature is required'
//         }

//         setErrors(newErrors)
//         return Object.keys(newErrors).length === 0
//     }

//     const handleNext = () => {
//         if (validateStep(currentStep)) {
//             setCurrentStep(prev => Math.min(prev + 1, 4))
//         }
//     }

//     const handlePrevious = () => {
//         setCurrentStep(prev => Math.max(prev - 1, 1))
//     }

//     const handleSubmit = () => {
//         if (validateStep(4)) {
//             onSubmit(formData)
//         }
//     }

//     // Signature functions
//     const getCoordinates = (event) => {
//         if (!canvasRef.current) return { x: 0, y: 0 }

//         const canvas = canvasRef.current
//         const rect = canvas.getBoundingClientRect()

//         // Handle both mouse and touch events
//         let clientX = event.clientX
//         let clientY = event.clientY

//         if (event.touches && event.touches.length > 0) {
//             clientX = event.touches[0].clientX
//             clientY = event.touches[0].clientY
//         }

//         return {
//             x: clientX - rect.left,
//             y: clientY - rect.top
//         }
//     }

//     const startDrawing = (e) => {
//         e.preventDefault() // Prevent scrolling on touch
//         const { x, y } = getCoordinates(e)
//         if (contextRef.current) {
//             contextRef.current.beginPath()
//             contextRef.current.moveTo(x, y)
//             setIsDrawing(true)
//         }
//     }

//     const draw = (e) => {
//         e.preventDefault()
//         if (!isDrawing || !contextRef.current) return
//         const { x, y } = getCoordinates(e)
//         contextRef.current.lineTo(x, y)
//         contextRef.current.stroke()
//     }

//     const stopDrawing = (e) => {
//         if (e) e.preventDefault()
//         if (contextRef.current) {
//             contextRef.current.closePath()
//         }
//         setIsDrawing(false)

//         if (canvasRef.current) {
//             setFormData(prev => ({
//                 ...prev,
//                 signature: canvasRef.current.toDataURL()
//             }))
//         }
//     }

//     const clearSignature = () => {
//         const canvas = canvasRef.current
//         const context = contextRef.current
//         context.clearRect(0, 0, canvas.width, canvas.height)
//         setFormData(prev => ({ ...prev, signature: '' }))
//     }

//     const renderPage1 = () => (
//         <div className="form-page">
//             <h2 className="page-title">Student Information</h2>

//             <div className="form-group">
//                 <label className="form-label required">Full Name</label>
//                 <input
//                     type="text"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleInputChange}
//                     className={`form-input ${errors.fullName ? 'error' : ''}`}
//                     placeholder="Enter your full name"
//                 />
//                 {errors.fullName && <div className="error-message">⚠ {errors.fullName}</div>}
//             </div>

//             <div className="form-group">
//                 <label className="form-label required">Student ID</label>
//                 <input
//                     type="text"
//                     name="studentId"
//                     value={formData.studentId}
//                     onChange={handleInputChange}
//                     className={`form-input ${errors.studentId ? 'error' : ''}`}
//                     placeholder="AIU 12345678"
//                 />
//                 {errors.studentId && <div className="error-message">⚠ {errors.studentId}</div>}
//             </div>

//             <div className="form-group">
//                 <label className="form-label required">Program</label>
//                 <select
//                     name="program"
//                     value={formData.program}
//                     onChange={handleInputChange}
//                     className={`form-select ${errors.program ? 'error' : ''}`}
//                 >
//                     <option value="">Select your program</option>
//                     <option value="Master of Business Management (by Research)">Master of Business Management (by Research)</option>
//                     <option value="Master of Education (by Research)">Master of Education (by Research)</option>
//                     <option value="Master in Social Business - (by Coursework)">Master in Social Business - (by Coursework)</option>
//                     <option value="Doctor of Philosophy (Education)">Doctor of Philosophy (Education)</option>
//                     <option value="Doctor of Philosophy (Business Management)">Doctor of Philosophy (Business Management)</option>
//                 </select>
//                 {errors.program && <div className="error-message">⚠ {errors.program}</div>}
//             </div>

//             <div className="form-group">
//                 <label className="form-label required">Current Semester</label>
//                 <input
//                     type="number"
//                     name="currentSemester"
//                     value={formData.currentSemester}
//                     onChange={handleInputChange}
//                     className={`form-input ${errors.currentSemester ? 'error' : ''}`}
//                     placeholder="e.g., 3"
//                     min="1"
//                 />
//                 {errors.currentSemester && <div className="error-message">⚠ {errors.currentSemester}</div>}
//             </div>
//         </div>
//     )

//     const renderPage2 = () => (
//         <div className="form-page">
//             <h2 className="page-title">Select Service</h2>

//             <div className="form-group">
//                 <label className="form-label required">Service Category</label>
//                 <select
//                     name="serviceCategory"
//                     value={formData.serviceCategory}
//                     onChange={handleInputChange}
//                     className={`form-select ${errors.serviceCategory ? 'error' : ''}`}
//                 >
//                     <option value="">Select a service</option>
//                     <option value="Add/Drop Course">Add/Drop Course</option>
//                     <option value="Deferment of Study">Deferment of Study</option>
//                     <option value="Extension of Study">Extension of Study</option>
//                     <option value="Withdrawal from University">Withdrawal from University</option>
//                 </select>
//                 {errors.serviceCategory && <div className="error-message">⚠ {errors.serviceCategory}</div>}
//             </div>
//         </div>
//     )

//     const renderPage3 = () => (
//         <div className="form-page">
//             <h2 className="page-title">Service Details</h2>

//             {formData.serviceCategory === 'Add/Drop Course' && (
//                 <>
//                     <div className="form-group">
//                         <label className="form-label required">Course Code</label>
//                         <input
//                             type="text"
//                             name="courseCode"
//                             value={formData.courseCode}
//                             onChange={handleInputChange}
//                             className={`form-input ${errors.courseCode ? 'error' : ''}`}
//                             placeholder="e.g., CS503"
//                         />
//                         {errors.courseCode && <div className="error-message">⚠ {errors.courseCode}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label required">Course Name</label>
//                         <input
//                             type="text"
//                             name="courseName"
//                             value={formData.courseName}
//                             onChange={handleInputChange}
//                             className={`form-input ${errors.courseName ? 'error' : ''}`}
//                             placeholder="Enter course name"
//                         />
//                         {errors.courseName && <div className="error-message">⚠ {errors.courseName}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label required">Action</label>
//                         <div className="radio-group">
//                             <div className="radio-option">
//                                 <input
//                                     type="radio"
//                                     id="action-add"
//                                     name="action"
//                                     value="Add"
//                                     checked={formData.action === 'Add'}
//                                     onChange={handleInputChange}
//                                 />
//                                 <label htmlFor="action-add" className="radio-label">
//                                     <div className="radio-custom"></div>
//                                     <span>Add</span>
//                                 </label>
//                             </div>
//                             <div className="radio-option">
//                                 <input
//                                     type="radio"
//                                     id="action-drop"
//                                     name="action"
//                                     value="Drop"
//                                     checked={formData.action === 'Drop'}
//                                     onChange={handleInputChange}
//                                 />
//                                 <label htmlFor="action-drop" className="radio-label">
//                                     <div className="radio-custom"></div>
//                                     <span>Drop</span>
//                                 </label>
//                             </div>
//                         </div>
//                         {errors.action && <div className="error-message">⚠ {errors.action}</div>}
//                     </div>
//                 </>
//             )}

//             {formData.serviceCategory === 'Deferment of Study' && (
//                 <>
//                     <div className="form-group">
//                         <label className="form-label required">Reason for Deferment</label>
//                         <textarea
//                             name="defermentReason"
//                             value={formData.defermentReason}
//                             onChange={handleInputChange}
//                             className={`form-textarea ${errors.defermentReason ? 'error' : ''}`}
//                             placeholder="Please provide detailed reason for deferment"
//                         />
//                         {errors.defermentReason && <div className="error-message">⚠ {errors.defermentReason}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label required">Resuming Semester</label>
//                         <input
//                             type="text"
//                             name="resumingSemester"
//                             value={formData.resumingSemester}
//                             onChange={handleInputChange}
//                             className={`form-input ${errors.resumingSemester ? 'error' : ''}`}
//                         />
//                         {errors.resumingSemester && <div className="error-message">⚠ {errors.resumingSemester}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Upload Medical/Personal Letter</label>
//                         <div className="file-upload">
//                             <input
//                                 type="file"
//                                 id="supportingDocument"
//                                 name="supportingDocument"
//                                 onChange={handleInputChange}
//                                 className="file-upload-input"
//                                 accept=".pdf,.doc,.docx"
//                             />
//                             <label htmlFor="supportingDocument" className="file-upload-label">
//                                 <div className="file-upload-icon">📄</div>
//                                 <span>{formData.supportingDocument ? formData.supportingDocument.name : 'Click to upload document'}</span>
//                             </label>
//                         </div>
//                     </div>
//                 </>
//             )}

//             {formData.serviceCategory === 'Extension of Study' && (
//                 <>
//                     <div className="form-group">
//                         <label className="form-label required">Current End Date</label>
//                         <input
//                             type="date"
//                             name="currentEndDate"
//                             value={formData.currentEndDate}
//                             onChange={handleInputChange}
//                             className={`form-input ${errors.currentEndDate ? 'error' : ''}`}
//                         />
//                         {errors.currentEndDate && <div className="error-message">⚠ {errors.currentEndDate}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label required">Requested New End Date</label>
//                         <input
//                             type="date"
//                             name="requestedNewEndDate"
//                             value={formData.requestedNewEndDate}
//                             onChange={handleInputChange}
//                             className={`form-input ${errors.requestedNewEndDate ? 'error' : ''}`}
//                         />
//                         {errors.requestedNewEndDate && <div className="error-message">⚠ {errors.requestedNewEndDate}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Gantt Chart/Progress Report</label>
//                         <div className="file-upload">
//                             <input
//                                 type="file"
//                                 id="ganttChart"
//                                 name="ganttChart"
//                                 onChange={handleInputChange}
//                                 className="file-upload-input"
//                                 accept=".pdf,.doc,.docx,.xls,.xlsx"
//                             />
//                             <label htmlFor="ganttChart" className="file-upload-label">
//                                 <div className="file-upload-icon">📊</div>
//                                 <span>{formData.ganttChart ? formData.ganttChart.name : 'Click to upload Gantt chart or progress report'}</span>
//                             </label>
//                         </div>
//                     </div>
//                 </>
//             )}

//             {formData.serviceCategory === 'Withdrawal from University' && (
//                 <>
//                     <div className="form-group">
//                         <label className="form-label required">Effective Date</label>
//                         <input
//                             type="date"
//                             name="effectiveDate"
//                             value={formData.effectiveDate}
//                             onChange={handleInputChange}
//                             className={`form-input ${errors.effectiveDate ? 'error' : ''}`}
//                         />
//                         {errors.effectiveDate && <div className="error-message">⚠ {errors.effectiveDate}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label required">Withdrawal Reason</label>
//                         <select
//                             name="withdrawalReason"
//                             value={formData.withdrawalReason}
//                             onChange={handleInputChange}
//                             className={`form-select ${errors.withdrawalReason ? 'error' : ''}`}
//                         >
//                             <option value="">Select a reason</option>
//                             <option value="Financial">Financial</option>
//                             <option value="Medical">Medical</option>
//                             <option value="Personal">Personal</option>
//                             <option value="Academic">Academic</option>
//                             <option value="Other">Other</option>
//                         </select>
//                         {errors.withdrawalReason && <div className="error-message">⚠ {errors.withdrawalReason}</div>}
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Clearance Form</label>
//                         <div className="file-upload">
//                             <input
//                                 type="file"
//                                 id="clearanceForm"
//                                 name="clearanceForm"
//                                 onChange={handleInputChange}
//                                 className="file-upload-input"
//                                 accept=".pdf,.doc,.docx"
//                             />
//                             <label htmlFor="clearanceForm" className="file-upload-label">
//                                 <div className="file-upload-icon">📋</div>
//                                 <span>{formData.clearanceForm ? formData.clearanceForm.name : 'Click to upload clearance form'}</span>
//                             </label>
//                         </div>
//                     </div>
//                 </>
//             )}

//             {!formData.serviceCategory && (
//                 <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
//                     <p>Please select a service category from the previous step</p>
//                 </div>
//             )}
//         </div>
//     )

//     const renderPage4 = () => (
//         <div className="form-page">
//             <h2 className="page-title">Declaration</h2>

//             <div className="declaration-text">
//                 I hereby certify that the information provided is true and accurate to the best of my knowledge.
//             </div>

//             <div className="form-group">
//                 <label className="form-label required">Digital Signature</label>
//                 <div className="signature-container">
//                     <canvas
//                         ref={canvasRef}
//                         className="signature-canvas"
//                         onMouseDown={startDrawing}
//                         onMouseMove={draw}
//                         onMouseUp={stopDrawing}
//                         onMouseLeave={stopDrawing}
//                         onTouchStart={startDrawing}
//                         onTouchMove={draw}
//                         onTouchEnd={stopDrawing}
//                     />
//                     <div className="signature-controls">
//                         <button type="button" onClick={clearSignature} className="btn-clear">
//                             Clear Signature
//                         </button>
//                     </div>
//                 </div>
//                 {errors.signature && <div className="error-message">⚠ {errors.signature}</div>}
//             </div>

//             <div className="form-group">
//                 <label className="form-label">Date of Submission</label>
//                 <input
//                     type="date"
//                     name="submissionDate"
//                     value={formData.submissionDate}
//                     readOnly
//                     className="form-input"
//                 />
//             </div>
//         </div>
//     )

//     const renderCurrentPage = () => {
//         switch (currentStep) {
//             case 1: return renderPage1()
//             case 2: return renderPage2()
//             case 3: return renderPage3()
//             case 4: return renderPage4()
//             default: return null
//         }
//     }

//     const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

//     return (
//         <div className="form-container">
//             <div className="form-header">
//                 <h1>Postgraduate Service Request Form</h1>
//                 <p>Student Service Module</p>
//             </div>

//             <div className="progress-container">
//                 <div className="progress-steps">
//                     <div className="progress-line">
//                         <div
//                             className="progress-line-fill"
//                             style={{ width: `${progressPercentage}%` }}
//                         />
//                     </div>
//                     {steps.map((step) => (
//                         <div key={step.number} className="progress-step">
//                             <div className={`step-circle ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
//                                 {currentStep > step.number ? '✓' : step.number}
//                             </div>
//                             <div className={`step-label ${currentStep === step.number ? 'active' : ''}`}>
//                                 {step.label}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="form-body">
//                 {renderCurrentPage()}
//             </div>

//             <div className="form-actions">
//                 <button
//                     type="button"
//                     onClick={handlePrevious}
//                     disabled={currentStep === 1}
//                     className="btn btn-secondary"
//                 >
//                     <span>← Previous</span>
//                 </button>

//                 {currentStep < 4 ? (
//                     <button
//                         type="button"
//                         onClick={handleNext}
//                         className="btn btn-primary"
//                     >
//                         <span>Next →</span>
//                     </button>
//                 ) : (
//                     <button
//                         type="button"
//                         onClick={handleSubmit}
//                         className="btn btn-primary"
//                     >
//                         <span>Submit to Supervisor</span>
//                     </button>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default StudentForm

import { useState } from 'react'

function StudentForm({ onSubmit }) {
    const [currentStep, setCurrentStep] = useState(1)
    
    // Updated formData: Removed 'signature' (image data), added 'declarationName' (text)
    const [formData, setFormData] = useState({
        // Page 1: Student Details
        fullName: '',
        studentId: '',
        program: '',
        currentSemester: '',

        // Page 2: Request Type
        serviceCategory: '',

        // Page 3: Logic Branching Fields
        courseCode: '',
        courseName: '',
        action: '',
        defermentReason: '',
        resumingSemester: '',
        supportingDocument: null,
        currentEndDate: '',
        requestedNewEndDate: '',
        ganttChart: null,
        effectiveDate: '',
        withdrawalReason: '',
        clearanceForm: null,

        // Page 4: Declaration (Simplified)
        declarationName: '', // Replaced signature image
        submissionDate: new Date().toISOString().split('T')[0]
    })

    const [errors, setErrors] = useState({})

    const steps = [
        { number: 1, label: 'Student Info' },
        { number: 2, label: 'Service Type' },
        { number: 3, label: 'Details' },
        { number: 4, label: 'Declaration' }
    ]

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target

        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
            if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required'
            if (!formData.program) newErrors.program = 'Program is required'
            if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required'
        }

        if (step === 2) {
            if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required'
        }

        if (step === 3) {
            // Add/Drop
            if (formData.serviceCategory === 'Add/Drop Course') {
                if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required'
                if (!formData.courseName.trim()) newErrors.courseName = 'Course name is required'
                if (!formData.action) newErrors.action = 'Please select an action'
            }
            // Deferment
            if (formData.serviceCategory === 'Deferment of Study') {
                if (!formData.defermentReason.trim()) newErrors.defermentReason = 'Reason is required'
                if (!formData.resumingSemester.trim()) newErrors.resumingSemester = 'Resuming semester is required'
            }
            // Extension
            if (formData.serviceCategory === 'Extension of Study') {
                if (!formData.currentEndDate) newErrors.currentEndDate = 'Current end date is required'
                if (!formData.requestedNewEndDate) newErrors.requestedNewEndDate = 'New end date is required'
            }
            // Withdrawal
            if (formData.serviceCategory === 'Withdrawal from University') {
                if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required'
                if (!formData.withdrawalReason) newErrors.withdrawalReason = 'Reason is required'
            }
        }

        if (step === 4) {
            // New Validation: Check for name text instead of signature image
            if (!formData.declarationName.trim()) {
                newErrors.declarationName = 'Please type your full name to sign this document'
            } else if (formData.declarationName.toLowerCase() !== formData.fullName.toLowerCase()) {
                newErrors.declarationName = 'Signature name must match Student Full Name'
            }
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

    // --- RENDER HELPERS ---

    const renderField = (label, name, type = 'text', placeholder = '', required = false) => (
        <div style={styles.formGroup}>
            <label style={styles.label}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={handleInputChange}
                placeholder={placeholder}
                style={{
                    ...styles.input,
                    borderColor: errors[name] ? '#dc3545' : '#ccc'
                }}
            />
            {errors[name] && <div style={styles.error}>{errors[name]}</div>}
        </div>
    )

    const renderPage1 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Student Information</h2>
            {renderField('Full Name', 'fullName', 'text', 'Enter your full name', true)}
            {renderField('Student ID', 'studentId', 'text', 'AIU 12345678', true)}
            
            <div style={styles.formGroup}>
                <label style={styles.label}>Program <span style={{ color: 'red' }}>*</span></label>
                <select 
                    name="program" 
                    value={formData.program} 
                    onChange={handleInputChange} 
                    style={{...styles.input, borderColor: errors.program ? '#dc3545' : '#ccc'}}
                >
                    <option value="">Select your program</option>
                    <option value="Master of Business Management">Master of Business Management</option>
                    <option value="Master of Education">Master of Education</option>
                    <option value="Master in Social Business">Master in Social Business</option>
                    <option value="PhD Education">PhD (Education)</option>
                    <option value="PhD Business">PhD (Business Management)</option>
                </select>
                {errors.program && <div style={styles.error}>{errors.program}</div>}
            </div>

            {renderField('Current Semester', 'currentSemester', 'number', 'e.g., 3', true)}
        </div>
    )

    const renderPage2 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Select Service</h2>
            <div style={styles.formGroup}>
                <label style={styles.label}>Service Category <span style={{ color: 'red' }}>*</span></label>
                <select 
                    name="serviceCategory" 
                    value={formData.serviceCategory} 
                    onChange={handleInputChange}
                    style={{...styles.input, height: '45px', fontSize: '16px', borderColor: errors.serviceCategory ? '#dc3545' : '#ccc'}}
                >
                    <option value="">Select a service...</option>
                    <option value="Add/Drop Course">Add/Drop Course</option>
                    <option value="Deferment of Study">Deferment of Study</option>
                    <option value="Extension of Study">Extension of Study</option>
                    <option value="Withdrawal from University">Withdrawal from University</option>
                </select>
                {errors.serviceCategory && <div style={styles.error}>{errors.serviceCategory}</div>}
            </div>
        </div>
    )

    const renderPage3 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Service Details</h2>
            
            {formData.serviceCategory === 'Add/Drop Course' && (
                <>
                    {renderField('Course Code', 'courseCode', 'text', 'e.g., CS503', true)}
                    {renderField('Course Name', 'courseName', 'text', 'Enter course name', true)}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Action <span style={{ color: 'red' }}>*</span></label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label><input type="radio" name="action" value="Add" checked={formData.action === 'Add'} onChange={handleInputChange} /> Add</label>
                            <label><input type="radio" name="action" value="Drop" checked={formData.action === 'Drop'} onChange={handleInputChange} /> Drop</label>
                        </div>
                        {errors.action && <div style={styles.error}>{errors.action}</div>}
                    </div>
                </>
            )}

            {formData.serviceCategory === 'Deferment of Study' && (
                <>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Reason for Deferment <span style={{ color: 'red' }}>*</span></label>
                        <textarea 
                            name="defermentReason" 
                            value={formData.defermentReason} 
                            onChange={handleInputChange} 
                            style={{...styles.input, height: '100px'}} 
                        />
                        {errors.defermentReason && <div style={styles.error}>{errors.defermentReason}</div>}
                    </div>
                    {renderField('Resuming Semester', 'resumingSemester', 'text', '', true)}
                    {renderField('Upload Document', 'supportingDocument', 'file')}
                </>
            )}

            {formData.serviceCategory === 'Extension of Study' && (
                <>
                    {renderField('Current End Date', 'currentEndDate', 'date', '', true)}
                    {renderField('Requested New End Date', 'requestedNewEndDate', 'date', '', true)}
                    {renderField('Gantt Chart', 'ganttChart', 'file')}
                </>
            )}

            {formData.serviceCategory === 'Withdrawal from University' && (
                <>
                    {renderField('Effective Date', 'effectiveDate', 'date', '', true)}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Withdrawal Reason <span style={{ color: 'red' }}>*</span></label>
                        <select name="withdrawalReason" value={formData.withdrawalReason} onChange={handleInputChange} style={styles.input}>
                            <option value="">Select reason...</option>
                            <option value="Financial">Financial</option>
                            <option value="Medical">Medical</option>
                            <option value="Personal">Personal</option>
                            <option value="Academic">Academic</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.withdrawalReason && <div style={styles.error}>{errors.withdrawalReason}</div>}
                    </div>
                    {renderField('Clearance Form', 'clearanceForm', 'file')}
                </>
            )}

            {!formData.serviceCategory && <p style={{color: '#666', textAlign: 'center'}}>Please select a category in the previous step.</p>}
        </div>
    )

    const renderPage4 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Declaration</h2>
            
            <div style={styles.declarationBox}>
                <p>I hereby certify that the information provided is true and accurate to the best of my knowledge.</p>
            </div>

            {/* NEW SIGNATURE REPLACEMENT: Simple Text Input */}
            <div style={styles.formGroup}>
                <label style={styles.label}>
                    Digital Signature (Type Full Name) <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                    type="text"
                    name="declarationName"
                    value={formData.declarationName}
                    onChange={handleInputChange}
                    placeholder="Type your name here to sign"
                    style={{
                        ...styles.input,
                        fontWeight: 'bold',
                        borderColor: errors.declarationName ? '#dc3545' : '#ccc'
                    }}
                />
                <small style={{ color: '#666' }}>By typing your name, you agree to the declaration above.</small>
                {errors.declarationName && <div style={styles.error}>{errors.declarationName}</div>}
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Date of Submission</label>
                <input
                    type="date"
                    value={formData.submissionDate}
                    readOnly
                    style={{ ...styles.input, backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                />
            </div>
        </div>
    )

    // Render Logic
    const renderCurrentPage = () => {
        switch (currentStep) {
            case 1: return renderPage1()
            case 2: return renderPage2()
            case 3: return renderPage3()
            case 4: return renderPage4()
            default: return null
        }
    }

    return (
        <div style={styles.mainContainer}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Service Request Form</h1>
                <p style={{ margin: '5px 0 0', color: '#666' }}>Student Service Module</p>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressContainer}>
                {steps.map(step => (
                    <div key={step.number} style={{ 
                        ...styles.stepBadge, 
                        backgroundColor: currentStep >= step.number ? '#007bff' : '#e9ecef',
                        color: currentStep >= step.number ? '#fff' : '#666'
                    }}>
                        {step.label}
                    </div>
                ))}
            </div>

            <div style={styles.formBody}>
                {renderCurrentPage()}
            </div>

            <div style={styles.footer}>
                <button 
                    onClick={handlePrevious} 
                    disabled={currentStep === 1}
                    style={{ ...styles.button, backgroundColor: currentStep === 1 ? '#ccc' : '#6c757d' }}
                >
                    Previous
                </button>

                {currentStep < 4 ? (
                    <button onClick={handleNext} style={{ ...styles.button, backgroundColor: '#007bff' }}>
                        Next
                    </button>
                ) : (
                    <button onClick={handleSubmit} style={{ ...styles.button, backgroundColor: '#28a745' }}>
                        Submit Form
                    </button>
                )}
            </div>
        </div>
    )
}

// Simple internal styles to avoid External CSS dependencies
const styles = {
    mainContainer: {
        maxWidth: '600px',
        margin: '40px auto',
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
    },
    progressContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '0 10px'
    },
    stepBadge: {
        fontSize: '12px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontWeight: '600'
    },
    formBody: {
        minHeight: '300px'
    },
    pageContainer: {
        animation: 'fadeIn 0.3s'
    },
    sectionTitle: {
        fontSize: '20px',
        marginBottom: '20px',
        color: '#333'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#333'
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
        boxSizing: 'border-box' // Important for padding
    },
    button: {
        padding: '10px 20px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        minWidth: '100px'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
    },
    error: {
        color: '#dc3545',
        fontSize: '12px',
        marginTop: '5px'
    },
    declarationBox: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        borderLeft: '4px solid #007bff'
    }
}

export default StudentForm