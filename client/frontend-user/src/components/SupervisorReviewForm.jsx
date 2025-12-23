// // import { useState, useRef, useEffect } from 'react';
// // import '../App.css';

// // function SupervisorReviewForm({ studentData, onDecision }) {
// //     // 1. Initial State
// //     const [reviewData, setReviewData] = useState({
// //         supervisorStatus: '',
// //         approvalNote: '',
// //         rejectionReason: '',
// //         supervisorName: 'Dr. John Smith', // Auto-filled mock
// //         staffId: 'STF98765',
// //         signature: '',
// //         decisionDate: new Date().toISOString().split('T')[0]
// //     });

// //     const [errors, setErrors] = useState({});
// //     const [isDrawing, setIsDrawing] = useState(false);
// //     const canvasRef = useRef(null);
// //     const contextRef = useRef(null);

// //     // Guard Clause: Prevent crash if studentData isn't passed yet
// //     if (!studentData) {
// //         return (
// //             <div className="form-container">
// //                 <p style={{ textAlign: 'center', padding: '2rem' }}>Loading student request data...</p>
// //             </div>
// //         );
// //     }

// //     // 2. Initialize Canvas for Signature
// //     useEffect(() => {
// //         const initCanvas = () => {
// //             if (canvasRef.current) {
// //                 const canvas = canvasRef.current;
// //                 const ratio = window.devicePixelRatio || 1;
// //                 const rect = canvas.getBoundingClientRect();

// //                 // Set actual drawing resolution
// //                 canvas.width = rect.width * ratio;
// //                 canvas.height = rect.height * ratio;
                
// //                 // Set display size
// //                 canvas.style.width = `${rect.width}px`;
// //                 canvas.style.height = `${rect.height}px`;

// //                 const context = canvas.getContext('2d');
// //                 context.scale(ratio, ratio);
// //                 context.lineCap = 'round';
// //                 context.strokeStyle = '#002147';
// //                 context.lineWidth = 2;
// //                 contextRef.current = context;
// //             }
// //         };

// //         initCanvas();
// //         // Re-init on resize to keep signature box responsive
// //         window.addEventListener('resize', initCanvas);
// //         return () => window.removeEventListener('resize', initCanvas);
// //     }, []);

// //     // 3. Form Logic
// //     const handleInputChange = (e) => {
// //         const { name, value } = e.target;
// //         setReviewData(prev => ({ ...prev, [name]: value }));
// //         if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
// //     };

// //     const validateForm = () => {
// //         const newErrors = {};

// //         if (!reviewData.supervisorStatus) {
// //             newErrors.supervisorStatus = 'Please select a status';
// //         } else {
// //             if ((reviewData.supervisorStatus === 'Rejected' || reviewData.supervisorStatus === 'More Info') && !reviewData.rejectionReason.trim()) {
// //                 newErrors.rejectionReason = `Reason is required for ${reviewData.supervisorStatus}`;
// //             }
// //         }

// //         if (!reviewData.signature) {
// //             newErrors.signature = 'Supervisor signature is required';
// //         }

// //         setErrors(newErrors);
// //         return Object.keys(newErrors).length === 0;
// //     };

// //     const handleSubmit = () => {
// //         if (validateForm()) {
// //             // Include both the original student info and the new supervisor review
// //             onDecision({ 
// //                 decision: reviewData.supervisorStatus, 
// //                 fullData: { ...studentData, ...reviewData } 
// //             });
// //         }
// //     };

// //     // 4. Signature Pad Logic
// //     const getCoordinates = (event) => {
// //         if (!canvasRef.current) return { x: 0, y: 0 };
// //         const canvas = canvasRef.current;
// //         const rect = canvas.getBoundingClientRect();
// //         let clientX, clientY;

// //         if (event.touches && event.touches.length > 0) {
// //             clientX = event.touches[0].clientX;
// //             clientY = event.touches[0].clientY;
// //         } else {
// //             clientX = event.clientX;
// //             clientY = event.clientY;
// //         }
// //         return { x: clientX - rect.left, y: clientY - rect.top };
// //     };

