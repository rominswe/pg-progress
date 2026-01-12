import { useState, useEffect } from 'react';
import { Search, Mail, TrendingUp, Calendar, BookOpen, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { progressService } from '@/services/api';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await progressService.getMyStudents();
      setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.researchTitle.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesProgress = true;
    if (progressFilter === 'low') matchesProgress = student.progress < 50;
    if (progressFilter === 'medium') matchesProgress = student.progress >= 50 && student.progress < 80;
    if (progressFilter === 'high') matchesProgress = student.progress >= 80;

    return matchesSearch && matchesProgress;
  });

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (progress >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-blue-400 bg-blue-50 border-blue-100';
  };

  const getProgressBg = (progress) => {
    if (progress >= 80) return 'bg-blue-700';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-blue-300';
  };

  return (
    <div className="space-y-6 max-w-full px-6 mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-white" />
            My Students
          </h1>
          <p className="text-blue-100 font-medium text-base">Manage and track the progress of learners under your supervision.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-4 items-center sticky top-4 z-10 backdrop-blur-md bg-white/90">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name or research title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter className="w-5 h-5 text-slate-400 hidden md:block mr-2" />
          {[
            { id: 'all', label: 'All Students' },
            { id: 'high', label: 'High Progress' },
            { id: 'medium', label: 'On Track' },
            { id: 'low', label: 'At Risk' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setProgressFilter(filter.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${progressFilter === filter.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Syncing student data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {filteredStudents.map((student, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={student.id}
                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                      {student.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{student.name}</h3>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Mail size={14} className="text-blue-400" />
                        {student.email}
                      </p>
                    </div>

                    {student.researchTitle && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Research Title</p>
                        <p className="text-sm font-semibold text-slate-700 leading-snug line-clamp-1 group-hover:line-clamp-none transition-all">
                          {student.researchTitle}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                        <Calendar size={14} />
                        Last Submission: {new Date(student.lastSubmissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="flex-shrink-0 w-full lg:w-64 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Current Progress</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getProgressColor(student.progress)}`}>
                        {student.progress >= 80 ? 'Excellent' : student.progress >= 50 ? 'On Track' : 'Need Action'}
                      </span>
                    </div>

                    <div className="flex items-end gap-2 mb-2">
                      <span className={`text-4xl font-extrabold ${student.progress >= 80 ? 'text-blue-700' : student.progress >= 50 ? 'text-blue-600' : 'text-blue-400'}`}>
                        {student.progress}%
                      </span>
                      <TrendingUp size={20} className={`mb-1.5 ${student.progress >= 80 ? 'text-blue-600' : student.progress >= 50 ? 'text-blue-500' : 'text-blue-300'}`} />
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${student.progress}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full shadow-sm ${getProgressBg(student.progress)}`}
                      />
                    </div>
                  </div>

                  {/* Action Arrow */}
                  <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-slate-100 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No students found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any students matching your search criteria. Try adjusting your filters.</p>
        </motion.div>
      )}
    </div>
  );
}
