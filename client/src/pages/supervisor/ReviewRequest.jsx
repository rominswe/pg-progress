// import { useState } from 'react';
// import SupervisorReviewForm from '../../components/form/supervisor/SupervisorReviewForm';

// const ReviewRequest = () => {
//   // 1. Mock Data
//   const [requests, setRequests] = useState([
//     { 
//       id: 1, 
//       fullName: "Alex Rivera", 
//       studentId: "AIU 22001234", 
//       program: "Doctor of Philosophy (Business Management)",
//       serviceCategory: "Extension of Study",
//       submissionDate: "2023-10-25",
//       currentEndDate: "2023-12-01",
//       requestedNewEndDate: "2024-06-01",
//       ganttChart: { name: "research_timeline.pdf" }
//     },
//     { 
//       id: 2, 
//       fullName: "Sarah Chen", 
//       studentId: "AIU 22005566", 
//       program: "Master of Education (by Research)",
//       serviceCategory: "Add/Drop Course",
//       submissionDate: "2023-10-26",
//       courseCode: "EDU702",
//       courseName: "Advanced Research Methods",
//       action: "Add"
//     },
//     { 
//       id: 3, 
//       fullName: "Marcus Tan", 
//       studentId: "AIU 21009988", 
//       program: "Master of Business Management (by Research)",
//       serviceCategory: "Deferment of Study",
//       submissionDate: "2023-10-27",
//       defermentReason: "Medical recovery required after surgery.",
//       resumingSemester: "Semester 2, 2024",
//       supportingDocument: { name: "medical_cert.pdf" }
//     }
//   ]);

//   const [selectedRequest, setSelectedRequest] = useState(null);

//   const handleDecision = (result) => {
//     console.log('Final Decision processed for:', result.fullName);
    
//     // Remove from list after processing
//     setRequests(prev => prev.filter(req => req.id !== result.id));
//     setSelectedRequest(null);
//     alert(`Decision for ${result.fullName} has been recorded.`);
//   };

//   // ================= VIEW 1: DETAIL REVIEW VIEW =================
//   if (selectedRequest) {
//     return (
//       <div className="academic-theme">
//         <div className="animate-in fade-in duration-300">
//           {/* Internal Form with its own Back buttons */}
//           <SupervisorReviewForm 
//             studentData={selectedRequest} 
//             onDecision={() => handleDecision(selectedRequest)} 
//             onBack={() => setSelectedRequest(null)} // THIS TELLS THE FORM HOW TO GO BACK
//           />
//         </div>
//       </div>
//     );
//   }

//   // ================= VIEW 2: INBOX LIST VIEW =================
//   return (
//     <div className="academic-theme">
//       <div className="animate-in fade-in duration-500">
//         <div className="form-container" style={{ maxWidth: '1000px' }}>
//           <div className="form-header">
//             <h1>Supervisor Approval Portal</h1>
//             <p>Review and process pending postgraduate service requests</p>
//           </div>

//           <div className="table-responsive" style={{ marginTop: '2rem' }}>
//             <table className="request-table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Student Details</th>
//                   <th>Request Type</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {requests.map((req) => (
//                   <tr key={req.id}>
//                     <td>{req.submissionDate}</td>
//                     <td>
//                       <div style={{ fontWeight: 'bold' }}>{req.fullName}</div>
//                       <div style={{ fontSize: '0.85rem', color: '#666' }}>{req.studentId}</div>
//                       <div style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>{req.program}</div>
//                     </td>
//                     <td>
//                       <span className={`badge ${req.serviceCategory.replace(/\s+/g, '-').toLowerCase()}`}>
//                         {req.serviceCategory}
//                       </span>
//                     </td>
//                     <td>
//                       <button 
//                         onClick={() => setSelectedRequest(req)}
//                         className="btn-primary"
//                         style={{ padding: '8px 16px', fontSize: '0.9rem' }}
//                       >
//                         Review Request
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {requests.length === 0 && (
//               <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
//                 <div style={{ fontSize: '3rem' }}>✅</div>
//                 <p>No pending requests to review.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReviewRequest;

import { useState } from 'react';
import SupervisorReviewForm from '../../components/form/supervisor/SupervisorReviewForm';

const ReviewRequest = () => {
    // Mock Data
    const [requests, setRequests] = useState([
        { 
            id: 1, fullName: "Alex Rivera", studentId: "AIU 22001234", program: "PhD (Business Mgmt)",
            serviceCategory: "Extension of Study", submissionDate: "2023-10-25",
            currentEndDate: "2023-12-01", requestedNewEndDate: "2024-06-01", ganttChart: { name: "research_timeline.pdf" }
        },
        { 
            id: 2, fullName: "Sarah Chen", studentId: "AIU 22005566", program: "Master of Education",
            serviceCategory: "Add/Drop Course", submissionDate: "2023-10-26",
            courseCode: "EDU702", courseName: "Adv. Research Methods", action: "Add"
        },
        { 
            id: 3, fullName: "Marcus Tan", studentId: "AIU 21009988", program: "Master of Business",
            serviceCategory: "Deferment of Study", submissionDate: "2023-10-27",
            defermentReason: "Medical recovery.", resumingSemester: "Sem 2, 2024", supportingDocument: { name: "medical_cert.pdf" }
        }
    ]);

    const [selectedRequest, setSelectedRequest] = useState(null);

    // Handle Form Submission from Child
    const handleSupervisorSubmit = (result) => {
        // Remove processed request from list
        setRequests(prev => prev.filter(req => req.id !== result.id));
        setSelectedRequest(null);
        alert(`Decision recorded for ${result.fullName}`);
    };

    // VIEW: FORM (If a request is selected)
    if (selectedRequest) {
        return (
            <SupervisorReviewForm 
                studentData={selectedRequest} 
                onSubmit={handleSupervisorSubmit} 
                onCancel={() => setSelectedRequest(null)} // This triggers the "Back" function
            />
        );
    }

    // VIEW: DASHBOARD TABLE
    return (
        <div style={styles.mainContainer}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Supervisor Portal</h1>
                <p style={{ margin: '5px 0 0', color: '#666' }}>Pending Student Requests</p>
            </div>

            {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <h3>✅ All caught up!</h3>
                    <p>No pending requests at this time.</p>
                </div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Student Profile</th>
                                <th style={styles.th}>Request Type</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} style={styles.tr}>
                                    <td style={styles.td}>{req.submissionDate}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 'bold' }}>{req.fullName}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{req.studentId}</div>
                                        <div style={{ fontSize: '12px', color: '#007bff' }}>{req.program}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{req.serviceCategory}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => setSelectedRequest(req)}
                                            style={styles.reviewBtn}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Consistent Styling (Same theme as the Form)
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
    tr: {
        borderBottom: '1px solid #eee'
    },
    td: {
        padding: '12px',
        verticalAlign: 'middle',
        color: '#333'
    },
    badge: {
        backgroundColor: '#e9ecef',
        color: '#495057',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
    },
    reviewBtn: {
        backgroundColor: '#fff',
        border: '1px solid #007bff',
        color: '#007bff',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
        transition: '0.2s'
    }
};

export default ReviewRequest;