// //     const startDrawing = (e) => {
// //         e.preventDefault();
// //         const { x, y } = getCoordinates(e);
// //         if (contextRef.current) {
// //             contextRef.current.beginPath();
// //             contextRef.current.moveTo(x, y);
// //             setIsDrawing(true);
// //         }
// //     };

// //     const draw = (e) => {
// //         if (!isDrawing || !contextRef.current) return;
// //         e.preventDefault();
// //         const { x, y } = getCoordinates(e);
// //         contextRef.current.lineTo(x, y);
// //         contextRef.current.stroke();
// //     };

// //     const stopDrawing = (e) => {
// //         if (e) e.preventDefault();
// //         if (contextRef.current) contextRef.current.closePath();
// //         setIsDrawing(false);
// //         if (canvasRef.current) {
// //             setReviewData(prev => ({ ...prev, signature: canvasRef.current.toDataURL() }));
// //             if (errors.signature) setErrors(prev => ({ ...prev, signature: '' }));
// //         }
// //     };

// //     const clearSignature = () => {
// //         const canvas = canvasRef.current;
// //         const context = contextRef.current;
// //         context.clearRect(0, 0, canvas.width, canvas.height);
// //         setReviewData(prev => ({ ...prev, signature: '' }));
// //     };

// //     return (
// //         <div className="form-container">
// //             <div className="form-header">
// //                 <h1>Supervisor Request Review</h1>
// //                 <p>Postgraduate Academic Module</p>
// //             </div>

// //             <div className="form-body">
// //                 {/* Section 1: Student Submission Data (Read Only) */}
// //                 <section className="review-section">
// //                     <h2 className="section-title">Student Submission</h2>
// //                     <div className="data-display-card">
// //                         <div className="data-grid">
// //                             <div className="data-item">
// //                                 <label>Student Name</label>
// //                                 <p>{studentData.fullName}</p>
// //                             </div>
// //                             <div className="data-item">
// //                                 <label>Student ID</label>
// //                                 <p>{studentData.studentId}</p>
// //                             </div>
// //                             <div className="data-item">
// //                                 <label>Request Type</label>
// //                                 <p>{studentData.serviceCategory}</p>
// //                             </div>
// //                             <div className="data-item">
// //                                 <label>Submission Date</label>
// //                                 <p>{studentData.submissionDate}</p>
// //                             </div>
// //                         </div>

// //                         <div className="attachment-box">
// //                             <label>Attachments</label>
// //                             <div className="file-chip-container">
// //                                 {studentData.supportingDocument && <span className="file-chip">📄 {studentData.supportingDocument.name}</span>}
// //                                 {studentData.ganttChart && <span className="file-chip">📊 {studentData.ganttChart.name}</span>}
// //                                 {studentData.clearanceForm && <span className="file-chip">📋 {studentData.clearanceForm.name}</span>}
// //                                 {(!studentData.supportingDocument && !studentData.ganttChart && !studentData.clearanceForm) && 
// //                                     <span className="no-data">No attachments provided</span>
// //                                 }
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </section>

// //                 {/* Section 2: Decision Radios */}
// //                 <section className="review-section">
// //                     <h2 className="section-title">Academic Decision</h2>
// //                     <div className="form-group">
// //                         <label className="form-label required">Supervisor Status</label>
// //                         <div className="decision-radio-group">
// //                             <label className={`radio-card ${reviewData.supervisorStatus === 'Approved' ? 'active-approve' : ''}`}>
// //                                 <input type="radio" name="supervisorStatus" value="Approved" onChange={handleInputChange} />
// //                                 <span className="radio-content">✓ Recommended / Approved</span>
// //                             </label>

// //                             <label className={`radio-card ${reviewData.supervisorStatus === 'Rejected' ? 'active-reject' : ''}`}>
// //                                 <input type="radio" name="supervisorStatus" value="Rejected" onChange={handleInputChange} />
// //                                 <span className="radio-content">✗ Not Recommended / Rejected</span>
// //                             </label>

