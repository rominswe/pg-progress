import { useState, useEffect } from 'react';
import { Upload, FileText, File, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';

const Uploads = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // fetched from backend later

  // ===============================
  // 🔹 FETCH EXISTING DOCUMENTS (Backend Integration Placeholder)
  // ===============================
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Example (uncomment when backend ready)
        // const response = await axios.get(`${API_BASE_URL}/documents`);
        // setUploadedDocuments(response.data);
        // Dummy fallback for now:
        setUploadedDocuments([
          { name: 'Chapter_3_Draft.pdf', type: 'Thesis Chapter', date: '2025-10-28', size: '2.4 MB', status: 'approved' },
          { name: 'Research_Proposal.docx', type: 'Proposal', date: '2025-10-15', size: '1.8 MB', status: 'approved' },
          { name: 'Progress_Report_Q3.pdf', type: 'Progress Report', date: '2025-10-10', size: '856 KB', status: 'pending' },
          { name: 'Literature_Review.pdf', type: 'Literature Review', date: '2025-09-22', size: '3.2 MB', status: 'approved' },
        ]);
      } catch (error) {
        console.error('Error fetching uploaded documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  // ===============================
  // 🔹 FILE UPLOAD HANDLING (Drag & Drop + File Input)
  // ===============================
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // ===============================
  // 🔹 FILE UPLOAD SUBMISSION (Backend Integration Placeholder)
  // ===============================
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return alert('Please select at least one file.');
    try {
      // const formData = new FormData();
      // selectedFiles.forEach((file) => formData.append('files', file));
      // await axios.post(`${API_BASE_URL}/upload`, formData);
      alert('Files uploaded successfully! (Mock behavior)');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==============================
           🔹 Page Header
      =============================== */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Document Uploads</h2>
        <p className="text-gray-500 mt-1">
          Upload your thesis documents, proposals, and progress reports
        </p>
      </div>

      {/* ==============================
           🔹 Upload Section
      =============================== */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Documents</h3>

        {/* Drag & Drop Upload Box */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: PDF, DOCX, DOC (Max size: 10MB)
          </p>
          <label className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Select Files
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
          </label>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Select Document Type</option>
                <option>Thesis Chapter</option>
                <option>Research Proposal</option>
                <option>Progress Report</option>
                <option>Literature Review</option>
                <option>Other</option>
              </select>
              <button
                onClick={handleUpload}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upload Selected Files
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==============================
           🔹 Previously Uploaded Documents
      =============================== */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Previously Uploaded Documents</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Upload Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Size</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedDocuments.map((doc, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{doc.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{doc.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{doc.size}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {doc.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {doc.status === 'approved' ? 'Approved' : 'Under Review'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Uploads;