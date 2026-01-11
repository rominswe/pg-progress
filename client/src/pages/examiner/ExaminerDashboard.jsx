import React, { useState } from 'react';
import ThesisEvaluationForm from '../../components/form/examiner/ThesisEvaluationForm';
import { useAuth } from '@/components/auth/AuthContext'; 

const ExaminerDashboard = () => {
    const { logout } = useAuth(); 
    
    // State for Views
    const [view, setView] = useState('list'); 
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    // ✅ NEW: State for Logout Confirmation
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Mock Data
    const [students, setStudents] = useState([
        { 
            id: 1, fullName: 'Ahmed Ali', studentId: 'PG2023-099', 
            programme: 'PhD in Computer Science', thesisTitle: 'AI in Healthcare Optimization', 
            status: 'Pending' 
        },
        { 
            id: 2, fullName: 'Sarah Tan', studentId: 'PG2023-102', 
            programme: 'Master of Engineering', thesisTitle: 'Sustainable Concrete Materials', 
            status: 'Submitted',
            evaluationData: {
                ratings: { originality: 4, methodology: 5, analysis: 4, presentation: 5 },
                comments: 'Excellent work.',
                vivaDate: '2023-11-15',
                vivaOutcome: 'Pass',
                finalRemarks: 'Approved without corrections.'
            }
        }
    ]);

    const handleEvaluateClick = (student) => {
        setSelectedStudent(student);
        setView('form');
    };

    const handleFormSubmit = (data) => {
        console.log("Submitting Evaluation:", data);
        setStudents(prev => prev.map(s => 
            s.id === data.studentId ? { ...s, status: 'Submitted', evaluationData: data } : s
        ));
        alert("Evaluation submitted successfully!");
        setView('list');
        setSelectedStudent(null);
    };

    // ✅ NEW: Handle Logout Confirmation
    const onLogoutConfirm = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    // --- RENDER DASHBOARD ---
    if (view === 'form' && selectedStudent) {
        return (
            <ThesisEvaluationForm 
                studentData={selectedStudent}
                existingData={selectedStudent.evaluationData}
                onSubmit={handleFormSubmit}
                onCancel={() => { setView('list'); setSelectedStudent(null); }}
            />
        );
    }

    return (
        <div style={styles.container}>
            {/* Header with Logout */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Examiner Portal</h1>
                    <p style={styles.subtitle}>Assigned Students for Viva Voce & Thesis Evaluation</p>
                </div>
                {/* ✅ UPDATED: Button opens the confirmation modal */}
                <button onClick={() => setShowLogoutConfirm(true)} style={styles.logoutBtn}>
                    Log Out
                </button>
            </header>

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.trHead}>
                            <th style={styles.th}>Student Details</th>
                            <th style={styles.th}>Thesis Title</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.thRight}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={{fontWeight:'bold'}}>{student.fullName}</div>
                                    <div style={{fontSize:'12px', color:'#777'}}>{student.studentId}</div>
                                    <div style={{fontSize:'11px', color:'#007bff'}}>{student.programme}</div>
                                </td>
                                <td style={{...styles.td, maxWidth:'300px'}}>
                                    {student.thesisTitle}
                                </td>
                                <td style={styles.td}>
                                    <span style={student.status === 'Submitted' ? styles.badgeSuccess : styles.badgeWarning}>
                                        {student.status}
                                    </span>
                                </td>
                                <td style={styles.tdRight}>
                                    <button 
                                        onClick={() => handleEvaluateClick(student)}
                                        style={student.status === 'Submitted' ? styles.btnOutline : styles.btnPrimary}
                                    >
                                        {student.status === 'Submitted' ? 'View Result' : 'Start Evaluation'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && <div style={{padding:'20px', textAlign:'center'}}>No students assigned.</div>}
            </div>

            {/* ✅ NEW: Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <h3 style={styles.modalTitle}>Confirm Log Out</h3>
                        <p style={styles.modalText}>Are you sure you want to exit the Examiner Portal?</p>
                        <div style={styles.modalActions}>
                            <button 
                                onClick={() => setShowLogoutConfirm(false)} 
                                style={styles.btnCancel}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onLogoutConfirm} 
                                style={styles.btnDestructive}
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' },
    header: { marginBottom: '30px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { margin: '0 0 10px 0', fontSize: '28px', color: '#2c3e50' },
    subtitle: { margin: 0, color: '#6c757d' },
    
    // Buttons
    logoutBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    btnPrimary: { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
    btnOutline: { backgroundColor: '#fff', color: '#007bff', border: '1px solid #007bff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
    
    // Table Styles
    tableCard: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    trHead: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' },
    tr: { borderBottom: '1px solid #f1f1f1' },
    th: { textAlign: 'left', padding: '15px', color: '#495057', fontWeight: '600' },
    thRight: { textAlign: 'right', padding: '15px', color: '#495057', fontWeight: '600' },
    td: { padding: '15px', verticalAlign: 'middle', color: '#333' },
    tdRight: { padding: '15px', textAlign: 'right', verticalAlign: 'middle' },
    badgeSuccess: { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    badgeWarning: { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },

    // ✅ NEW: Modal Styles
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    modalBox: {
        backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center'
    },
    modalTitle: { margin: '0 0 10px 0', fontSize: '20px', color: '#333' },
    modalText: { margin: '0 0 25px 0', color: '#666' },
    modalActions: { display: 'flex', justifyContent: 'center', gap: '15px' },
    btnCancel: {
        padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#555'
    },
    btnDestructive: {
        padding: '10px 20px', border: 'none', borderRadius: '6px', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold'
    }
};

export default ExaminerDashboard;