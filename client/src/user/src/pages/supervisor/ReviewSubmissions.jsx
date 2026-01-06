import { useState } from "react";
import { FileText, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

export default function ReviewSubmissions() {
  // ✅ Hardcoded dummy submissions
  const [submissions, setSubmissions] = useState([
    {
      id: "1",
      studentName: "Michael Chen",
      documentType: "Chapter 3 - Methodology",
      submittedDate: "2024-11-08",
      status: "pending",
    },
    {
      id: "2",
      studentName: "Ahmed Hassan",
      documentType: "Literature Review",
      submittedDate: "2024-11-09",
      status: "pending",
    },
    {
      id: "3",
      studentName: "David Kim",
      documentType: "Complete Draft Thesis",
      submittedDate: "2024-11-10",
      status: "pending",
    },
    {
      id: "4",
      studentName: "Sarah Williams",
      documentType: "Research Proposal",
      submittedDate: "2024-11-05",
      status: "approved",
    },
    {
      id: "5",
      studentName: "Jennifer Taylor",
      documentType: "Chapter 2 - Literature Review",
      submittedDate: "2024-11-03",
      status: "rejected",
    },
    {
      id: "6",
      studentName: "Emily Rodriguez",
      documentType: "Progress Report",
      submittedDate: "2024-11-01",
      status: "approved",
    },
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [evaluationForm, setEvaluationForm] = useState({
    comments: "",
    score: "",
  });

  const handleStatusUpdate = (id, status) => {
    setSubmissions(
      submissions.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
  };

  const openEvaluationModal = (submission) => {
    setSelectedSubmission(submission);
    setIsEvaluationModalOpen(true);
    setEvaluationForm({ comments: "", score: "" });
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (selectedSubmission) {
      handleStatusUpdate(selectedSubmission.id, "approved");
      setIsEvaluationModalOpen(false);
      setSelectedSubmission(null);
    }
  };

  const filteredSubmissions =
    filterStatus === "all"
      ? submissions
      : submissions.filter((sub) => sub.status === filterStatus);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "approved":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Review Submissions</h1>
          <p className="text-gray-600 mt-1">Manage and evaluate student submissions</p>
        </div>
      </div>

      <div className="flex gap-3">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === status
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-20">
                {submissions.filter((s) => s.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Document Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">{submission.studentName}</td>
                  <td className="py-4 px-4 flex items-center gap-2">
                    <FileText size={18} className="text-gray-400" />
                    {submission.documentType}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(submission.submittedDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                        submission.status
                      )}`}
                    >
                      {getStatusIcon(submission.status)}
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert("View document")}
                      className="flex items-center gap-1"
                    >
                      <Eye size={16} /> View
                    </Button>
                    {submission.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openEvaluationModal(submission)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusUpdate(submission.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        title="Submit Evaluation Form"
        size="md"
      >
        <form onSubmit={handleSubmitEvaluation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
            <input
              type="text"
              value={selectedSubmission?.studentName || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <input
              type="text"
              value={selectedSubmission?.documentType || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Score (0–100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={evaluationForm.score}
              onChange={(e) =>
                setEvaluationForm({ ...evaluationForm, score: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments and Feedback
            </label>
            <textarea
              value={evaluationForm.comments}
              onChange={(e) =>
                setEvaluationForm({ ...evaluationForm, comments: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="Provide detailed feedback..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEvaluationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
