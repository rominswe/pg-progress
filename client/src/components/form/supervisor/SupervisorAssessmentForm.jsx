// import React, { useState } from 'react';

// // --- Static Configuration ---
// const RATING_CRITERIA = [
//     { id: 'researchProgress', label: 'Research Progress & Milestones' },
//     { id: 'qualityOfWork', label: 'Quality of Work Produced' },
//     { id: 'initiative', label: 'Initiative & Independence' },
//     { id: 'attendance', label: 'Attendance & Consultations' },
//     { id: 'englishProficiency', label: 'English Writing Proficiency' }
// ];

// const RECOMMENDATION_OPTS = ['Continue Study', 'Convert to Lower Degree', 'Terminate Study'];

// const SupervisorAssessmentForm = ({ studentData = {}, onBack }) => {
//     // --- State Management ---
//     const [formData, setFormData] = useState({
//         ratings: {
//             researchProgress: 0, qualityOfWork: 0, initiative: 0, attendance: 0, englishProficiency: 0
//         },
//         hasIssues: null,
//         issueDescription: '',
//         milestones: '',
//         nextSemesterPlan: '',
//         overallStatus: '',
//         recommendation: '',
//         supervisorComments: '',
//         evaluationDate: new Date().toISOString().split('T')[0]
//     });

//     const isAtRisk = formData.overallStatus === 'Unsatisfactory';

//     // --- Handlers ---
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleRatingChange = (criterion, value) => {
//         setFormData(prev => ({
//             ...prev,
//             ratings: { ...prev.ratings, [criterion]: parseInt(value) }
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log("Submitted:", { student: studentData.fullName, formData });
//         alert("Assessment submitted successfully!");
//         onBack();
//     };

//     // --- Render Helpers ---
//     const renderField = (label, value, readOnly = true) => (
//         <div className="field-group">
//             <label>{label}</label>
//             <input type="text" value={value || "N/A"} readOnly={readOnly} className={readOnly ? "read-only" : ""} />
//         </div>
//     );

//     const renderTextarea = (label, name, value, required = false, placeholder = "") => (
//         <div className="field-group full-width">
//             <label>{label} {required && <span className="required">*</span>}</label>
//             <textarea
//                 name={name}
//                 value={value}
//                 onChange={handleChange}
//                 rows="3"
//                 placeholder={placeholder}
//                 className={readOnly ? "read-only-area" : ""} 
//                 {...(name === undefined ? { readOnly: true } : {})} // Handle read-only logic if needed
//             />
//         </div>
//     );

//     // --- Main Render ---
//     return (
//         <div className="evaluation-portal">
//             <header className="form-header">
//                 <h1>Postgraduate Progress Assessment</h1>
//                 <p className="subtitle">Academic Supervisor Evaluation Portal</p>
//                 <button type="button" onClick={onBack} className="radio-pill back-btn">
//                     ← Back to Student List
//                 </button>
//             </header>

//             <form onSubmit={handleSubmit} className="assessment-form">
                
//                 {/* 1. Student Information */}
//                 <section className="glass-panel fade-in">
//                     <h2>1. Student Information</h2>
//                     <div className="grid-2">
//                         {renderField("Student Name", studentData.fullName)}
//                         {renderField("Student ID", studentData.studentId)}
//                         {renderField("Semester Session", studentData.semester || "Oct 2025/2026")}
//                     </div>
//                     <div className="field-group full-width">
//                         <label>Current Research Topic</label>
//                         <textarea readOnly className="read-only-area" rows="2" value={studentData.researchTopic || "Not provided"} />
//                     </div>
//                 </section>

//                 {/* 2. Performance Ratings */}
//                 <section className="glass-panel">
//                     <h2>2. Performance Ratings</h2>
//                     <p className="subtitle small-text">Rate performance (1 = Poor, 5 = Excellent)</p>
//                     <div className="rating-matrix">
//                         {RATING_CRITERIA.map((c) => (
//                             <div key={c.id} className="rating-row">
//                                 <span className="rating-label">{c.label}</span>
//                                 <div className="rating-options">
//                                     {[1, 2, 3, 4, 5].map((score) => (
//                                         <label key={score} className={`rating-chip ${formData.ratings[c.id] === score ? 'selected' : ''}`}>
//                                             <input 
//                                                 type="radio" 
//                                                 name={c.id} 
//                                                 value={score} 
//                                                 checked={formData.ratings[c.id] === score}
//                                                 onChange={() => handleRatingChange(c.id, score)} 
//                                             />
//                                             {score}
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* 3. Progress & Issues */}
//                 <section className="glass-panel">
//                     <h2>3. Progress & Issues</h2>
//                     <div className="field-group">
//                         <label className="question-label">Significant issues encountered?</label>
//                         <div className="radio-group">
//                             <label className={`radio-pill ${formData.hasIssues === true ? 'active-yes' : ''}`}>
//                                 <input type="radio" name="hasIssues" onChange={() => setFormData(p => ({ ...p, hasIssues: true }))} /> Yes
//                             </label>
//                             <label className={`radio-pill ${formData.hasIssues === false ? 'active-no' : ''}`}>
//                                 <input type="radio" name="hasIssues" onChange={() => setFormData(p => ({ ...p, hasIssues: false }))} /> No
//                             </label>
//                         </div>
//                     </div>

