import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { documentService } from "../../services/api";
import { FileText, Clock, CheckCircle, TrendingUp, AlertCircle, Calendar, ArrowRight, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [overviewData, setOverviewData] = useState({ progress: 0, onTrack: 0, needAttention: 0 });
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch profile and stats in parallel
      const [profileData, statsData] = await Promise.all([
        api.get('/api/profile/me'),
        documentService.getDashboardStats()
      ]);

      if (profileData.data && profileData.data.data) {
        setUserProfile(profileData.data.data);
      }

      const data = statsData;

      // Update Stats Cards
      setStats([
        {
          title: "Total Documents",
          value: data.stats.totalDocuments?.toString() || "0",
          icon: FileText,
          change: "Current semester",
          color: "blue",
          link: "/student/uploads"
        },
        {
          title: "Overall Progress",
          value: `${data.stats.progress}%`,
          icon: TrendingUp,
          change: data.stats.progress === 100 ? "Completed" : "In Progress",
          color: "blue",
          link: "/student/progress-updates"
        },
        {
          title: "Pending Reviews",
          value: data.stats.pendingReviews?.toString() || "0",
          icon: Clock,
          change: "Awaiting Feedback",
          color: "blue",
          link: "/student/uploads"
        },
        {
          title: "Verified assets",
          value: data.stats.approved?.toString() || "0",
          icon: CheckCircle,
          change: "Successfully verified",
          color: "blue",
          link: "/student/feedback"
        },
      ]);

      const dashboardSummary = {
        progress: data.stats.progress,
        onTrack: data.stats.progress > 0 ? 1 : 0,
        needAttention: data.stats.rejected || 0
      };
      setOverviewData(dashboardSummary);

      // Update Recent Activities
      const formattedActivities = (data.recentActivity || []).map(act => ({
        action: act.action,
        time: new Date(act.date).toLocaleDateString(),
        status: "info",
        details: act.details
      }));
      setRecentActivities(formattedActivities);

      setUpcomingDeadlines([]); // Clear deadlines if not supported yet

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats([
        { title: "Total Documents", value: "-", icon: FileText, change: "Error", color: "blue" },
        { title: "Overall Progress", value: "-", icon: TrendingUp, change: "Error", color: "purple" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 max-w-full px-6 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight mb-1">
            Welcome back, {userProfile ? userProfile.FirstName : 'Student'}! 👋
          </h2>
          <p className="text-blue-100 font-medium text-base">Here's your research progress overview for this semester.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon || FileText;
          const colorMap = {
            blue: "text-blue-600 bg-blue-50",
            orange: "text-orange-600 bg-orange-50",
            green: "text-green-600 bg-green-50",
            purple: "text-purple-600 bg-purple-50"
          };
          const colorClass = colorMap[stat.color] || colorMap.blue;

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                  {stat.change || 'Stable'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.title}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Progress Overview */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Student Progress Overview
            </h3>
            <button
              onClick={() => navigate('/student/progress-updates')}
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="p-8 flex-1">
            <div className="flex justify-between items-end mb-4">
              <span className="text-lg font-bold text-slate-800">
                {userProfile ? `${userProfile.FirstName} ${userProfile.LastName}` : 'Student'}
              </span>
              <span className="text-lg font-bold text-slate-900">{overviewData.progress}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overviewData.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-blue-600 h-full rounded-full shadow-sm"
              />
            </div>

            <div className="grid grid-cols-3 border-t border-slate-100 pt-8 mt-auto">
              <div className="text-center border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg. Progress</p>
                <p className="text-2xl font-black text-slate-800">{overviewData.progress}%</p>
              </div>
              <div className="text-center border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">On Track</p>
                <p className="text-2xl font-black text-blue-600">{overviewData.onTrack}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Need Attention</p>
                <p className="text-2xl font-black text-blue-400">{overviewData.needAttention}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deadlines - Side Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Upcoming Deadlines
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-10">
              <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm italic">No upcoming deadlines at the moment.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities - Full Width */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Recent Activity Log</h3>
        </div>
        <div className="p-8">
          {recentActivities.length === 0 ? (
            <p className="text-slate-500 text-center">No recent activities found.</p>
          ) : (
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-5 relative">
                  {/* Timeline Line */}
                  {index !== recentActivities.length - 1 && (
                    <div className="absolute left-[22px] top-12 bottom-[-24px] w-0.5 bg-slate-100"></div>
                  )}

                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${activity.status === "success" ? "bg-blue-600 text-white shadow-blue-200" :
                    activity.status === "warning" ? "bg-blue-400 text-white shadow-blue-100" :
                      "bg-blue-50 text-blue-600 shadow-blue-100"
                    }`}>
                    {activity.status === "success" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : activity.status === "warning" ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      <TrendingUp className="w-6 h-6" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-slate-900">{activity.action}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;