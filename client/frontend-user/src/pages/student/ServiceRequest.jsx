import { useState } from 'react';
import StudentForm from '../../components/StudentForm'; // Check your path!

const ServiceRequest = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFormSubmit = (formData) => {
        console.log("Form Data Collected:", formData);
        setIsSubmitted(true);
    };

    return (
        /* This wrapper activates the colors and layout for the whole page */
        <div className="academic-theme">
            {isSubmitted ? (
                <div className="form-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 className="text-2xl font-bold">Request Submitted!</h2>
                    <p className="text-muted-foreground mt-2">
                        Your service request has been sent to your supervisor for review. 
                    </p>
                    <button 
                        onClick={() => setIsSubmitted(false)}
                        className="btn btn-primary mt-6"
                    >
                        Submit Another Request
                    </button>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <StudentForm onSubmit={handleFormSubmit} />
                </div>
            )}
        </div>
    );
};

export default ServiceRequest;