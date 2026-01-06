import React, { useState } from 'react';

const SupervisorAssessmentForm = ({ studentData, onBack }) => {
    // Initial State following your provided structure
    const [formData, setFormData] = useState({
        ratings: {
            researchProgress: 0,
            qualityOfWork: 0,
            initiative: 0,
            attendance: 0,
            englishProficiency: 0
        },
        hasIssues: null, // true/false
        issueDescription: '',
        milestones: '',
        nextSemesterPlan: '',
        overallStatus: '',
        recommendation: '',
        supervisorComments: '',
        evaluationDate: new Date().toISOString().split('T')[0]
    });

    // Handle standard inputs/textareas
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Rating Matrix (1-5)
    const handleRatingChange = (criterion, value) => {
        setFormData(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [criterion]: parseInt(value) }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted for:", studentData.fullName, formData);
        alert("Assessment submitted successfully!");
        onBack(); // Return to table view
    };

    // Derived state for the "Unsatisfactory" red glow/border in your CSS
    const isAtRisk = formData.overallStatus === 'Unsatisfactory';

    return (
        <div className="evaluation-portal">
            <header className="form-header">
                <h1>Postgraduate Progress Assessment</h1>
                <p className="subtitle">Academic Supervisor Evaluation Portal</p>
                
                {/* Back Button using your radio-pill styling */}
                <button 
                    type="button" 
                    onClick={onBack} 
                    className="radio-pill" 
                    style={{ margin: '1.5rem auto', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    ← Back to Student List
                </button>
            </header>

            <form onSubmit={handleSubmit} className="assessment-form">
                
                {/* SECTION 1: STUDENT INFO (Read-Only) */}
                <section className="glass-panel fade-in">
                    <h2>1. Student Information</h2>
                    <div className="grid-2">
                        <div className="field-group">
                            <label>Student Name</label>
                            <input type="text" value={studentData?.fullName || "N/A"} readOnly className="read-only" />
                        </div>
                        <div className="field-group">
                            <label>Student ID</label>
                            <input type="text" value={studentData?.studentId || "N/A"} readOnly className="read-only" />
                        </div>
                        <div className="field-group">
                            <label>Semester Session</label>
                            <input type="text" value={studentData?.semester || "Oct 2025/2026"} readOnly className="read-only" />
                        </div>
                    </div>
                    <div className="field-group full-width">
                        <label>Current Research Topic</label>
                        <textarea 
                            readOnly 
                            className="read-only-area" 
                            value={studentData?.researchTopic || "Topic not provided"}
                            rows="2"
                        ></textarea>
                    </div>
                </section>

                {/* SECTION 2: PERFORMANCE RATINGS */}
                <section className="glass-panel">
                    <h2>2. Performance Ratings</h2>
                    <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Rate performance (1 = Poor, 5 = Excellent)
                    </p>
                    <div className="rating-matrix">
                        {[
                            { id: 'researchProgress', label: 'Research Progress & Milestones' },
                            { id: 'qualityOfWork', label: 'Quality of Work Produced' },
                            { id: 'initiative', label: 'Initiative & Independence' },
                            { id: 'attendance', label: 'Attendance & Consultations' },
                            { id: 'englishProficiency', label: 'English Writing Proficiency' }
                        ].map((criterion) => (
                            <div key={criterion.id} className="rating-row">
                                <span className="rating-label">{criterion.label}</span>
                                <div className="rating-options">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <label 
                                            key={score} 
                                            className={`rating-chip ${formData.ratings[criterion.id] === score ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={criterion.id}
                                                value={score}
                                                checked={formData.ratings[criterion.id] === score}
                                                onChange={() => handleRatingChange(criterion.id, score)}
                                            />
                                            {score}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3: PROGRESS & ISSUES */}
                <section className="glass-panel">
                    <h2>3. Progress & Issues</h2>
                    <div className="field-group">
                        <label className="question-label">Did the student face significant issues this semester?</label>
                        <div className="radio-group">
                            <label className={`radio-pill ${formData.hasIssues === true ? 'active-yes' : ''}`}>
                                <input
                                    type="radio"
                                    name="hasIssues"
                                    onChange={() => setFormData(prev => ({ ...prev, hasIssues: true }))}
                                /> Yes
                            </label>
                            <label className={`radio-pill ${formData.hasIssues === false ? 'active-no' : ''}`}>
                                <input
                                    type="radio"
                                    name="hasIssues"
                                    onChange={() => setFormData(prev => ({ ...prev, hasIssues: false }))}
                                /> No
                            </label>
                        </div>
                    </div>

                    {formData.hasIssues && (
                        <div className="field-group full-width fade-in">
                            <label className="warning-text">Describe the issues encountered:</label>
                            <textarea
                                name="issueDescription"
                                value={formData.issueDescription}
                                onChange={handleChange}
                                placeholder="Please detail the specific challenges..."
                                rows="3"
                            ></textarea>
                        </div>
                    )}

                    <div className="field-group full-width">
                        <label>Milestones Achieved</label>
                        <textarea
                            name="milestones"
                            value={formData.milestones}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="field-group full-width">
                        <label>Plan for Next Semester</label>
                        <textarea
                            name="nextSemesterPlan"
                            value={formData.nextSemesterPlan}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>
                </section>

                {/* SECTION 4: FINAL RECOMMENDATION */}
                {/* Adds 'at-risk-border' class dynamically from your CSS */}
                <section className={`glass-panel critical-section ${isAtRisk ? 'at-risk-border' : ''}`}>
                    <h2>4. Final Recommendation</h2>
                    <div className="field-group">
                        <label>Overall Progress Status <span className="required">*</span></label>
                        <select
                            name="overallStatus"
                            value={formData.overallStatus}
                            onChange={handleChange}
                            required
                            className={
                                formData.overallStatus === 'Unsatisfactory' 
                                ? 'status-unsatisfactory' 
                                : formData.overallStatus === 'Satisfactory' 
                                ? 'status-satisfactory' 
                                : ''
                            }
                        >
                            <option value="">Select Status</option>
                            <option value="Satisfactory">Satisfactory (S)</option>
                            <option value="Unsatisfactory">Unsatisfactory (US)</option>
                        </select>
                    </div>

                    <div className="field-group">
                        <label>Recommendation for Faculty</label>
                        <div className="radio-stack">
                            {['Continue Study', 'Convert to Lower Degree', 'Terminate Study'].map((opt) => (
                                <label key={opt} className="radio-row">
                                    <input
                                        type="radio"
                                        name="recommendation"
                                        value={opt}
                                        checked={formData.recommendation === opt}
                                        onChange={handleChange}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 5: SUPERVISOR DECLARATION */}
                <section className="glass-panel">
                    <h2>5. Supervisor Declaration</h2>
                    <div className="field-group full-width">
                        <label>Supervisor Comments (Optional)</label>
                        <textarea
                            name="supervisorComments"
                            value={formData.supervisorComments}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="field-group">
                        <label>Date of Evaluation</label>
                        <input
                            type="date"
                            name="evaluationDate"
                            value={formData.evaluationDate}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        Submit Final Assessment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupervisorAssessmentForm;