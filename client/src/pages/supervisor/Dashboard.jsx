import { useState, useEffect } from 'react';
import { Users, FileCheck, CheckCircle, FileText, ArrowRight, TrendingUp, Clock, GraduationCap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { progressService, authService, dashboardService } from '@/services/api';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [realStats, setRealStats] = useState({
    totalStudents: 0,
    pendingReviews: 0,
    thesisApproved: 0,
    proposalsReviewed: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, profileRes, statsRes, pendingRes] = await Promise.all([
        progressService.getMyStudents(),
        authService.me(),
        dashboardService.getSupervisorStats(),
        progressService.getPendingEvaluations()
      ]);
      setStudents(studentsRes.data?.students || []);
      setUserProfile(profileRes.data?.data || profileRes.data); // Fallback for profile
      setRealStats(statsRes.data || {});
      setPendingEvaluations(pendingRes.data?.evaluations || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = realStats;

  const stats = [
    {
      title: "Active Students",
      value: dashboardStats.totalStudents,
      icon: Users,
      color: "blue",
      change: "Managed by you",
      link: "/supervisor/students"
    },
    {
      title: "Pending Reviews",
      value: dashboardStats.pendingReviews,
      icon: FileCheck,
      color: "blue",
      change: "Requires attention",
      link: "/supervisor/evaluate"
    },
    {
      title: "Thesis Approved",
      value: dashboardStats.thesisApproved,
      icon: CheckCircle,
      color: "blue",
      change: "Final submissions",
      link: "/supervisor/evaluate-2"
    },
    {
      title: "Proposal Defense",
      value: dashboardStats.proposalsReviewed,
      icon: FileText,
      color: "blue",
      change: "Defense reviews",
      link: "/supervisor/evaluate-2"
    },
  ];

  const recentActivity = [...pendingEvaluations]
    .sort(
      (a, b) =>
        new Date(b.submittedDate).getTime() -
        new Date(a.submittedDate).getTime()
    )
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Loading dashboard insights...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-full px-6 mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Supervisor Dashboard</h1>
          <p className="text-blue-100 font-medium text-base">
            Welcome back, {userProfile ? userProfile.name : 'Professor'}. Here is your supervision overview.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">{stat.title}</p>
                  <h3 className={`text-3xl font-extrabold mt-2 text-${stat.color}-600`}>{stat.value}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Student Progress */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Student Progress Overview
              </h2>
              <button
                onClick={() => navigate('/supervisor/students')}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="p-6 space-y-6">
              {students.length > 0 ? (
                students.slice(0, 4).map((student) => (
                  <div
                    key={student.id}
                    className="cursor-pointer group"
                    onClick={() => navigate('/supervisor/students')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{student.name}</p>
                        {student.researchTitle && <p className="text-xs text-slate-500">{student.researchTitle}</p>}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${student.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full shadow-sm ${student.progress >= 80 ? "bg-blue-600" :
                          student.progress >= 50 ? "bg-blue-400" : "bg-blue-300"
                          }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium italic">No active students to display.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Avg. Progress</p>
                  <p className="text-xl font-extrabold text-slate-800">
                    {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0}%
                  </p>
                </div>
                <div className="text-center border-l border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">On Track</p>
                  <p className="text-xl font-extrabold text-blue-600">{students.filter(s => s.progress >= 80).length}</p>
                </div>
                <div className="text-center border-l border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Need Attention</p>
                  <p className="text-xl font-extrabold text-blue-400">{students.filter(s => s.progress < 50).length}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Recent Activity
              </h2>
            </div>

            <div className="p-0">
              {recentActivity.length > 0 ? (
                recentActivity.map((student, idx) => (
                  <div
                    key={student.id}
                    onClick={() => navigate('/supervisor/evaluate')}
                    className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                        {student.fullName}
                      </p>
                      <p className="text-xs text-slate-500 mb-1">{student.title || "submitted a progress update"}</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        {new Date(student.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-2 text-slate-300 group-hover:text-blue-600 transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-medium line-clamp-2">No recent student submissions recorded.</p>
                </div>
              )}
            </div>

            <div className="p-4">
              <button
                onClick={() => navigate('/supervisor/evaluate')}
                className="w-full py-2.5 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                View All Activities
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
