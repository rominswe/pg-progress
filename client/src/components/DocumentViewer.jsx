import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../services/api';
import { useAuth } from './auth/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';

// Import styles (if using a bundler like Vite, this usually works or might need manual CSS copy)
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentViewer = ({ documentId, documentName, onClose }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);

    // PDF State
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    useEffect(() => {
        let isMounted = true;
        const fetchDocument = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/api/documents/${documentId}/view`, {
                    responseType: 'blob'
                });

                if (isMounted) {
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                    setBlobUrl(url);
                    // Loading state is handled by Document onLoadSuccess
                }
            } catch (err) {
                console.error("Error viewing document:", err);
                if (isMounted) {
                    setError(true);
                    setIsLoading(false);
                }
            }
        };

        fetchDocument();

        return () => {
            isMounted = false;
            // Only clean up if we have a url and it's changing or component unmounting
            if (blobUrl) window.URL.revokeObjectURL(blobUrl);
        };
    }, [documentId]);

    // Security: Block shortcuts and print
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+Shift+I (DevTools), PrintScreen
            if (
                (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.metaKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                e.key === 'PrintScreen'
            ) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const handleContextMenu = (e) => e.preventDefault();

        // Inject print-hiding CSS
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body { display: none !important; }
            }
        `;
        document.head.appendChild(style);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
            document.head.removeChild(style);
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const changePage = (offset) => {
        setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 select-none print:hidden">
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

                    {/* Toolbar (Visible only when loaded) */}
                    {!isLoading && blobUrl && (
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2 py-1 shadow-sm">
                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                                <ZoomIn size={16} />
                            </button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => changePage(-1)}
                                className="p-1.5 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-medium">
                                {pageNumber} / {numPages || '--'}
                            </span>
                            <button
                                disabled={pageNumber >= numPages}
                                onClick={() => changePage(1)}
                                className="p-1.5 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}


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
                <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
                    {/* Main Viewer Area - Scrollable */}
                    <div className="flex-1 overflow-auto flex justify-center p-8 bg-slate-100 relative" onContextMenu={(e) => e.preventDefault()}>

                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100/80">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Secure Viewer...</p>
                            </div>
                        )}

                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <AlertCircle className="w-10 h-10 text-red-600 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">Access Error</h2>
                                <p className="text-gray-600">Couldn't load document.</p>
                            </div>
                        ) : (
                            blobUrl && (
                                <div className="shadow-2xl relative" style={{ userSelect: 'none' }}>
                                    <Document
                                        file={blobUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={null}
                                        error={<div className="text-red-500 font-bold">Failed to load PDF core.</div>}
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            scale={scale}
                                            renderTextLayer={false} // Disable text selection completely
                                            renderAnnotationLayer={false}
                                            className="bg-white"
                                        />
                                    </Document>

                                    {/* Watermark Overlay (Inside the scrollable area, covering the page) */}
                                    {user?.role_id === 'EXA' && (
                                        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center opacity-[0.2]">
                                            <div className="rotate-[-45deg] whitespace-nowrap text-slate-900 font-bold text-4xl select-none">
                                                {[...Array(10)].map((_, i) => (
                                                    <div key={i} className="mb-48 text-center">
                                                        {`CONFIDENTIAL • ${user.id} • ${new Date().toLocaleDateString()}`}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Footer */}
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