// //                             <label className={`radio-card ${reviewData.supervisorStatus === 'More Info' ? 'active-warn' : ''}`}>
// //                                 <input type="radio" name="supervisorStatus" value="More Info" onChange={handleInputChange} />
// //                                 <span className="radio-content">? More Information Required</span>
// //                             </label>
// //                         </div>
// //                         {errors.supervisorStatus && <p className="error-text">{errors.supervisorStatus}</p>}
// //                     </div>
// //                 </section>

// //                 {/* Section 3: Feedback Area */}
// //                 {reviewData.supervisorStatus && (
// //                     <section className="review-section">
// //                         <div className="form-group">
// //                             <label className={`form-label ${reviewData.supervisorStatus !== 'Approved' ? 'required' : ''}`}>
// //                                 {reviewData.supervisorStatus === 'Approved' ? 'Approval Note (Optional)' : `Reason for ${reviewData.supervisorStatus}`}
// //                             </label>
// //                             <textarea
// //                                 name={reviewData.supervisorStatus === 'Approved' ? "approvalNote" : "rejectionReason"}
// //                                 value={reviewData.supervisorStatus === 'Approved' ? reviewData.approvalNote : reviewData.rejectionReason}
// //                                 onChange={handleInputChange}
// //                                 className={`form-textarea ${errors.rejectionReason ? 'error-border' : ''}`}
// //                                 placeholder="Enter details regarding your decision..."
// //                             />
// //                             {errors.rejectionReason && <p className="error-text">{errors.rejectionReason}</p>}
// //                         </div>
// //                     </section>
// //                 )}

// //                 {/* Section 4: Signature */}
// //                 <section className="review-section">
// //                     <h2 className="section-title">Official Sign-Off</h2>
// //                     <div className="data-grid">
// //                         <div className="form-group">
// //                             <label className="form-label">Supervisor Name</label>
// //                             <input type="text" value={reviewData.supervisorName} disabled className="form-input-disabled" />
// //                         </div>
// //                         <div className="form-group">
// //                             <label className="form-label">Staff ID</label>
// //                             <input type="text" value={reviewData.staffId} disabled className="form-input-disabled" />
// //                         </div>
// //                     </div>

// //                     <div className="form-group">
// //                         <label className="form-label required">Digital Signature</label>
// //                         <div className="signature-wrapper">
// //                             <canvas
// //                                 ref={canvasRef}
// //                                 className="signature-canvas"
// //                                 onMouseDown={startDrawing}
// //                                 onMouseMove={draw}
// //                                 onMouseUp={stopDrawing}
// //                                 onMouseLeave={stopDrawing}
// //                                 onTouchStart={startDrawing}
// //                                 onTouchMove={draw}
// //                                 onTouchEnd={stopDrawing}
// //                             />
// //                             <button type="button" onClick={clearSignature} className="signature-clear-btn">Clear</button>
// //                         </div>
// //                         {errors.signature && <p className="error-text">{errors.signature}</p>}
// //                     </div>
// //                 </section>
// //             </div>

// //             <div className="form-actions">
// //                 <button type="button" onClick={handleSubmit} className="btn-finalize">
// //                     Finalize Decision
// //                 </button>
// //             </div>
// //         </div>
// //     );
// // }

// // export default SupervisorReviewForm;

// import { useState, useRef, useEffect } from 'react';
// import '../App.css';

// function SupervisorReviewForm({ studentData, onDecision }) {
//     // 1. Initial State (Preserved)
//     const [reviewData, setReviewData] = useState({
//         supervisorStatus: '',
//         approvalNote: '',
//         rejectionReason: '',
//         supervisorName: 'Dr. John Smith',
//         staffId: 'STF98765',
//         signature: '',
//         decisionDate: new Date().toISOString().split('T')[0]
//     });

//     const [errors, setErrors] = useState({});
//     const [isDrawing, setIsDrawing] = useState(false);
//     const canvasRef = useRef(null);
//     const contextRef = useRef(null);

