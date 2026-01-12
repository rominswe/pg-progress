import { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Star, CheckCircle, ChevronDown, ChevronUp, Award, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluationService } from '../../services/api';
import { useAuth } from '../../components/auth/AuthContext';

const Feedback = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      // Attempt to find the student ID from the user object
      const studentId = user?.stu_id || user?.student_id || user?.master_id || user?.id;

      console.log('--- Evaluation Debug ---');
      console.log('Logged in user:', user);
      console.log('Effective Student ID:', studentId);

      if (!studentId) {
        setError("Student identity could not be verified. Please log in again.");
        setLoading(false);
        return;
      }

      const data = await evaluationService.getStudentEvaluations(studentId);
      console.log('Evaluations found:', data.evaluations);

      setEvaluations(data.evaluations || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load evaluation data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
      />
    ));
  };

  const calculateAverageRating = (evaluation) => {
    const ratings = [
      evaluation.knowledge_rating,
      evaluation.presentation_rating,
      evaluation.response_rating,
      evaluation.organization_rating,
      evaluation.overall_rating
    ];
    return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-lg font-medium bg-red-50 px-6 py-4 rounded-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full px-6 mx-auto animate-fade-in-up space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-white" />
            Defense Evaluations & Feedback
          </h2>
          <p className="text-blue-100 font-medium text-base">Review your defense evaluations and supervisor feedback.</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Total Evaluations", value: evaluations.length, icon: Award, color: "blue" },
          { title: "Proposal Defense", value: evaluations.filter((e) => e.defense_type === 'Proposal Defense').length, icon: BookOpen, color: "blue" },
          { title: "Final Thesis", value: evaluations.filter((e) => e.defense_type === 'Final Thesis').length, icon: CheckCircle, color: "blue" }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.title}</p>
                <p className={`text-3xl font-extrabold mt-2 text-${stat.color}-600`}>{stat.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EVALUATIONS LIST */}
      {evaluations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Evaluations Yet</h3>
          <p className="text-slate-500">Your defense evaluations will appear here once submitted by your supervisor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {evaluations.map((evaluation) => (
            <motion.div
              key={evaluation.evaluation_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              {/* HEADER */}
              <div
                className="p-6 md:p-8 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors"
                onClick={() => toggleExpand(evaluation.evaluation_id)}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200`}>
                      {evaluation.defense_type === 'Proposal Defense' ? (
                        <BookOpen className="w-7 h-7 text-white" />
                      ) : (
                        <Award className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{evaluation.supervisor_name}</h3>
                        <span className={`px-2.5 py-0.5 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm bg-blue-600 shadow-blue-200`}>
                          {evaluation.defense_type}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium mb-2">
                        Semester: <span className="text-blue-600 font-bold">{evaluation.semester}</span>
                      </p>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(evaluation.evaluation_date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-0.5">{renderStars(Math.round(calculateAverageRating(evaluation)))}</div>
                        <span className="text-blue-600 font-bold">Avg: {calculateAverageRating(evaluation)}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full hover:bg-slate-200/50 transition-colors ${expandedIds.includes(evaluation.evaluation_id) ? 'bg-slate-100' : ''}`}>
                    {expandedIds.includes(evaluation.evaluation_id) ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* EXPANDABLE CONTENT */}
              <AnimatePresence>
                {expandedIds.includes(evaluation.evaluation_id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100"
                  >
                    <div className="p-6 md:p-8 pt-6 space-y-6 bg-white">
                      {/* Performance Ratings */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Star className="w-4 h-4" /> Performance Ratings
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'Knowledge & Understanding', value: evaluation.knowledge_rating },
                            { label: 'Presentation Skills', value: evaluation.presentation_rating },
                            { label: 'Response to Questions', value: evaluation.response_rating },
                            { label: 'Organization & Structure', value: evaluation.organization_rating },
                            { label: 'Overall Performance', value: evaluation.overall_rating }
                          ].map((rating, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100">
                              <span className="text-sm font-semibold text-slate-700">{rating.label}</span>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">{renderStars(rating.value)}</div>
                                <span className="text-blue-600 font-bold text-sm">{rating.value}/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths */}
                      {evaluation.strengths && (
                        <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100/50">
                          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Strengths
                          </p>
                          <p className="text-slate-700 leading-relaxed font-medium">{evaluation.strengths}</p>
                        </div>
                      )}

                      {/* Areas for Improvement */}
                      {evaluation.weaknesses && (
                        <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50">
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">Areas for Improvement</p>
                          <p className="text-slate-700 leading-relaxed font-medium">{evaluation.weaknesses}</p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {evaluation.recommendations && (
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Recommendations</p>
                          <p className="text-slate-700 leading-relaxed font-medium">{evaluation.recommendations}</p>
                        </div>
                      )}

                      {/* Final Comments */}
                      {evaluation.final_comments && (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Final Comments</p>
                          <p className="text-slate-700 leading-relaxed font-medium">"{evaluation.final_comments}"</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;