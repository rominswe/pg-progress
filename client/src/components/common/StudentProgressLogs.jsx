import { useState, useEffect } from 'react';
import { progressService } from '../../services/api';
import { motion } from 'framer-motion';
import { Calendar, Target, AlertTriangle, ArrowRight, X } from 'lucide-react';

const StudentProgressLogs = ({ studentId, onClose }) => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const data = await progressService.getUpdates(studentId);
                const formatted = data.map(u => ({
                    ...u,
                    id: u.update_id,
                    date: u.submission_date,
                    nextSteps: u.next_steps
                }));
                setUpdates(formatted);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (studentId) fetchUpdates();
    }, [studentId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Student Progress Logs</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {loading ? (
                        <p className="text-center text-slate-500">Loading logs...</p>
                    ) : updates.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-500 font-medium">No progress updates found for this student.</p>
                        </div>
                    ) : (
                        updates.map((update) => (
                            <div key={update.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800">{update.title}</h4>
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                                            <Calendar className="w-3 h-3" /> {update.date}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${update.status === 'Reviewed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                        {update.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {update.description && (
                                        <p className="text-slate-600 text-sm italic border-l-2 border-slate-200 pl-3">
                                            "{update.description}"
                                        </p>
                                    )}

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <p className="text-xs font-bold text-green-600 mb-1 flex items-center gap-1"><Target size={12} /> Achievements</p>
                                            <p className="text-xs text-slate-700">{update.achievements}</p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                            <p className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Challenges</p>
                                            <p className="text-xs text-slate-700">{update.challenges || "None"}</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><ArrowRight size={12} /> Next Steps</p>
                                            <p className="text-xs text-slate-700">{update.nextSteps}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default StudentProgressLogs;
