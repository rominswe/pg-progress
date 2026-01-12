import { useState, useEffect } from 'react';
import StudentForm from '../../components/form/students/StudentForm';
import { serviceRequestService } from '../../services/api';
import { Clock } from 'lucide-react';

const ServiceRequest = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFormSubmit = async (formData) => {
        try {
            setLoading(true);
            await serviceRequestService.create(formData);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit request: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, [isSubmitted]);

    const fetchHistory = async () => {
        try {
            const res = await serviceRequestService.getAll();
            setHistory(res.data.requests || []);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    return (
        <div className="max-w-full px-6 mx-auto animate-fade-in-up space-y-8 py-6">
            {isSubmitted ? (
                <div className="max-w-2xl mx-auto mt-10 p-12 bg-white rounded-3xl shadow-xl border border-slate-100 text-center">
                    <div className="text-6xl mb-6">✅</div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Request Submitted!</h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Your PG-Form has been securely transmitted to your supervisor for review.
                        You will be notified once an action is taken.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1"
                    >
                        Submit Another Request
                    </button>
                </div>
            ) : (
                <StudentForm onSubmit={handleFormSubmit} />
            )}

            {/* Request History Section */}
            <div className="max-w-5xl mx-auto mt-12">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    My Request History
                </h3>
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <p className="text-slate-500 text-center py-12 bg-white rounded-3xl shadow-sm border border-slate-100">No requests found.</p>
                    ) : (
                        history.map((req) => (
                            <div key={req.request_id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-slate-900 text-lg">{req.service_category}</h4>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border 
                                            ${req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    req.status === 'More Info' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4 font-medium flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        Submitted on: {new Date(req.submission_date).toLocaleString()}
                                    </p>

                                    {(req.request_details?.supervisor_comments || req.request_details?.supervisor_signature) && (
                                        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                            {req.request_details?.supervisor_comments && (
                                                <div className="mb-4">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${req.status === 'Rejected' ? 'text-red-500' : 'text-blue-600'}`}>
                                                        {req.status === 'Rejected' ? 'Rejection Reason' : 'Supervisor Comment'}
                                                    </span>
                                                    <p className="text-slate-700 text-sm leading-relaxed font-medium">{req.request_details.supervisor_comments}</p>
                                                </div>
                                            )}

                                            {(req.request_details?.supervisor_name || req.request_details?.supervisor_signature) && (
                                                <div className="border-t border-slate-200 pt-4 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Official Declaration</span>
                                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                                        <div>
                                                            {req.request_details?.supervisor_signature && (
                                                                <p className="font-signature text-2xl text-slate-900 mb-1">{req.request_details.supervisor_signature}</p>
                                                            )}
                                                            {req.request_details?.supervisor_name && (
                                                                <p className="text-xs text-slate-500">Supervisor: <span className="font-bold text-slate-700">{req.request_details.supervisor_name}</span></p>
                                                            )}
                                                        </div>
                                                        {req.request_details?.decision_date && (
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Dated: {new Date(req.request_details.decision_date).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceRequest;