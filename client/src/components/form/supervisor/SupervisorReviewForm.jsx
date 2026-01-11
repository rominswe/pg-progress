import { useState } from 'react'

function SupervisorReviewForm({ studentData, onSubmit, onCancel }) {
    const [currentStep, setCurrentStep] = useState(1)

    // Supervisor State
    const [formData, setFormData] = useState({
        // Decision Data
        status: '', // 'Approved', 'Rejected', 'More Info'
        comments: '', 
        
        // Sign-off
        supervisorName: '', // Replaces signature
        staffId: 'STF98765', // Mock ID
        decisionDate: new Date().toISOString().split('T')[0]
    })

    const [errors, setErrors] = useState({})

    const steps = [
        { number: 1, label: 'Review Student' },
        { number: 2, label: 'Decision' },
        { number: 3, label: 'Remarks' },
        { number: 4, label: 'Declaration' }
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        // Step 1 is Read-only, no validation needed usually, 
        // but we ensure studentData exists.
        if (step === 1 && !studentData) {
            alert("No student data loaded")
            return false
        }

        if (step === 2) {
            if (!formData.status) newErrors.status = 'Please select a decision status'
        }

        if (step === 3) {
            // If Rejected or More Info, comments are mandatory
            if ((formData.status === 'Rejected' || formData.status === 'More Info') && !formData.comments.trim()) {
                newErrors.comments = 'Please provide a reason for this decision'
            }
        }

        if (step === 4) {
            if (!formData.supervisorName.trim()) {
                newErrors.supervisorName = 'Please type your full name to sign'
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
            // Combine student data with supervisor decision
            onSubmit({ ...studentData, ...formData })
        }
    }

    // --- RENDER HELPERS ---

    // Helper for Read Only fields (Gray background)
    const renderReadOnly = (label, value) => (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}</label>
            <input
                type="text"
                value={value || 'N/A'}
                readOnly
                style={{ ...styles.input, backgroundColor: '#f9f9f9', color: '#555' }}
            />
        </div>
    )

    // Helper for Editable fields (White background)
    const renderInput = (label, name, type = 'text', placeholder = '', required = false) => (
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

    // PAGE 1: VIEW STUDENT DATA (Read Only)
    const renderPage1 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Review Student Submission</h2>
            
            {/* If no data passed, show loading */}
            {!studentData ? <p>Loading...</p> : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {renderReadOnly('Student Name', studentData.fullName)}
                        {renderReadOnly('Student ID', studentData.studentId)}
                    </div>
                    {renderReadOnly('Program', studentData.program)}
                    {renderReadOnly('Request Type', studentData.serviceCategory)}
                    
                    {/* Dynamic Field based on request type */}
                    {studentData.courseName && renderReadOnly('Course', `${studentData.courseCode} - ${studentData.courseName}`)}
                    {studentData.defermentReason && renderReadOnly('Deferment Reason', studentData.defermentReason)}
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Attached Documents</label>
                        <div style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                             {studentData.supportingDocument ? `📄 ${studentData.supportingDocument.name}` : 'No files attached'}
                        </div>
                    </div>
                </>
            )}
        </div>
    )

    // PAGE 2: DECISION
    const renderPage2 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Academic Decision</h2>
            <div style={styles.formGroup}>
                <label style={styles.label}>Select Status <span style={{ color: 'red' }}>*</span></label>
                <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                    style={{
                        ...styles.input, 
                        height: '45px', 
                        fontSize: '16px', 
                        borderColor: errors.status ? '#dc3545' : '#ccc'
                    }}
                >
                    <option value="">Select decision...</option>
                    <option value="Approved">Recommended / Approved</option>
                    <option value="Rejected">Not Recommended / Rejected</option>
                    <option value="More Info">More Information Required</option>
                </select>
                {errors.status && <div style={styles.error}>{errors.status}</div>}
            </div>
            
            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: formData.status === 'Approved' ? '#d4edda' : formData.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                borderRadius: '4px',
                display: formData.status ? 'block' : 'none',
                color: '#333'
            }}>
                <strong>Summary: </strong> 
                {formData.status === 'Approved' ? 'You are approving this request to proceed to the Faculty.' : 
                 formData.status === 'Rejected' ? 'This request will be returned to the student as rejected.' :
                 formData.status === 'More Info' ? 'Student will be notified to update details.' : ''}
            </div>
        </div>
    )

    // PAGE 3: REMARKS
    const renderPage3 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Supervisor Remarks</h2>
            
            <div style={styles.formGroup}>
                <label style={styles.label}>
                    {formData.status === 'Approved' ? 'Approval Note (Optional)' : 'Reason / Requirements'} 
                    {(formData.status === 'Rejected' || formData.status === 'More Info') && <span style={{ color: 'red' }}> *</span>}
                </label>
                <textarea 
                    name="comments" 
                    value={formData.comments} 
                    onChange={handleInputChange} 
                    placeholder={formData.status === 'Approved' ? "Any additional notes..." : "Please explain why..."}
                    style={{
                        ...styles.input, 
                        height: '120px', 
                        fontFamily: 'inherit',
                        borderColor: errors.comments ? '#dc3545' : '#ccc'
                    }} 
                />
                {errors.comments && <div style={styles.error}>{errors.comments}</div>}
            </div>
        </div>
    )

    // PAGE 4: DECLARATION (TEXT INPUT)
    const renderPage4 = () => (
        <div style={styles.pageContainer}>
            <h2 style={styles.sectionTitle}>Final Sign-off</h2>
            
            <div style={styles.declarationBox}>
                <p>I hereby confirm that I have reviewed this student's application and the decision provided is final based on academic merit.</p>
            </div>

            {/* SIGNATURE REPLACEMENT: Text Input */}
            <div style={styles.formGroup}>
                <label style={styles.label}>
                    Digital Signature (Type Full Name) <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                    type="text"
                    name="supervisorName"
                    value={formData.supervisorName}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    style={{
                        ...styles.input,
                        fontWeight: 'bold',
                        borderColor: errors.supervisorName ? '#dc3545' : '#ccc'
                    }}
                />
                <small style={{ color: '#666' }}>Type your name to digitally sign this review.</small>
                {errors.supervisorName && <div style={styles.error}>{errors.supervisorName}</div>}
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Staff ID</label>
                <input
                    type="text"
                    value={formData.staffId}
                    readOnly
                    style={{ ...styles.input, backgroundColor: '#f9f9f9' }}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Date of Decision</label>
                <input
                    type="date"
                    value={formData.decisionDate}
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
                <h1 style={{ margin: 0, fontSize: '24px' }}>Supervisor Review Portal</h1>
                <p style={{ margin: '5px 0 0', color: '#666' }}>Postgraduate Academic Review</p>
                {/* Optional Cancel/Back Button added to header */}
                {onCancel && (
                    <button onClick={onCancel} style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                        ← Back to List
                    </button>
                )}
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
                        Finalize Review
                    </button>
                )}
            </div>
        </div>
    )
}

// EXACT Styles from StudentForm
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
        boxSizing: 'border-box'
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

export default SupervisorReviewForm