//     // Guard Clause
//     if (!studentData) {
//         return (
//             <div className="form-container review-card">
//                 <p style={{ textAlign: 'center', padding: '2rem' }}>Loading student request data...</p>
//             </div>
//         );
//     }

//     // 2. Initialize Canvas (Preserved Logic)
//     useEffect(() => {
//         const initCanvas = () => {
//             if (canvasRef.current) {
//                 const canvas = canvasRef.current;
//                 const ratio = window.devicePixelRatio || 1;
//                 const rect = canvas.getBoundingClientRect();
//                 canvas.width = rect.width * ratio;
//                 canvas.height = rect.height * ratio;
//                 canvas.style.width = `${rect.width}px`;
//                 canvas.style.height = `${rect.height}px`;

//                 const context = canvas.getContext('2d');
//                 context.scale(ratio, ratio);
//                 context.lineCap = 'round';
//                 context.strokeStyle = '#002147';
//                 context.lineWidth = 2;
//                 contextRef.current = context;
//             }
//         };
//         initCanvas();
//         window.addEventListener('resize', initCanvas);
//         return () => window.removeEventListener('resize', initCanvas);
//     }, []);

//     // 3. Form Logic (Preserved)
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setReviewData(prev => ({ ...prev, [name]: value }));
//         if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//     };

