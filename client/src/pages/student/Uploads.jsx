import { useState, useEffect, useRef } from "react";
import { documentService } from "../../services/api";
import { useAuth } from "../../components/auth/AuthContext";
import { UploadCloud, FileText, CheckCircle, Clock, Circle, FolderOpen, Eye, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Uploads() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const uploadSectionRef = useRef(null);

  // --- Thesis Milestones State ---
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Research Proposal',
      status: 'in-progress',
      date: 'Current Step',
      description: 'Initial research proposal',
      docType: 'Research Proposal'
    },
    {
      id: 2,
      title: 'Literature Review',
      status: 'pending',
      date: 'Step 2',
      description: 'Comprehensive literature review',
      docType: 'Literature Review'
    },
    {
      id: 3,
      title: 'Methodology Chapter',
      status: 'pending',
      date: 'Step 3',
      description: 'Research methodology',
      docType: 'Methodology'
    },
    {
      id: 4,
      title: 'Data Collection & Analysis',
      status: 'pending',
      date: 'Step 4',
      description: 'Data analysis reports',
      docType: 'Data Analysis'
    },
    {
      id: 5,
      title: 'Final Thesis Draft',
      status: 'pending',
      date: 'Final Step',
      description: 'Complete thesis',
      docType: 'Thesis Draft'
    },
  ]);

  // Fetch Documents on Mount & Update Roadmap
  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      try {
        const data = await documentService.getMyDocuments();
        console.log("Fetched Docs:", data.documents);
        setUploadedDocs(data.documents || []);
        updateRoadmap(data.documents || []);
      } catch (err) {
        console.error("Failed to fetch docs", err);
      }
    };
    fetchDocs();
  }, [user]);

  const updateRoadmap = (docs) => {
    setMilestones(prev => {
      const newMilestones = [...prev];
      const uploadedTypes = new Set(docs.map(d => d.document_type));

      let firstPendingFound = false;

      return newMilestones.map(m => {
        if (uploadedTypes.has(m.docType)) {
          // If valid doc exists, it's completed
          // Find the specific doc to get the date if needed? 
          // For now, just mark completed.
          return { ...m, status: 'completed', date: 'Submitted' };
        } else {
          if (!firstPendingFound) {
            firstPendingFound = true;
            return { ...m, status: 'in-progress', date: 'Current Step' };
          }
          return { ...m, status: 'pending', date: 'Locked' };
        }
      });
    });
  };



  // --- STRICT SEQUENTIAL LOGIC ---
  // Find which milestone is currently active (in-progress)
  // Logic: Previous updateRoadmap sets exactly one milestone to 'in-progress' (the next step).
  const activeMilestone = milestones.find(m => m.status === 'in-progress');

  // Standard non-milestone types that are always allowed
  const standardTypes = [];

  // The available types are:
  // 1. The ACTIVE milestone (e.g., "Literature Review")
  // 2. The standard always-allowed types
  // Note: We deliberately EXCLUDE future milestones (locked) and past ones (completed - unless we want to allow re-submission, but user asked for strict order).
  // Assuming re-submission of COMPLETED milestones is fine (e.g. creating v2), we could check that.
  // BUT the user specifically said "without having submitted the research proposal, cannot submit the LR".
  // This implies strict forward progression.

  const availableTypes = [
    ...(activeMilestone ? [activeMilestone.docType] : []),
    ...standardTypes
  ];

  // Helper: Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  // Helper: Handle "Submit Work" click from timeline
  const handleMilestoneSubmit = (type) => {
    setDocumentType(type);
    // Scroll smoothly to upload section
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !documentType) {
      alert("Select files and document type");
      return;
    }

    if (!user || (!user.id && !user.user_id)) {
      alert("User session not active. Please reload the page.");
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
    formData.append("document_type", documentType);

    try {
      setLoading(true);
      const res = await documentService.upload(formData);
      alert(`Uploaded successfully: ${res.data.documents.length} file(s)`);
      if (res.data.documents) {
        setUploadedDocs([...res.data.documents, ...uploadedDocs]);

        // --- Milestone Progression Logic ---
        const uploadedType = documentType;

        setMilestones(prevMilestones => {
          const newMilestones = [...prevMilestones];
          const currentIdx = newMilestones.findIndex(m => m.docType === uploadedType);

          if (currentIdx !== -1) {
            // 1. Mark current as completed
            newMilestones[currentIdx] = {
              ...newMilestones[currentIdx],
              status: 'completed',
              date: new Date().toISOString().split('T')[0] // Set today's date
            };

            // 2. Unlock next milestone if exists
            if (currentIdx + 1 < newMilestones.length) {
              newMilestones[currentIdx + 1] = {
                ...newMilestones[currentIdx + 1],
                status: 'in-progress',
                description: 'Now ready for submission'
              };
            }
          }
          return newMilestones;
        });
      }
      setFiles([]);
      setDocumentType("");
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full px-6 mx-auto animate-fade-in-up space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <UploadCloud className="w-7 h-7 text-white" />
            Thesis and Document Submission
          </h1>
          <p className="text-blue-100 font-medium text-base">Manage your thesis milestones and submit required documents.</p>
        </div>
      </div>

      {/* --- Thesis Timeline Section --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          Thesis Roadmap
        </h2>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-10 left-10 right-10 h-1 bg-slate-100 -z-10"></div>

            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="group relative flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white mb-3 transition-transform group-hover:scale-110 shadow-sm
                    ${milestone.status === 'completed' ? 'border-blue-100 text-blue-600' :
                    milestone.status === 'in-progress' ? 'border-blue-200 text-blue-600 shadow-md shadow-blue-100' : 'border-slate-300 text-slate-500'}
                 `}>
                  {milestone.status === 'completed' ? <CheckCircle className="w-10 h-10" /> :
                    milestone.status === 'in-progress' ? <Clock className="w-10 h-10 animate-pulse" /> :
                      <Circle className="w-10 h-10" />}
                </div>

                <h3 className="font-bold text-slate-800 mb-1">{milestone.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mb-2">{milestone.date}</p>

                {milestone.status === 'in-progress' && (
                  <button
                    onClick={() => handleMilestoneSubmit(milestone.docType)}
                    className="mt-2 text-xs font-bold bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                  >
                    Submit Now
                  </button>
                )}
                {milestone.status === 'completed' && (
                  <span className="mt-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Upload & History Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" ref={uploadSectionRef}>
        {/* Upload Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden sticky top-8">
            <div className="bg-slate-50 border-b border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                Upload File
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Document Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold cursor-pointer"
                  >
                    <option value="">Select Type...</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold">▼</div>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
                    ${files.length > 0 ? 'border-green-400 bg-green-50' :
                    dragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                  `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors
                   ${files.length > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}
                `}>
                  {files.length > 0 ? <CheckCircle className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {files.length > 0 ? `${files.length} file(s) selected` : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1">PDF, DOCX up to 15MB</p>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !user || !files.length || !documentType}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${loading || !user || !files.length || !documentType
                    ? "bg-slate-300 shadow-none cursor-not-allowed opacity-70"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5"}
                  `}
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    Submit Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Records Section - Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[500px]">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Submission History
              </h2>
              <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm">
                {uploadedDocs.length} Files
              </span>
            </div>

            <div className="p-0">
              {uploadedDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-center p-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No documents yet</h3>
                  <p className="text-slate-500 font-medium text-sm max-w-xs">Upload your first document to get started tracking your progress.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {uploadedDocs.map((doc, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className="p-5 sm:p-6 hover:bg-slate-50 transition-colors group flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-base font-bold text-slate-900 truncate pr-4 group-hover:text-blue-700 transition-colors">
                            {doc.document_name}
                          </h4>
                          {/* Status Pill Logic */}
                          {doc.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                              <AlertCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          ) : doc.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white border border-blue-100">
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                            {doc.document_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            {doc.file_size_kb || '0'} KB
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000/api/documents/${doc.doc_up_id || doc.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Document"
                        >
                          <Eye className="w-5 h-5" />
                        </a>


                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}