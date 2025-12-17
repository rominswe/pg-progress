import { useState, useEffect } from "react";
import { documentService, authService } from "../../services/api";

export default function Uploads() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    "Progress Report",
    "Thesis Draft",
    "Supervisor Feedback",
    "Other",
  ];

  // Fetch logged-in user
  useEffect(() => {
    authService
      .me()
      .then((data) => setUser(data.user))
      .catch((err) => console.error("Failed to load user info:", err));
  }, []);

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleUpload = async () => {
    if (!files.length || !documentType) {
      alert("Select files and document type");
      return;
    }

    if (!user) {
      alert("User not loaded yet");
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    formData.append("stu_id", user.id);
    formData.append("supervisor_id", "SUP001"); // TODO: make dynamic later
    formData.append("document_type", documentType);

    try {
      setLoading(true);
      const res = await documentService.upload(formData);

      alert(`Uploaded successfully: ${res.data.length} file(s)`);
      setUploadedDocs(res.data);
      setFiles([]);
      setDocumentType("");
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50">
      <h2 className="text-3xl font-bold mb-4">Upload Documents</h2>

      {user && <p className="mb-4 text-lg">Welcome, {user.name}</p>}

      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="border p-2 rounded"
        />

        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Document Type</option>
          {documentTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`bg-blue-600 text-white py-2 px-4 rounded font-semibold transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {uploadedDocs.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-2">Uploaded Documents</h3>
          <ul className="border rounded p-2 space-y-1">
            {uploadedDocs.map((doc, idx) => (
              <li key={idx} className="text-gray-700">
                {doc.document_name} ({doc.document_type}) – {doc.file_size_kb} KB
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}