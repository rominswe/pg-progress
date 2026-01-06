import { useState } from 'react';
import SupervisorReviewForm from '../../components/form/supervisor/SupervisorReviewForm';

const ReviewRequest = () => {
  // 1. Mock Data
  const [requests, setRequests] = useState([
    { 
      id: 1, 
      fullName: "Alex Rivera", 
      studentId: "AIU 22001234", 
      program: "Doctor of Philosophy (Business Management)",
      serviceCategory: "Extension of Study",
      submissionDate: "2023-10-25",
      currentEndDate: "2023-12-01",
      requestedNewEndDate: "2024-06-01",
      ganttChart: { name: "research_timeline.pdf" }
    },
    { 
      id: 2, 
      fullName: "Sarah Chen", 
      studentId: "AIU 22005566", 
      program: "Master of Education (by Research)",
      serviceCategory: "Add/Drop Course",
      submissionDate: "2023-10-26",
      courseCode: "EDU702",
      courseName: "Advanced Research Methods",
      action: "Add"
    },
    { 
      id: 3, 
      fullName: "Marcus Tan", 
      studentId: "AIU 21009988", 
      program: "Master of Business Management (by Research)",
      serviceCategory: "Deferment of Study",
      submissionDate: "2023-10-27",
      defermentReason: "Medical recovery required after surgery.",
      resumingSemester: "Semester 2, 2024",
      supportingDocument: { name: "medical_cert.pdf" }
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleDecision = (result) => {
    console.log('Final Decision processed for:', result.fullName);
    
    // Remove from list after processing
    setRequests(prev => prev.filter(req => req.id !== result.id));
    setSelectedRequest(null);
    alert(`Decision for ${result.fullName} has been recorded.`);
  };

  // ================= VIEW 1: DETAIL REVIEW VIEW =================
  if (selectedRequest) {
    return (
      <div className="academic-theme">
        <div className="animate-in fade-in duration-300">
          {/* Internal Form with its own Back buttons */}
          <SupervisorReviewForm 
            studentData={selectedRequest} 
            onDecision={() => handleDecision(selectedRequest)} 
            onBack={() => setSelectedRequest(null)} // THIS TELLS THE FORM HOW TO GO BACK
          />
        </div>
      </div>
    );
  }

  // ================= VIEW 2: INBOX LIST VIEW =================
  return (
    <div className="academic-theme">
      <div className="animate-in fade-in duration-500">
        <div className="form-container" style={{ maxWidth: '1000px' }}>
          <div className="form-header">
            <h1>Supervisor Approval Portal</h1>
            <p>Review and process pending postgraduate service requests</p>
          </div>

          <div className="table-responsive" style={{ marginTop: '2rem' }}>
            <table className="request-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Details</th>
                  <th>Request Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.submissionDate}</td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{req.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{req.studentId}</div>
                      <div style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>{req.program}</div>
                    </td>
                    <td>
                      <span className={`badge ${req.serviceCategory.replace(/\s+/g, '-').toLowerCase()}`}>
                        {req.serviceCategory}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        Review Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {requests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem' }}>✅</div>
                <p>No pending requests to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequest;