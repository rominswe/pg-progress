import { useState, useEffect } from "react";
import { TrendingUp, FileText, Target, BarChart2, FolderOpen } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { documentService } from "../../services/api";

const Analytics = () => {
  // ===================== State for fetched data =====================
  const [progressData, setProgressData] = useState([]);
  const [documentStats, setDocumentStats] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    progress: 0,
    pendingReviews: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);


  // ===================== Fetch data from API =====================
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const res = await documentService.getDashboardStats();
        const data = res.data || {};

        if (data.analytics) {
          setProgressData(data.analytics.monthlyProgress || []);
          setDocumentStats(data.analytics.docStats || []);
        }

        if (data.stats) {
          setStats(data.stats);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-full px-6 mx-auto animate-fade-in-up space-y-6 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-white" />
            Research Analytics
          </h2>
          <p className="text-blue-100 font-medium text-base">Deep dive into your productivity metrics and performance trends.</p>
        </div>
      </div>

      {/* ====================== Summary Cards ====================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Documents", value: stats.totalDocuments, icon: FileText, color: "blue" },
          { title: "Completion Rate", value: `${stats.progress}%`, icon: Target, color: "green" },
          { title: "Pending Reviews", value: stats.pendingReviews, icon: FolderOpen, color: "orange" },
          { title: "Recent Trend", value: "+0%", change: "vs last month", icon: TrendingUp, color: "purple" }, // Placeholder for trend
        ].map((stat, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">{stat.value}</h3>
                {stat.change && (
                  <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full bg-slate-50 w-fit text-slate-600">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div className={`p-4 rounded-2xl bg-blue-50 text-blue-600 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ====================== Charts ====================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Progress Trend (Last 6 Months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  padding: "12px"
                }}
              />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Document Uploads by Type</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={documentStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  padding: "12px"
                }}
              />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

    </div>
  );
};

export default Analytics;