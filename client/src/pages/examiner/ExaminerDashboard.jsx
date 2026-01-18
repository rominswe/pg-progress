import React, { useState, useEffect } from 'react';
import ThesisEvaluationForm from '@/components/form/examiner/ThesisEvaluationForm.jsx';
import DocumentViewer from '@/components/DocumentViewer.jsx';
import { useAuth } from '@/components/auth/AuthContext';
import { dashboardService, defenseEvaluationService } from '@/services/api';
import { Eye } from 'lucide-react';

const ExaminerDashboard = () => {
    const { logout } = useAuth();

    // State for Views
    const [view, setView] = useState('list');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for Logout Confirmation
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Data State
    const [students, setStudents] = useState([]);

    // Fetch Students on Mount
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await dashboardService.getExaminerStudents();
                setStudents(res.data?.students || []);
            } catch (error) {
                console.error("Failed to fetch students:", error);
                // alert("Failed to load students.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleEvaluateClick = (student) => {
        console.log("Evaluating student:", student);
        setSelectedStudent(student);
        setView('form');
    };

    const handleFormSubmit = async (data) => {
        console.log("Submitting Evaluation:", data);

        try {
            // Calculate overall rating
            const { originality, methodology, analysis, presentation } = data.ratings;
            const overall = Math.round((originality + methodology + analysis + presentation) / 4);

            const payload = {
                student_id: data.studentId,
                student_name: selectedStudent.fullName,
                defense_type: selectedStudent.defenseType || 'Research Proposal',
                semester: selectedStudent.semester || '2023/2024',
                knowledge_rating: originality,
                organization_rating: methodology,
                response_rating: analysis,
                presentation_rating: presentation,
                overall_rating: overall,
                strengths: data.comments, // Using comments as strengths/general feedback
                recommendations: data.finalRemarks,
                final_comments: data.finalRemarks,
                viva_outcome: data.vivaOutcome,
                evaluation_date: data.vivaDate
            };

            await defenseEvaluationService.submitEvaluation(payload);

            alert("Evaluation submitted successfully!");

            // Refresh list
            const res = await dashboardService.getExaminerStudents();
            setStudents(res.data?.students || []);

            setView('list');
            setSelectedStudent(null);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit evaluation. Please try again.");
        }
    };

    const onLogoutConfirm = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    // --- RENDER DASHBOARD ---
    if (view === 'viewer' && selectedStudent) {
        return (
            <DocumentViewer
                documentId={selectedStudent.documentId}
                documentName={selectedStudent.thesisTitle}
                onClose={() => {
                    console.log("DocumentViewer - Back button clicked");
                    setView('list');
                    setSelectedStudent(null);
                }}
            />
        );
    }

    if (view === 'form' && selectedStudent) {
        return (
            <ThesisEvaluationForm
                studentData={selectedStudent}
                existingData={selectedStudent.evaluationData}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                    console.log("Back button clicked - Returning to list view");
                    setView('list');
                    setSelectedStudent(null);
                }}
            />
        );
    }

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading students...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Header section simplified as Layout handles main title */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={styles.title}>Welcome, Examiner</h1>
                <p style={styles.subtitle}>You have {students.length} students assigned for evaluation.</p>
            </div>

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
                                    <div style={{ fontWeight: 'bold' }}>{student.fullName}</div>
                                    <div style={{ fontSize: '12px', color: '#777' }}>{student.studentId}</div>
                                    <div style={{ fontSize: '11px', color: '#007bff' }}>{student.programme}</div>
                                </td>
                                <td style={{ ...styles.td, maxWidth: '300px' }}>
                                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{student.thesisTitle}</div>
                                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {student.defenseType}
                                    </div>
                                    {student.documentId && (
                                        <button
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setView('viewer');
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '11px',
                                                marginTop: '8px',
                                                color: '#007bff',
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Eye size={14} />
                                            View Document (Read-Only)
                                        </button>
                                    )}
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
                                        {student.status === 'Submitted' ? 'Evaluate' : 'Start Evaluation'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && <div style={{ padding: '20px', textAlign: 'center' }}>No students assigned.</div>}
            </div>

            {/* Logout Confirmation Modal */}
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

    // Modal Styles
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
