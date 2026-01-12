import { useState, useEffect } from "react";
import { TrendingUp, FileText, Clock, Target, Lightbulb, BarChart2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";

const Analytics = () => {
  // ===================== State for fetched data =====================
  const [progressData, setProgressData] = useState([]);
  const [documentStats, setDocumentStats] = useState([]);
  const [timeAllocation, setTimeAllocation] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [loading, setLoading] = useState(true);


  // ===================== Fetch data from API =====================
  useEffect(() => {
    // Mock data loading
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Simulate/Use actual API calls here. Providing Fallback Mock Data for immediate visual result:
        setProgressData([
          { month: 'Jan', completion: 15 },
          { month: 'Feb', completion: 30 },
          { month: 'Mar', completion: 45 },
          { month: 'Apr', completion: 60 },
          { month: 'May', completion: 75 },
          { month: 'Jun', completion: 82 },
        ]);

        setDocumentStats([
          { name: 'Reports', count: 12 },
          { name: 'Drafts', count: 8 },
          { name: 'Forms', count: 5 },
          { name: 'Other', count: 3 },
        ]);

        setTimeAllocation([
          { name: 'Research', value: 45, color: '#3B82F6' },
          { name: 'Writing', value: 30, color: '#10B981' },
          { name: 'Meetings', value: 15, color: '#F59E0B' },
          { name: 'Admin', value: 10, color: '#8B5CF6' },
        ]);

        setWeeklyActivity([
          { week: 'W1', hours: 32 },
          { week: 'W2', hours: 40 },
          { week: 'W3', hours: 28 },
          { week: 'W4', hours: 35 },
        ]);

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
          { title: "Total Hours", value: "135h", change: "+12% this month", icon: Clock, color: "blue" },
          { title: "Documents Sub.", value: "28", change: "+4 this month", icon: FileText, color: "blue" },
          { title: "Completion Rate", value: "82%", change: "+6% this month", icon: Target, color: "blue" },
          { title: "Avg. Weekly", value: "34h", change: "Broadly Consistent", icon: TrendingUp, color: "blue" },
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
                <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full bg-slate-50 w-fit text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
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
            <h3 className="text-xl font-bold text-slate-800">Progress Trend</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg p-2 font-medium outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
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
            <h3 className="text-xl font-bold text-slate-800">Document Statistics</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
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

      {/* Pie + Bar combo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6">Time Allocation</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {timeAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6">Weekly Activity (Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
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
              <Bar dataKey="hours" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ====================== Insights ====================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Lightbulb className="w-6 h-6 text-yellow-300" />
          </div>
          <h4 className="text-xl font-bold">AI Insights & Recommendations</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-colors">
            <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">Productivity Trend</p>
            <p className="font-medium text-white leading-relaxed">
              Your weekly hours have consistently exceeded 35 hours. This sustained effort is placing you in the top 10% of your cohort. Keep it up!
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-colors">
            <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">Document Output</p>
            <p className="font-medium text-white leading-relaxed">
              You've submitted 4 new documents this month. Based on your current trajectory, you are on track to complete your thesis draft by mid-November.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;