//     const validateForm = () => {
//         const newErrors = {};
//         if (!reviewData.supervisorStatus) {
//             newErrors.supervisorStatus = 'Please select a status';
//         } else if ((reviewData.supervisorStatus === 'Rejected' || reviewData.supervisorStatus === 'More Info') && !reviewData.rejectionReason.trim()) {
//             newErrors.rejectionReason = `Reason is required`;
//         }
//         if (!reviewData.signature) newErrors.signature = 'Signature is required';
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = () => {
//         if (validateForm()) {
//             onDecision({ 
//                 decision: reviewData.supervisorStatus, 
//                 fullData: { ...studentData, ...reviewData } 
//             });
//         }
//     };

//     // 4. Signature Logic (Preserved)
//     const getCoordinates = (e) => {
//         const rect = canvasRef.current.getBoundingClientRect();
//         const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//         const clientY = e.touches ? e.touches[0].clientY : e.clientY;
//         return { x: clientX - rect.left, y: clientY - rect.top };
//     };

//     const startDrawing = (e) => {
//         e.preventDefault();
//         const { x, y } = getCoordinates(e);
//         contextRef.current.beginPath();
//         contextRef.current.moveTo(x, y);
//         setIsDrawing(true);
//     };

//     const draw = (e) => {
//         if (!isDrawing) return;
//         e.preventDefault();
//         const { x, y } = getCoordinates(e);
//         contextRef.current.lineTo(x, y);
//         contextRef.current.stroke();
//     };

//     const stopDrawing = () => {
//         if (isDrawing) {
//             contextRef.current.closePath();
//             setIsDrawing(false);
//             setReviewData(prev => ({ ...prev, signature: canvasRef.current.toDataURL() }));
//         }
//     };

//     return (
//         <div className="form-container review-card">
//             <div className="form-header">
//                 <h1>Supervisor Request Review</h1>
//                 <p>Postgraduate Academic Module</p>
//             </div>

//             <div className="form-body">
//                 {/* SECTION 1: STUDENT SUBMISSION */}
//                 <section className="review-section">
//                     <h3 className="section-title">Student Submission Summary</h3>
//                     <div className="info-grid">
//                         <div className="info-item">
//                             <label>Student Name</label>
//                             <span>{studentData.fullName}</span>
//                         </div>
//                         <div className="info-item">
//                             <label>Student ID</label>
//                             <span>{studentData.studentId}</span>
//                         </div>
//                         <div className="info-item">
//                             <label>Request Type</label>
//                             <span>{studentData.serviceCategory}</span>
//                         </div>
//                         <div className="info-item">
//                             <label>Submission Date</label>
//                             <span>{studentData.submissionDate}</span>
//                         </div>
//                         <div className="info-item full-width">
//                             <label>Attachments</label>
//                             <div className="attachment-list">
//                                 {studentData.supportingDocument && <span className="file-link">📄 {studentData.supportingDocument.name}</span>}
//                                 {studentData.ganttChart && <span className="file-link">📊 {studentData.ganttChart.name}</span>}
//                                 {studentData.clearanceForm && <span className="file-link">📋 {studentData.clearanceForm.name}</span>}
//                                 {!studentData.supportingDocument && !studentData.ganttChart && !studentData.clearanceForm && <span>No files</span>}
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 <hr className="divider" />

//                 {/* SECTION 2: ACADEMIC DECISION */}
//                 <section className="review-section">
//                     <h3 className="section-title">Academic Decision</h3>
//                     <div className="decision-options">
//                         <label className={`decision-card ${reviewData.supervisorStatus === 'Approved' ? 'selected' : ''}`}>
//                             <input type="radio" name="supervisorStatus" value="Approved" onChange={handleInputChange} />
//                             <div className="icon">✓</div>
//                             <span>Recommended / Approved</span>
//                         </label>
                        
//                         <label className={`decision-card ${reviewData.supervisorStatus === 'Rejected' ? 'selected' : ''}`}>
//                             <input type="radio" name="supervisorStatus" value="Rejected" onChange={handleInputChange} />
//                             <div className="icon">✕</div>
//                             <span>Not Recommended / Rejected</span>
//                         </label>

//                         <label className={`decision-card ${reviewData.supervisorStatus === 'More Info' ? 'selected' : ''}`}>
//                             <input type="radio" name="supervisorStatus" value="More Info" onChange={handleInputChange} />
//                             <div className="icon">?</div>
//                             <span>More Information Required</span>
//                         </label>
//                     </div>
//                     {errors.supervisorStatus && <p className="error-text" style={{color: '#A41034', fontSize: '0.8rem', marginTop: '0.5rem'}}>{errors.supervisorStatus}</p>}
//                 </section>

//                 {/* SECTION 3: REMARKS (Conditionally Shown) */}
//                 {reviewData.supervisorStatus && (
//                     <section className="review-section">
//                         <label className="info-item" style={{marginBottom: '0.5rem'}}>
//                             <label>{reviewData.supervisorStatus === 'Approved' ? 'Approval Note (Optional)' : `Reason for ${reviewData.supervisorStatus}`}</label>
//                         </label>
//                         <textarea
//                             name={reviewData.supervisorStatus === 'Approved' ? "approvalNote" : "rejectionReason"}
//                             value={reviewData.supervisorStatus === 'Approved' ? reviewData.approvalNote : reviewData.rejectionReason}
//                             onChange={handleInputChange}
//                             className="form-input-static"
//                             style={{ height: '100px', background: 'white', fontWeight: '400' }}
//                             placeholder="Enter decision details..."
//                         />
//                         {errors.rejectionReason && <p className="error-text" style={{color: '#A41034', fontSize: '0.8rem'}}>{errors.rejectionReason}</p>}
//                     </section>
//                 )}

//                 <hr className="divider" />

//                 {/* SECTION 4: SIGN-OFF */}
//                 <section className="review-section">
//                     <h3 className="section-title">Official Sign-Off</h3>
//                     <div className="info-grid">
//                         <div className="info-item">
//                             <label>Supervisor Name</label>
//                             <input type="text" className="form-input-static" value={reviewData.supervisorName} readOnly />
//                         </div>
//                         <div className="info-item">
//                             <label>Staff ID</label>
//                             <input type="text" className="form-input-static" value={reviewData.staffId} readOnly />
//                         </div>
//                     </div>

//                     <div style={{ marginTop: '1.5rem' }}>
//                         <label className="info-item"><label>Digital Signature</label></label>
//                         <div className="signature-wrapper" style={{ border: '1px solid #ddd', borderRadius: '4px', background: '#f8f9fa' }}>
//                             <canvas 
//                                 ref={canvasRef} 
//                                 onMouseDown={startDrawing} 
//                                 onMouseMove={draw} 
//                                 onMouseUp={stopDrawing} 
//                                 onMouseLeave={stopDrawing}
//                                 onTouchStart={startDrawing}
//                                 onTouchMove={draw}
//                                 onTouchEnd={stopDrawing}
//                                 style={{ cursor: 'crosshair', width: '100%', height: '150px' }}
//                             />
//                         </div>
//                         <button type="button" onClick={() => {
//                             contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//                             setReviewData(prev => ({ ...prev, signature: '' }));
//                         }} className="file-link" style={{ marginTop: '0.5rem', cursor: 'pointer', border: 'none' }}>
//                             Clear Signature
//                         </button>
//                         {errors.signature && <p className="error-text" style={{color: '#A41034', fontSize: '0.8rem'}}>{errors.signature}</p>}
//                     </div>
//                 </section>
//             </div>

//             <div className="form-actions">
//                 <button 
//                     type="button" 
//                     onClick={handleSubmit} 
//                     className="btn-primary" 
//                     style={{ background: '#A41034', color: 'white', padding: '0.8rem 2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: '600' }}
//                 >
//                     Finalize Decision
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default SupervisorReviewForm;

import { useState, useRef, useEffect } from 'react';
import '../App.css';

// Added onBack to the props so we can return to the table
function SupervisorReviewForm({ studentData, onDecision, onBack }) {
    // 1. Initial State (Preserved from your original)
    const [reviewData, setReviewData] = useState({
        supervisorStatus: '',
        approvalNote: '',
        rejectionReason: '',
        supervisorName: 'Dr. John Smith',
        staffId: 'STF98765',
        signature: '',
        decisionDate: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState({});
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // Guard Clause with a Back button in case data fails to load
    if (!studentData) {
        return (
            <div className="form-container review-card">
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading student request data...</p>
                <button onClick={onBack} className="btn-secondary">Go Back to Table</button>
            </div>
        );
    }

    // 2. Initialize Canvas (Preserved logic)
    useEffect(() => {
        const initCanvas = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ratio = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * ratio;
                canvas.height = rect.height * ratio;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                const context = canvas.getContext('2d');
                context.scale(ratio, ratio);
                context.lineCap = 'round';
                context.strokeStyle = '#002147';
                context.lineWidth = 2;
                contextRef.current = context;
            }
        };
        initCanvas();
        window.addEventListener('resize', initCanvas);
        return () => window.removeEventListener('resize', initCanvas);
    }, []);

    // 3. Form Logic
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
        if (!reviewData.signature) newErrors.signature = 'Signature is required';
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

    // 4. Signature Logic
    const getCoordinates = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            setReviewData(prev => ({ ...prev, signature: canvasRef.current.toDataURL() }));
        }
    };

    return (
        <div className="form-container review-card">
            <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Supervisor Request Review</h1>
                    <p>Postgraduate Academic Module</p>
                </div>
                {/* NEW: Quick back button in header */}
                <button type="button" onClick={onBack} className="file-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    ← Back to Table
                </button>
            </div>

            <div className="form-body">
                {/* SECTION 1: STUDENT SUBMISSION (Full Original Logic) */}
                <section className="review-section">
                    <h3 className="section-title">Student Submission Summary</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Student Name</label>
                            <span>{studentData.fullName}</span>
                        </div>
                        <div className="info-item">
                            <label>Student ID</label>
                            <span>{studentData.studentId}</span>
                        </div>
                        <div className="info-item">
                            <label>Request Type</label>
                            <span>{studentData.serviceCategory}</span>
                        </div>
                        <div className="info-item">
                            <label>Submission Date</label>
                            <span>{studentData.submissionDate}</span>
                        </div>
                        <div className="info-item full-width">
                            <label>Attachments</label>
                            <div className="attachment-list">
                                {studentData.supportingDocument && <span className="file-link">📄 {studentData.supportingDocument.name}</span>}
                                {studentData.ganttChart && <span className="file-link">📊 {studentData.ganttChart.name}</span>}
                                {studentData.clearanceForm && <span className="file-link">📋 {studentData.clearanceForm.name}</span>}
                                {!studentData.supportingDocument && !studentData.ganttChart && !studentData.clearanceForm && <span>No files</span>}
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="divider" />

                {/* SECTION 2: DECISION RADIOS */}
                <section className="review-section">
                    <h3 className="section-title">Academic Decision</h3>
                    <div className="decision-options">
                        <label className={`decision-card ${reviewData.supervisorStatus === 'Approved' ? 'selected' : ''}`}>
                            <input type="radio" name="supervisorStatus" value="Approved" onChange={handleInputChange} />
                            <div className="icon">✓</div>
                            <span>Recommended / Approved</span>
                        </label>
                        <label className={`decision-card ${reviewData.supervisorStatus === 'Rejected' ? 'selected' : ''}`}>
                            <input type="radio" name="supervisorStatus" value="Rejected" onChange={handleInputChange} />
                            <div className="icon">✕</div>
                            <span>Not Recommended / Rejected</span>
                        </label>
                        <label className={`decision-card ${reviewData.supervisorStatus === 'More Info' ? 'selected' : ''}`}>
                            <input type="radio" name="supervisorStatus" value="More Info" onChange={handleInputChange} />
                            <div className="icon">?</div>
                            <span>More Information Required</span>
                        </label>
                    </div>
                    {errors.supervisorStatus && <p className="error-text" style={{color: '#A41034'}}>{errors.supervisorStatus}</p>}
                </section>

                {/* SECTION 3: REMARKS */}
                {reviewData.supervisorStatus && (
                    <section className="review-section">
                        <label className="info-item">
                            <label>{reviewData.supervisorStatus === 'Approved' ? 'Approval Note (Optional)' : `Reason for ${reviewData.supervisorStatus}`}</label>
                        </label>
                        <textarea
                            name={reviewData.supervisorStatus === 'Approved' ? "approvalNote" : "rejectionReason"}
                            value={reviewData.supervisorStatus === 'Approved' ? reviewData.approvalNote : reviewData.rejectionReason}
                            onChange={handleInputChange}
                            className="form-input-static"
                            style={{ height: '100px', background: 'white' }}
                            placeholder="Enter decision details..."
                        />
                        {errors.rejectionReason && <p className="error-text" style={{color: '#A41034'}}>{errors.rejectionReason}</p>}
                    </section>
                )}

                <hr className="divider" />

                {/* SECTION 4: SIGN-OFF */}
                <section className="review-section">
                    <h3 className="section-title">Official Sign-Off</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Supervisor Name</label>
                            <input type="text" className="form-input-static" value={reviewData.supervisorName} readOnly />
                        </div>
                        <div className="info-item">
                            <label>Staff ID</label>
                            <input type="text" className="form-input-static" value={reviewData.staffId} readOnly />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label className="info-item"><label>Digital Signature</label></label>
                        <div className="signature-wrapper" style={{ border: '1px solid #ddd', borderRadius: '4px', background: '#f8f9fa' }}>
                            <canvas 
                                ref={canvasRef} 
                                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                                style={{ cursor: 'crosshair', width: '100%', height: '150px' }}
                            />
                        </div>
                        <button type="button" onClick={() => {
                            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                            setReviewData(prev => ({ ...prev, signature: '' }));
                        }} className="file-link" style={{ marginTop: '0.5rem', cursor: 'pointer', border: 'none' }}>
                            Clear Signature
                        </button>
                        {errors.signature && <p className="error-text" style={{color: '#A41034'}}>{errors.signature}</p>}
                    </div>
                </section>
            </div>

            {/* ACTION BUTTONS: Back and Submit */}
            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                    type="button" 
                    onClick={onBack} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: 'white', fontWeight: '600' }}
                >
                    Cancel / Back to Table
                </button>
                <button 
                    type="button" 
                    onClick={handleSubmit} 
                    className="btn-primary" 
                    style={{ flex: 2, background: '#A41034', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Finalize Decision
                </button>
            </div>
        </div>
    );
}

export default SupervisorReviewForm;