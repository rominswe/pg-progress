import { useState } from 'react'
import StudentForm from './components/StudentForm'
import SupervisorReviewForm from './components/SupervisorReviewForm'
import './App.css'

function App() {
  const [view, setView] = useState('landing') // landing, student, supervisor, success
  const [submittedRequest, setSubmittedRequest] = useState(null)
  const [supervisorDecision, setSupervisorDecision] = useState(null)

  const handleStudentSubmit = (data) => {
    // Simulate API call to save request
    console.log('Student submitted:', data)
    setSubmittedRequest(data)
    setView('student-success')
  }

  const handleSupervisorDecision = (decisionData) => {
    // Simulate API call to save decision and trigger email
    console.log('Supervisor decision:', decisionData)
    setSupervisorDecision(decisionData)
    setView('supervisor-success')
  }

  // Demo Navigation System
  const renderLanding = () => (
    <div className="form-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <div className="form-header" style={{ padding: 0, border: 'none', background: 'transparent' }}>
        <h1>Postgraduate Service Portal</h1>
        <p>Select your role to proceed</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
        <div
          onClick={() => setView('student')}
          className="role-card"
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h3>Student</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Submit service requests</p>
        </div>

        <div
          onClick={() => setView('supervisor')}
          className="role-card"
          style={{ opacity: submittedRequest ? 1 : 0.7 }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
          <h3>Supervisor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Review pending requests</p>
          {!submittedRequest && (
            <div style={{ color: 'var(--status-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              (No pending requests)
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStudentSuccess = () => (
    <div className="form-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--status-success)' }}>✅</div>
      <h2 style={{ color: 'var(--primary-color)' }}>Request Submitted!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Your request has been successfully forwarded to your supervisor (Dr. John Smith) for review.
      </p>
      <button onClick={() => setView('landing')} className="btn btn-primary">
        Back to Home
      </button>
    </div>
  )

  const renderSupervisorSuccess = () => (
    <div className="form-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📬</div>
      <h2 style={{ color: 'var(--primary-color)' }}>Decision Recorded</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The student has been notified via email regarding your decision.
      </p>
      <button onClick={() => setView('landing')} className="btn btn-primary">
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <>
      {view === 'landing' && renderLanding()}
      {view === 'student' && (
        <>
          <button
            onClick={() => setView('landing')}
            style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100 }}
            className="btn btn-secondary"
          >
            ← Home
          </button>
          <StudentForm onSubmit={handleStudentSubmit} />
        </>
      )}
      {view === 'student-success' && renderStudentSuccess()}
      {view === 'supervisor' && (
        <>
          <button
            onClick={() => setView('landing')}
            style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100 }}
            className="btn btn-secondary"
          >
            ← Home
          </button>
          {submittedRequest ? (
            <SupervisorReviewForm
              studentData={submittedRequest}
              onDecision={handleSupervisorDecision}
            />
          ) : (
            <div className="form-container" style={{ textAlign: 'center', padding: '3rem' }}>
              <h2 style={{ color: 'var(--primary-color)' }}>No Pending Requests</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please submit a request as a student first to see the supervisor workflow.</p>
              <button onClick={() => setView('student')} className="btn btn-primary">
                Go to Student Form
              </button>
            </div>
          )}
        </>
      )}
      {view === 'supervisor-success' && renderSupervisorSuccess()}
    </>
  )
}

export default App