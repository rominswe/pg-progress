// import React, { useState } from 'react';
// import SupervisorAssessmentForm from '../../components/form/supervisor/SupervisorAssessmentForm';

// const ProgressEvaluation = () => {
//     const [selectedStudent, setSelectedStudent] = useState(null);

//     // Mock data for students awaiting evaluation
//     const [reports] = useState([
//         { id: 1, fullName: "Alex Johnson", studentId: "PG2023001", semester: "Oct 2025/2026", researchTopic: "AI in Renewable Energy" },
//         { id: 2, fullName: "Sarah Connor", studentId: "PG2023045", semester: "Oct 2025/2026", researchTopic: "Cybernetic Systems" }
//     ]);

//     // If a student is selected, show the form (which is also wrapped in evaluation-portal)
//     if (selectedStudent) {
//         return <SupervisorAssessmentForm studentData={selectedStudent} onBack={() => setSelectedStudent(null)} />;
//     }

//     return (
//         /* 1. Change the wrapper to evaluation-portal to trigger your Section 3 CSS */
//         <div className="evaluation-portal"> 
            
//             <header className="form-header">
//                 <h1>Progress Report Inbox</h1>
//                 <p className="subtitle">Pending Evaluations for Semester Oct 2025/2026</p>
//             </header>

//             {/* 2. Glass Panel container for the table */}
//             <div className="glass-panel fade-in">
//                 <table className="request-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//                     <thead>
//                         <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
//                             <th style={{ padding: '1.2rem' }}>Student Details</th>
//                             <th style={{ padding: '1.2rem' }}>Research Topic</th>
//                             <th style={{ padding: '1.2rem', textAlign: 'center' }}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {reports.map(report => (
//                             <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
//                                 <td style={{ padding: '1.5rem 1.2rem' }}>
//                                     <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{report.fullName}</div>
//                                     <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{report.studentId}</div>
//                                 </td>
//                                 <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9 }}>
//                                     {report.researchTopic}
//                                 </td>
//                                 <td style={{ padding: '1.2rem', textAlign: 'center' }}>
//                                     {/* 3. Using your scoped submit-btn class */}
//                                     <button 
//                                         onClick={() => setSelectedStudent(report)}
//                                         className="submit-btn" 
//                                         style={{ 
//                                             padding: '0.6rem 1.5rem', 
//                                             fontSize: '0.85rem', 
//                                             width: 'auto',
//                                             minWidth: '100px'
//                                         }}
//                                     >
//                                         Evaluate
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Optional empty state */}
//             {reports.length === 0 && (
//                 <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
//                     No pending progress reports found for this semester.
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProgressEvaluation;

import React, { useState } from 'react';
import SupervisorAssessmentForm from '../../components/form/supervisor/SupervisorAssessmentForm';

const ProgressEvaluation = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Mock data
    const [reports] = useState([
        { id: 1, fullName: "Alex Johnson", studentId: "PG2023001", semester: "Oct 2025/2026", researchTopic: "AI in Renewable Energy" },
        { id: 2, fullName: "Sarah Connor", studentId: "PG2023045", semester: "Oct 2025/2026", researchTopic: "Cybernetic Systems Analysis" },
        { id: 3, fullName: "Michael Chen", studentId: "PG2024112", semester: "Oct 2025/2026", researchTopic: "Blockchain in Supply Chain" }
    ]);

    // VIEW: FORM (If a student is selected)
    if (selectedStudent) {
        return (
            <SupervisorAssessmentForm 
                studentData={selectedStudent} 
                onBack={() => setSelectedStudent(null)} 
            />
        );
    }

    // VIEW: DASHBOARD TABLE
    return (
        <div style={styles.mainContainer}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Progress Report Inbox</h1>
                <p style={{ margin: '5px 0 0', color: '#666' }}>Pending Evaluations for Oct 2025/2026</p>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={styles.th}>Student Details</th>
                            <th style={styles.th}>Research Topic</th>
                            <th style={styles.thAction}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>{report.fullName}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{report.studentId}</div>
                                </td>
                                <td style={styles.td}>
                                    {report.researchTopic}
                                </td>
                                <td style={styles.tdAction}>
                                    <button 
                                        onClick={() => setSelectedStudent(report)}
                                        style={styles.evaluateBtn}
                                    >
                                        Evaluate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {reports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No pending progress reports found.
                </div>
            )}
        </div>
    );
};

// Styles (Consistent with ReviewRequest)
const styles = {
    mainContainer: {
        maxWidth: '1000px',
        margin: '40px auto',
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
    },
    tableWrapper: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        color: '#495057',
        fontWeight: '600'
    },
    thAction: {
        textAlign: 'right',
        padding: '12px',
        color: '#495057',
        fontWeight: '600'
    },
    tr: {
        borderBottom: '1px solid #eee'
    },
    td: {
        padding: '12px',
        verticalAlign: 'middle',
        color: '#555'
    },
    tdAction: {
        padding: '12px',
        textAlign: 'right',
        verticalAlign: 'middle'
    },
    evaluateBtn: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: '0.2s'
    }
};

export default ProgressEvaluation;