//                     {formData.hasIssues && (
//                         <div className="field-group full-width fade-in">
//                             <label className="warning-text">Describe the issues:</label>
//                             <textarea 
//                                 name="issueDescription" 
//                                 value={formData.issueDescription} 
//                                 onChange={handleChange} 
//                                 placeholder="Detail specific challenges..." 
//                                 rows="3" 
//                             />
//                         </div>
//                     )}

//                     {renderTextarea("Milestones Achieved", "milestones", formData.milestones)}
//                     {renderTextarea("Plan for Next Semester", "nextSemesterPlan", formData.nextSemesterPlan)}
//                 </section>

//                 {/* 4. Final Recommendation */}
//                 <section className={`glass-panel critical-section ${isAtRisk ? 'at-risk-border' : ''}`}>
//                     <h2>4. Final Recommendation</h2>
//                     <div className="field-group">
//                         <label>Overall Progress Status <span className="required">*</span></label>
//                         <select 
//                             name="overallStatus" 
//                             value={formData.overallStatus} 
//                             onChange={handleChange} 
//                             required
//                             className={formData.overallStatus === 'Unsatisfactory' ? 'status-unsatisfactory' : formData.overallStatus === 'Satisfactory' ? 'status-satisfactory' : ''}
//                         >
//                             <option value="">Select Status</option>
//                             <option value="Satisfactory">Satisfactory (S)</option>
//                             <option value="Unsatisfactory">Unsatisfactory (US)</option>
//                         </select>
//                     </div>

//                     <div className="field-group">
//                         <label>Recommendation for Faculty</label>
//                         <div className="radio-stack">
//                             {RECOMMENDATION_OPTS.map((opt) => (
//                                 <label key={opt} className="radio-row">
//                                     <input 
//                                         type="radio" 
//                                         name="recommendation" 
//                                         value={opt} 
//                                         checked={formData.recommendation === opt} 
//                                         onChange={handleChange} 
//                                     />
//                                     {opt}
//                                 </label>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* 5. Supervisor Declaration */}
//                 <section className="glass-panel">
//                     <h2>5. Supervisor Declaration</h2>
//                     {renderTextarea("Supervisor Comments (Optional)", "supervisorComments", formData.supervisorComments)}
//                     <div className="field-group">
//                         <label>Date of Evaluation</label>
//                         <input type="date" name="evaluationDate" value={formData.evaluationDate} onChange={handleChange} />
//                     </div>
//                 </section>

//                 <div className="form-actions">
//                     <button type="submit" className="submit-btn">Submit Final Assessment</button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default SupervisorAssessmentForm;

import React, { useState } from 'react';

// --- Static Configuration ---
const RATING_CRITERIA = [
    { id: 'researchProgress', label: 'Research Progress & Milestones' },
    { id: 'qualityOfWork', label: 'Quality of Work Produced' },
    { id: 'initiative', label: 'Initiative & Independence' },
    { id: 'attendance', label: 'Attendance & Consultations' },
    { id: 'englishProficiency', label: 'English Writing Proficiency' }
];

const RECOMMENDATION_OPTS = ['Continue Study', 'Convert to Lower Degree', 'Terminate Study'];

