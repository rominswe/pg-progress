import React, { useState } from 'react';
import { X, ExternalLink, AlertCircle, Eye } from 'lucide-react';

const DocumentViewer = ({ documentId, documentName, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // API URL for viewing
    const viewUrl = `http://localhost:5000/api/documents/${documentId}/view`;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-[95%] h-[95%] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">View-Only Mode</h3>
                            <p className="text-xs text-gray-500 font-medium">{documentName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 italic">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Download Restricted</span>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg shadow-slate-200"
                        >
                            <X className="w-4 h-4" /> Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 relative">
                    {isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100/80">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Secure Viewer...</p>
                        </div>
                    )}

                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
                            <p className="text-gray-600 max-w-md mx-auto mb-8">
                                We couldn't load this document. You may not have permission to view it, or the file might have been moved.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
                            {/* The Iframe with sandbox and #toolbar=0 to discourage downloads */}
                            <iframe
                                src={`${viewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-none"
                                onLoad={() => setIsLoading(false)}
                                onError={() => setError(true)}
                                title="Secure Document Viewer"
                            />

                            {/* Transparent Overlay to block right-click / some interactions */}
                            <div
                                className="absolute inset-x-0 top-0 h-12 pointer-events-auto cursor-default"
                                onContextMenu={(e) => e.preventDefault()}
                                title="Navigation restricted"
                            ></div>
                        </div>
                    )}
                </div>

                {/* Footer / Status */}
                <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Secure Connection Established
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        © AIU PG Progress System
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
