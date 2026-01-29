import { useState, useEffect } from 'react';
import { serviceRequestService } from '../../services/api';
import { ClipboardList, User, Calendar, Tag, ChevronRight, Inbox, Clock } from 'lucide-react';
import SupervisorReviewForm from '../../components/form/supervisor/SupervisorReviewForm';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await serviceRequestService.getAll('Pending');
      const formatted = res.data.requests.map(r => ({
        id: r.request_id,
        fullName: r.full_name,
        studentId: r.student_id_display,
        program: r.program,
        serviceCategory: r.service_category,
        submissionDate: r.submission_date,
        ...r.request_details
      }));
      setRequests(formatted);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (result) => {
    try {
      const { decision, fullData } = result;
      const comments = decision === 'Approved' ? fullData.approvalNote : fullData.rejectionReason;

      await serviceRequestService.updateStatus(selectedRequest.id, decision, comments);

      alert(`Request ${decision} successfully.`);
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Decision update failed", error);
      alert("Failed to update status");
    }
  };

  // ================= VIEW 1: DETAIL REVIEW VIEW =================
  if (selectedRequest) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-7xl mx-auto p-8"
      >
        <SupervisorReviewForm
          studentData={selectedRequest}
          onDecision={handleDecision}
          onBack={() => setSelectedRequest(null)}
        />
      </motion.div>
    );
  }

  // ================= VIEW 2: INBOX LIST VIEW =================
  return (
    <div className="space-y-6 max-w-full px-6 mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-white" />
            PG-Form Approval
          </h1>
          <p className="text-blue-100 font-medium text-base">Process pending administrative requests from your students.</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 text-sm">{requests.length}</span>
          Pending Approval
        </h2>

        <div className="space-y-4">
          {requests.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-300"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Inbox size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</h3>
              <p className="text-slate-500 max-w-sm">No pending service requests at the moment. Enjoy your day.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {requests.map((req, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={req.id}
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer"
                  onClick={() => setSelectedRequest(req)}
                >
                  {/* Student Icon & Date */}
                  <div className="flex flex-col items-center gap-2 text-center w-full md:w-auto shrink-0">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Clock size={10} /> {req.submissionDate ? new Date(req.submissionDate).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{req.fullName}</h3>
                      <span className="text-xs font-medium text-slate-400">{req.studentId}</span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-1">{req.program}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${req.serviceCategory.includes("Extension") ? "bg-blue-50 text-blue-700 border-blue-200" :
                        req.serviceCategory.includes("Deferment") ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                        <Tag size={12} /> {req.serviceCategory}
                      </span>
                    </div>
                  </div>

                  {/* Action Arrow */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all md:ml-4">
                    <ChevronRight size={20} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div >
    </div >
  );
};

export default ReviewRequest;