const SupervisorAssessmentForm = ({ studentData = {}, onBack }) => {
    // --- State Management ---
    const [formData, setFormData] = useState({
        ratings: {
            researchProgress: 0, qualityOfWork: 0, initiative: 0, attendance: 0, englishProficiency: 0
        },
        hasIssues: null,
        issueDescription: '',
        milestones: '',
        nextSemesterPlan: '',
        overallStatus: '',
        recommendation: '',
        supervisorComments: '',
        evaluationDate: new Date().toISOString().split('T')[0]
    });

    const isAtRisk = formData.overallStatus === 'Unsatisfactory';

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (criterion, value) => {
        setFormData(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [criterion]: parseInt(value) }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted:", { student: studentData.fullName, formData });
        alert("Assessment submitted successfully!");
        onBack();
    };

    // --- Render Helpers ---
    const renderReadOnly = (label, value) => (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}</label>
            <input 
                type="text" 
                value={value || "N/A"} 
                readOnly 
                style={{ ...styles.input, backgroundColor: '#f9f9f9', color: '#555' }} 
            />
        </div>
    );

    const renderTextarea = (label, name, value, placeholder = "") => (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={handleChange}
                rows="3"
                placeholder={placeholder}
                style={styles.textarea}
            />
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '22px' }}>Progress Assessment</h1>
                    <button onClick={onBack} style={styles.backBtn}>← Back to List</button>
                </div>
                <p style={{ margin: '5px 0 0', color: '#666' }}>Evaluation for: <strong>{studentData.fullName}</strong></p>
            </div>

            <form onSubmit={handleSubmit}>
                
                {/* 1. Student Information */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>1. Student Information</h2>
                    <div style={styles.grid2}>
                        {renderReadOnly("Student ID", studentData.studentId)}
                        {renderReadOnly("Semester", studentData.semester || "Oct 2025/2026")}
                    </div>
                    {renderReadOnly("Research Topic", studentData.researchTopic)}
                </section>

                {/* 2. Performance Ratings */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>2. Performance Ratings (1-5)</h2>
                    <div style={styles.ratingTable}>
                        {RATING_CRITERIA.map((c) => (
                            <div key={c.id} style={styles.ratingRow}>
                                <span style={{ flex: 1, fontWeight: '500' }}>{c.label}</span>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            type="button"
                                            onClick={() => handleRatingChange(c.id, score)}
                                            style={{
                                                ...styles.ratingBtn,
                                                backgroundColor: formData.ratings[c.id] === score ? '#007bff' : '#eee',
                                                color: formData.ratings[c.id] === score ? '#fff' : '#333'
                                            }}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Progress & Issues */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>3. Progress & Issues</h2>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Significant issues encountered?</label>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <label style={{ cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="hasIssues" 
                                    checked={formData.hasIssues === true}
                                    onChange={() => setFormData(p => ({ ...p, hasIssues: true }))} 
                                /> Yes
                            </label>
                            <label style={{ cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="hasIssues" 
                                    checked={formData.hasIssues === false}
                                    onChange={() => setFormData(p => ({ ...p, hasIssues: false }))} 
                                /> No
                            </label>
                        </div>
                    </div>

                    {formData.hasIssues && renderTextarea("Describe the issues:", "issueDescription", formData.issueDescription)}
                    {renderTextarea("Milestones Achieved", "milestones", formData.milestones)}
                    {renderTextarea("Plan for Next Semester", "nextSemesterPlan", formData.nextSemesterPlan)}
                </section>

                {/* 4. Final Recommendation */}
                <section style={{ 
                    ...styles.section, 
                    border: isAtRisk ? '2px solid #dc3545' : '1px solid #eee',
                    backgroundColor: isAtRisk ? '#fff5f5' : '#fff'
                }}>
                    <h2 style={{ ...styles.sectionTitle, color: isAtRisk ? '#dc3545' : '#333' }}>
                        4. Final Recommendation
                    </h2>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Overall Progress Status <span style={{color:'red'}}>*</span></label>
                        <select 
                            name="overallStatus" 
                            value={formData.overallStatus} 
                            onChange={handleChange} 
                            required
                            style={styles.input}
                        >
                            <option value="">Select Status...</option>
                            <option value="Satisfactory">Satisfactory (S)</option>
                            <option value="Unsatisfactory">Unsatisfactory (US)</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Recommendation</label>
                        {RECOMMENDATION_OPTS.map((opt) => (
                            <div key={opt} style={{ marginBottom: '5px' }}>
                                <label style={{ cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="recommendation" 
                                        value={opt} 
                                        checked={formData.recommendation === opt} 
                                        onChange={handleChange} 
                                        style={{ marginRight: '8px' }}
                                    />
                                    {opt}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Declaration */}
                <section style={{ marginTop: '20px' }}>
                    {renderTextarea("Supervisor Comments", "supervisorComments", formData.supervisorComments)}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Date</label>
                        <input type="date" name="evaluationDate" value={formData.evaluationDate} onChange={handleChange} style={styles.input} />
                    </div>
                    
                    <button type="submit" style={styles.submitBtn}>Submit Assessment</button>
                </section>

            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px', margin: '20px auto', padding: '30px',
        backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, sans-serif'
    },
    header: { marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
    backBtn: { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' },
    section: { marginBottom: '25px', padding: '20px', borderRadius: '6px', border: '1px solid #eee' },
    sectionTitle: { fontSize: '18px', marginBottom: '15px', color: '#333', marginTop: 0 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#444' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit' },
    ratingTable: { display: 'flex', flexDirection: 'column', gap: '10px' },
    ratingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
    ratingBtn: { width: '30px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }
};

export default SupervisorAssessmentForm;