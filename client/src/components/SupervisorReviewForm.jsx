import { useState, useRef, useEffect } from 'react'
import '../App.css'

function SupervisorReviewForm({ studentData, onDecision }) {
    const [reviewData, setReviewData] = useState({
        supervisorStatus: '',
        approvalNote: '',
        rejectionReason: '',
        supervisorName: 'Dr. John Smith', // Auto-filled mock
        staffId: 'STF98765',
        signature: '',
        decisionDate: new Date().toISOString().split('T')[0]
    })

    const [errors, setErrors] = useState({})
    const [isDrawing, setIsDrawing] = useState(false)
    const canvasRef = useRef(null)
    const contextRef = useRef(null)

    // Initialize canvas for signature
    useEffect(() => {
        if (canvasRef.current) {
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
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setReviewData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!reviewData.supervisorStatus) {
            newErrors.supervisorStatus = 'Please select a status'
        } else {
            if (reviewData.supervisorStatus === 'Approved' && !reviewData.approvalNote) {
                // Optional usually means actually optional, but adding check just in case logic changes
            }
            if ((reviewData.supervisorStatus === 'Rejected' || reviewData.supervisorStatus === 'More Info') && !reviewData.rejectionReason.trim()) {
                newErrors.rejectionReason = 'Reason is required for rejection or requesting more info'
            }
        }

        if (!reviewData.signature) {
            newErrors.signature = 'Supervisor signature is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            // Simulate email notification
            alert(`Email notification sent to student ${studentData.fullName} regarding decision: ${reviewData.supervisorStatus}`)
            onDecision({ ...studentData, ...reviewData })
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
        return { x: clientX - rect.left, y: clientY - rect.top }
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
        if (contextRef.current) contextRef.current.closePath()
        setIsDrawing(false)
        if (canvasRef.current) {
            setReviewData(prev => ({ ...prev, signature: canvasRef.current.toDataURL() }))
        }
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        const context = contextRef.current
        context.clearRect(0, 0, canvas.width, canvas.height)
        setReviewData(prev => ({ ...prev, signature: '' }))
    }

    return (
        <div className="form-container">
            <div className="form-header">
                <h1>Supervisor Request Review</h1>
                <p>Academic Staff Module</p>
            </div>

            <div className="form-body">
                {/* Section 1: Student Submission Data */}
                <section className="review-section">
                    <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Student Submission</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="form-label">Student Name</label>
                                <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', border: 'none' }}>{studentData.fullName}</div>
                            </div>
                            <div>
                                <label className="form-label">Student ID</label>
                                <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', border: 'none' }}>{studentData.studentId}</div>
                            </div>
                            <div>
                                <label className="form-label">Request Type</label>
                                <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', border: 'none' }}>{studentData.serviceCategory}</div>
                            </div>
                            <div>
                                <label className="form-label">Submission Date</label>
                                <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', border: 'none' }}>{studentData.submissionDate}</div>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Attachments</label>
                            {(studentData.supportingDocument || studentData.ganttChart || studentData.clearanceForm) ? (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {studentData.supportingDocument && (
                                        <div className="file-chip">📄 {studentData.supportingDocument.name}</div>
                                    )}
                                    {studentData.ganttChart && (
                                        <div className="file-chip">📊 {studentData.ganttChart.name}</div>
                                    )}
                                    {studentData.clearanceForm && (
                                        <div className="file-chip">📋 {studentData.clearanceForm.name}</div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No attachments</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section 2: Supervisor Decision */}
                <section className="review-section">
                    <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Academic Decision</h2>
                    <div className="form-group">
                        <label className="form-label required">Supervisor Status</label>
                        <div className="radio-group">
                            <label className={`radio-label ${reviewData.supervisorStatus === 'Approved' ? 'approved' : ''}`} style={{ borderColor: reviewData.supervisorStatus === 'Approved' ? '#4facfe' : 'var(--border-color)' }}>
                                <input
                                    type="radio"
                                    name="supervisorStatus"
                                    value="Approved"
                                    checked={reviewData.supervisorStatus === 'Approved'}
                                    onChange={handleInputChange}
                                    style={{ display: 'none' }}
                                />
                                <span style={{ color: reviewData.supervisorStatus === 'Approved' ? '#4facfe' : 'inherit' }}>✓ Recommended / Approved</span>
                            </label>

                            <label className={`radio-label ${reviewData.supervisorStatus === 'Rejected' ? 'rejected' : ''}`} style={{ borderColor: reviewData.supervisorStatus === 'Rejected' ? '#f5576c' : 'var(--border-color)' }}>
                                <input
                                    type="radio"
                                    name="supervisorStatus"
                                    value="Rejected"
                                    checked={reviewData.supervisorStatus === 'Rejected'}
                                    onChange={handleInputChange}
                                    style={{ display: 'none' }}
                                />
                                <span style={{ color: reviewData.supervisorStatus === 'Rejected' ? '#f5576c' : 'inherit' }}>✗ Not Recommended / Rejected</span>
                            </label>

                            <label className={`radio-label ${reviewData.supervisorStatus === 'More Info' ? 'warning' : ''}`} style={{ borderColor: reviewData.supervisorStatus === 'More Info' ? '#f093fb' : 'var(--border-color)' }}>
                                <input
                                    type="radio"
                                    name="supervisorStatus"
                                    value="More Info"
                                    checked={reviewData.supervisorStatus === 'More Info'}
                                    onChange={handleInputChange}
                                    style={{ display: 'none' }}
                                />
                                <span style={{ color: reviewData.supervisorStatus === 'More Info' ? '#f093fb' : 'inherit' }}>? More Information Required</span>
                            </label>
                        </div>
                        {errors.supervisorStatus && <div className="error-message">⚠ {errors.supervisorStatus}</div>}
                    </div>
                </section>

                {/* Section 3: Remarks & Feedback */}
                {(reviewData.supervisorStatus) && (
                    <section className="review-section" style={{ animation: 'fadeIn 0.3s ease' }}>
                        {reviewData.supervisorStatus === 'Approved' ? (
                            <div className="form-group">
                                <label className="form-label">Approval Note (Optional)</label>
                                <textarea
                                    name="approvalNote"
                                    value={reviewData.approvalNote}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    placeholder="Add any additional comments for approval..."
                                />
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="form-label required">Reason for {reviewData.supervisorStatus === 'Rejected' ? 'Rejection' : 'Return'}</label>
                                <textarea
                                    name="rejectionReason"
                                    value={reviewData.rejectionReason}
                                    onChange={handleInputChange}
                                    className={`form-textarea ${errors.rejectionReason ? 'error' : ''}`}
                                    placeholder={`Please explain why the request is ${reviewData.supervisorStatus === 'Rejected' ? 'rejected' : 'returned'}...`}
                                />
                                {errors.rejectionReason && <div className="error-message">⚠ {errors.rejectionReason}</div>}
                            </div>
                        )}
                    </section>
                )}

                {/* Section 4: Official Sign-Off */}
                <section className="review-section">
                    <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Official Sign-Off</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Supervisor Name</label>
                            <input type="text" value={reviewData.supervisorName} disabled className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Staff ID</label>
                            <input type="text" value={reviewData.staffId} disabled className="form-input" />
                        </div>
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
                                <button type="button" onClick={clearSignature} className="btn-clear">Clear</button>
                            </div>
                        </div>
                        {errors.signature && <div className="error-message">⚠ {errors.signature}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Decision Date</label>
                        <input type="date" value={reviewData.decisionDate} disabled className="form-input" />
                    </div>
                </section>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" style={{ visibility: 'hidden' }}>Back</button> {/* Spacer */}
                <button type="button" onClick={handleSubmit} className="btn btn-primary">
                    <span>Finalize Decision</span>
                </button>
            </div>
        </div>
    )
}

export default SupervisorReviewForm
