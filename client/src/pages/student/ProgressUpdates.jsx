import { useState, useEffect } from 'react';
import { FileText, Plus, Save, Calendar, Target, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { progressService } from '../../services/api';
import { useAuth } from '../../components/auth/AuthContext';

const ProgressUpdates = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    achievements: '',
    challenges: '',
    nextSteps: '',
    document: null
  });

  const fetchUpdates = async () => {
    try {
      const res = await progressService.getUpdates();
      const updatesList = res.data?.updates || [];
      // Map DB fields to UI fields
      const formatted = updatesList.map(u => ({
        ...u,
        id: u.update_id,
        date: u.submission_date,
        nextSteps: u.next_steps
      }));
      setUpdates(formatted);
    } catch (error) {
      console.error('Error fetching progress updates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUpdates();
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        e.target.value = '';
        return;
      }
      setNewUpdate({ ...newUpdate, document: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) return alert("Please login first");

      await progressService.createUpdate(newUpdate);

      alert("Progress update submitted!");
      setNewUpdate({
        title: '',
        description: '',
        achievements: '',
        challenges: '',
        nextSteps: '',
        document: null
      });
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      setIsFormOpen(false);
      fetchUpdates(); // Refresh list
    } catch (err) {
      console.error("Failed to submit update:", err);
      alert("Failed to submit: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-full px-6 mx-auto animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
              <FileText className="w-7 h-7 text-white" />
              Progress Updates
            </h1>
            <p className="text-blue-100 font-medium text-base">Track your academic milestones and report your progress.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden sticky top-8">
            <div
              className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setIsFormOpen(!isFormOpen)}
            >
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                New Update
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {isFormOpen ? 'Collapse' : 'Expand'}
              </span>
            </div>

            {isFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="p-6"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Update Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUpdate.title}
                      onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                      placeholder="e.g., Week 15 Progress"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Brief Description</label>
                    <textarea
                      value={newUpdate.description}
                      onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                      placeholder="Overview..."
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" /> Key Achievements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newUpdate.achievements}
                      onChange={(e) => setNewUpdate({ ...newUpdate, achievements: e.target.value })}
                      placeholder="What did you accomplish?"
                      rows="3"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" /> Challenges
                    </label>
                    <textarea
                      value={newUpdate.challenges}
                      onChange={(e) => setNewUpdate({ ...newUpdate, challenges: e.target.value })}
                      placeholder="Any obstacles?"
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500" /> Next Steps <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newUpdate.nextSteps}
                      onChange={(e) => setNewUpdate({ ...newUpdate, nextSteps: e.target.value })}
                      placeholder="Plans for next period..."
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Progress Report Document (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.zip"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Supported formats: PDF, DOC, DOCX, TXT, ZIP (Max 50MB)
                      </p>
                      {newUpdate.document && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          ✓ {newUpdate.document.name} ({(newUpdate.document.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                    >
                      Submit Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewUpdate({ title: '', description: '', achievements: '', challenges: '', nextSteps: '' })}
                      className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline/List Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 pl-2 border-l-4 border-blue-600">History</h3>

          <div className="space-y-6">
            {updates.map((update) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={update.id}
                className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${update.status === 'Reviewed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{update.title}</h4>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <Calendar className="w-3.5 h-3.5" />
                        {update.date}
                      </span>
                    </div>
                  </div>
                  {update.status === 'Reviewed' ? (
                    <button
                      onClick={() => document.getElementById(`feedback-${update.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="mt-3 md:mt-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border bg-green-50 text-green-700 border-green-100 hover:bg-green-100 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Click to view supervisor feedback"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {update.status}
                    </button>
                  ) : (
                    <span className="mt-3 md:mt-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border bg-yellow-50 text-yellow-700 border-yellow-100">
                      {update.status}
                    </span>
                  )}
                </div>

                <div className="pl-4 space-y-6">
                  <p className="text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4 py-1">
                    "{update.description}"
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100/50">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Target className="w-3 h-3" /> Achievements
                      </p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{update.achievements}</p>
                    </div>

                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Challenges
                      </p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{update.challenges}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" /> Next Steps
                    </p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{update.nextSteps}</p>
                  </div>

                  {update.supervisor_feedback && (
                    <div
                      id={`feedback-${update.id}`}
                      className="mt-6 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm animate-pulse-subtle scroll-mt-6"
                    >
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Supervisor Feedback
                      </p>
                      <p className="text-slate-800 font-medium leading-relaxed bg-white/50 p-4 rounded-xl">
                        {update.supervisor_feedback}
                      </p>
                      {update.reviewed_at && (
                        <p className="text-[10px] text-blue-400 mt-3 font-bold uppercase tracking-tighter">
                          Reviewed on {new Date(update.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressUpdates;