import { useState, useEffect } from "react";
import { documentService, API_BASE_URL } from "../../services/api";
import { FileText, CheckCircle, XCircle, Eye, Clock, Download, Filter, Search, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await documentService.getSupervisorDocuments();
      if (data && data.documents) {
        const formatted = data.documents.map(doc => ({
          id: doc.doc_up_id,
          studentName: doc.master ? `${doc.master.FirstName} ${doc.master.LastName}` : "Unknown Student",
          documentType: doc.document_type,
          submittedDate: doc.uploaded_at,
          status: doc.status.toLowerCase(),
          file_name: doc.document_name,
          file_path: doc.file_path,
        }));
        setSubmissions(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({ comments: "", score: "" });

  const openEvaluationModal = (submission) => {
    setSelectedSubmission(submission);
    setEvaluationForm({ comments: "", score: "" });
    setIsEvaluationModalOpen(true);
  };

  // --- API CALLS FOR REVIEW ---
  const submitReview = async (id, status, score = 0, comments = "") => {
    try {
      await documentService.review({
        doc_up_id: id,
        status: status === 'rejected' ? 'Rejected' : 'Approved', // Match DB Enum Case
        score: parseInt(score),
        comments
      });
      // Update local state ONLY on success
      setSubmissions(
        submissions.map((sub) => (sub.id === id ? { ...sub, status } : sub))
      );
      if (status === 'rejected') alert("Document rejected successfully.");
    } catch (err) {
      console.error("Review failed:", err);
      alert("Failed to submit review: " + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusUpdate = (id, status) => {
    // Only used for direct reject button now
    // We confirm rejection
    if (status === 'rejected') {
      if (window.confirm("Are you sure you want to REJECT this document?")) {
        submitReview(id, 'rejected');
      }
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (selectedSubmission) {
      // Call API for Approval with details
      await submitReview(selectedSubmission.id, 'approved', evaluationForm.score, evaluationForm.comments);
      setIsEvaluationModalOpen(false);
      setSelectedSubmission(null);
    }
  };

  const handleViewDocument = (filePath) => {
    if (!filePath) return alert("File path not available");
    // Normalize backslashes to forward slashes for URL usage
    const normalizedPath = filePath.replace(/\\/g, "/");
    const docUrl = `${API_BASE_URL}/${normalizedPath}`;
    window.open(docUrl, "_blank");
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = filterStatus === "all" ? true : sub.status === filterStatus;
    const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-blue-50 text-blue-500 border-blue-100 shadow-sm",
      approved: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100",
      rejected: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "approved": return <CheckCircle size={14} />;
      case "rejected": return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-full px-6 mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <FileText className="w-7 h-7 text-white" />
            Review Submissions
          </h1>
          <p className="text-blue-100 font-medium text-base">Evaluate and provide feedback on student academic work.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 sticky top-4 z-10 backdrop-blur-md bg-white/90">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border capitalize flex items-center gap-2 ${filterStatus === status
                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {status}
              {status !== "all" && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === status ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {submissions.filter((s) => s.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</th>
                <th className="text-left py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Document</th>
                <th className="text-left py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Submitted</th>
                <th className="text-left py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="text-right py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={submission.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                            {submission.studentName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{submission.studentName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{submission.documentType}</span>
                          <span className="text-xs text-slate-400 max-w-[200px] truncate">{submission.file_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          {new Date(submission.submittedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize shadow-sm ${getStatusBadge(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewDocument(submission.file_path)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Document"
                          >
                            <Eye size={18} />
                          </button>

                          {submission.status === "pending" && submission.documentType !== "Final Thesis" && (
                            <>
                              <button
                                onClick={() => openEvaluationModal(submission)}
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(submission.id, "rejected")}
                                className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-all"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                      No submissions found matching your filters.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        title="Submission Evaluation"
        size="md"
      >
        <form onSubmit={handleSubmitEvaluation} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Student</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-700 text-sm">
                {selectedSubmission?.studentName}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Document</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-700 text-sm">
                {selectedSubmission?.documentType}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Score (0–100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={evaluationForm.score}
              onChange={(e) => setEvaluationForm({ ...evaluationForm, score: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Feedback & Comments</label>
            <textarea
              value={evaluationForm.comments}
              onChange={(e) => setEvaluationForm({ ...evaluationForm, comments: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium"
              rows={5}
              placeholder="Provide constructive feedback..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEvaluationModalOpen(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Submit Evaluation
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
