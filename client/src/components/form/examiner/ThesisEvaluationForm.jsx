import React, { useState } from 'react';

const CRITERIA = [
    { id: 'originality', label: 'Originality & Contribution' },
    { id: 'methodology', label: 'Research Methodology' },
    { id: 'analysis', label: 'Data Analysis & Interpretation' },
    { id: 'presentation', label: 'Thesis Presentation & Clarity' }
];

const VIVA_OUTCOMES = ['Pass', 'Minor Corrections', 'Major Corrections', 'Fail'];

const ThesisEvaluationForm = ({ studentData, onSubmit, onCancel, existingData = null }) => {
    const isReadOnly = !!existingData; // If data exists, it's read-only
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(existingData || {
        ratings: { originality: 0, methodology: 0, analysis: 0, presentation: 0 },
        comments: '',
        vivaDate: new Date().toISOString().split('T')[0],
        vivaOutcome: '',
        finalRemarks: ''
    });

    const handleChange = (field, value) => {
        if (isReadOnly) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRating = (criterion, score) => {
        if (isReadOnly) return;
        setFormData(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [criterion]: score }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation
        if (step === 2 && !formData.vivaOutcome) {
            alert("Please select a Viva Voce outcome.");
            return;
        }
        onSubmit({ ...formData, studentId: studentData.id });
    };

    const renderReadOnly = (label, value) => (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}</label>
            <div style={styles.readOnlyField}>{value || 'N/A'}</div>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0 }}>Thesis Evaluation & Viva Voce</h2>
                    <button onClick={onCancel} style={styles.backBtn}>← Back to Dashboard</button>
                </div>
                <div style={styles.studentInfoBar}>
                    <strong>Candidate:</strong> {studentData.fullName} | 
                    <strong> ID:</strong> {studentData.studentId} | 
                    <strong style={{marginLeft:'10px'}}>Thesis:</strong> {studentData.thesisTitle}
                </div>
            </div>

            {/* Step Navigation */}
            <div style={styles.stepContainer}>
                <div style={{...styles.step, ...(step === 1 ? styles.activeStep : {})}} onClick={() => setStep(1)}>1. Thesis Assessment</div>
                <div style={{...styles.step, ...(step === 2 ? styles.activeStep : {})}} onClick={() => setStep(2)}>2. Viva Voce Result</div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* STEP 1: THESIS EVALUATION */}
                {step === 1 && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Thesis Assessment Criteria (1-5)</h3>
                        {CRITERIA.map(c => (
                            <div key={c.id} style={styles.ratingRow}>
                                <span style={{ flex: 1 }}>{c.label}</span>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <div
                                            key={score}
                                            onClick={() => handleRating(c.id, score)}
                                            style={{
                                                ...styles.ratingBox,
                                                backgroundColor: formData.ratings[c.id] === score ? '#007bff' : '#f0f0f0',
                                                color: formData.ratings[c.id] === score ? '#fff' : '#333',
                                                cursor: isReadOnly ? 'default' : 'pointer'
                                            }}
                                        >
                                            {score}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Detailed Comments on Thesis</label>
                            <textarea
                                rows="4"
                                style={styles.textarea}
                                value={formData.comments}
                                onChange={(e) => handleChange('comments', e.target.value)}
                                readOnly={isReadOnly}
                                placeholder="Enter your detailed observations here..."
                            />
                        </div>
                        
                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button type="button" onClick={() => setStep(2)} style={styles.primaryBtn}>Next: Viva Voce →</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: VIVA RESULT */}
                {step === 2 && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Viva Voce Outcome</h3>
                        
                        <div style={styles.grid2}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date of Viva</label>
                                <input 
                                    type="date" 
                                    style={styles.input} 
                                    value={formData.vivaDate} 
                                    onChange={(e) => handleChange('vivaDate', e.target.value)}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Final Recommendation <span style={{color:'red'}}>*</span></label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {VIVA_OUTCOMES.map(opt => (
                                    <label key={opt} style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="vivaOutcome"
                                            value={opt}
                                            checked={formData.vivaOutcome === opt}
                                            onChange={(e) => handleChange('vivaOutcome', e.target.value)}
                                            disabled={isReadOnly}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Examiner's Final Remarks</label>
                            <textarea
                                rows="3"
                                style={styles.textarea}
                                value={formData.finalRemarks}
                                onChange={(e) => handleChange('finalRemarks', e.target.value)}
                                readOnly={isReadOnly}
                            />
                        </div>

                        <div style={styles.footerActions}>
                            <button type="button" onClick={() => setStep(1)} style={styles.secondaryBtn}>← Back</button>
                            {!isReadOnly && (
                                <button type="submit" style={styles.submitBtn}>Submit Final Evaluation</button>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

// CSS-in-JS Styles
const styles = {
    container: { maxWidth: '900px', margin: '30px auto', backgroundColor: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontFamily: 'system-ui, sans-serif' },
    header: { borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' },
    studentInfoBar: { backgroundColor: '#f8f9fa', padding: '10px 15px', borderRadius: '4px', marginTop: '10px', fontSize: '14px', color: '#555' },
    backBtn: { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' },
    stepContainer: { display: 'flex', borderBottom: '2px solid #eee', marginBottom: '25px' },
    step: { padding: '10px 20px', cursor: 'pointer', color: '#999', fontWeight: '500' },
    activeStep: { borderBottom: '2px solid #007bff', color: '#007bff', marginBottom: '-2px' },
    section: { animation: 'fadeIn 0.3s' },
    sectionTitle: { marginTop: 0, color: '#333', fontSize: '18px' },
    ratingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f9f9f9' },
    ratingBox: { width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '5px', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#444', textTransform: 'uppercase' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    radioLabel: { display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fafafa' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    footerActions: { display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' },
    primaryBtn: { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
    secondaryBtn: { backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
    submitBtn: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    readOnlyField: { padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '4px', color: '#555' }
};

export default ThesisEvaluationForm;