import React, { useState } from 'react';
import SupervisorAssessmentForm from '../../components/form/supervisor/SupervisorAssessmentForm';

const ProgressEvaluation = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Mock data for students awaiting evaluation
    const [reports] = useState([
        { id: 1, fullName: "Alex Johnson", studentId: "PG2023001", semester: "Oct 2025/2026", researchTopic: "AI in Renewable Energy" },
        { id: 2, fullName: "Sarah Connor", studentId: "PG2023045", semester: "Oct 2025/2026", researchTopic: "Cybernetic Systems" }
    ]);

    // If a student is selected, show the form (which is also wrapped in evaluation-portal)
    if (selectedStudent) {
        return <SupervisorAssessmentForm studentData={selectedStudent} onBack={() => setSelectedStudent(null)} />;
    }

    return (
        /* 1. Change the wrapper to evaluation-portal to trigger your Section 3 CSS */
        <div className="evaluation-portal"> 
            
            <header className="form-header">
                <h1>Progress Report Inbox</h1>
                <p className="subtitle">Pending Evaluations for Semester Oct 2025/2026</p>
            </header>

            {/* 2. Glass Panel container for the table */}
            <div className="glass-panel fade-in">
                <table className="request-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1.2rem' }}>Student Details</th>
                            <th style={{ padding: '1.2rem' }}>Research Topic</th>
                            <th style={{ padding: '1.2rem', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1.5rem 1.2rem' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{report.fullName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{report.studentId}</div>
                                </td>
                                <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9 }}>
                                    {report.researchTopic}
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                    {/* 3. Using your scoped submit-btn class */}
                                    <button 
                                        onClick={() => setSelectedStudent(report)}
                                        className="submit-btn" 
                                        style={{ 
                                            padding: '0.6rem 1.5rem', 
                                            fontSize: '0.85rem', 
                                            width: 'auto',
                                            minWidth: '100px'
                                        }}
                                    >
                                        Evaluate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Optional empty state */}
            {reports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No pending progress reports found for this semester.
                </div>
            )}
        </div>
    );
};

export default ProgressEvaluation;