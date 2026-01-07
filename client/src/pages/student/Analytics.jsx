import { useState, useEffect } from "react";
import { TrendingUp, FileText, Clock, Target } from "lucide-react";
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

const Analytics = () => {
   // ===================== State for fetched data =====================
  const [progressData, setProgressData] = useState([]);
  const [documentStats, setDocumentStats] = useState([]);
  const [timeAllocation, setTimeAllocation] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [loading, setLoading] = useState(true);


 // ===================== Fetch data from API =====================
  useEffect(() => {
    // TODO: Replace with your actual API endpoints
    // Example routes:
    // GET /api/student/progress
    // GET /api/student/documents
    // GET /api/student/time-allocation
    // GET /api/student/weekly-activity

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Example: Fetch progress data
        const progressRes = await fetch("/api/student/progress");
        const progressJson = await progressRes.json();
        setProgressData(progressJson); // progressJson should be array of { month, completion }

        // Example: Fetch document statistics
        const documentRes = await fetch("/api/student/documents");
        const documentJson = await documentRes.json();
        setDocumentStats(documentJson); // documentJson should be array of { name, count }

        // Example: Fetch time allocation
        const timeRes = await fetch("/api/student/time-allocation");
        const timeJson = await timeRes.json();
        setTimeAllocation(timeJson); // timeJson should be array of { name, value, color }

        // Example: Fetch weekly activity
        const weeklyRes = await fetch("/api/student/weekly-activity");
        const weeklyJson = await weeklyRes.json();
        setWeeklyActivity(weeklyJson); // weeklyJson should be array of { week, hours }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return <p className="text-gray-500">Loading analytics data...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Research Analytics</h2>
        <p className="text-gray-500 mt-1">
          Visualize your research progress and productivity
        </p>
      </div>

      {/* ====================== Summary Cards ====================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Hours</p>
              {/* TODO: Replace hardcoded value with API data */}
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {progressData.reduce((sum, item) => sum + item.completion, 0)}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {/* Optional: compute percentage dynamically */}
                +12% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Documents card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Documents</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {documentStats.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +4 this month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Completion card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Completion</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {/* TODO: compute completion dynamically */}
                {Math.round(
                  (progressData[progressData.length - 1]?.completion || 0)
                )}
                %
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +6% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average weekly */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Weekly</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {/* TODO: compute average dynamically */}
                {Math.round(
                  weeklyActivity.reduce((sum, item) => sum + item.hours, 0) /
                    weeklyActivity.length
                )}
                h
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Consistent
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ====================== Charts ====================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Document Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={documentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Bar combo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Time Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {timeAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Weekly Activity (Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="hours" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== Insights ====================== */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Insights & Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-medium text-gray-800 mb-1">Productivity Trend</p>
            <p className="text-xs text-gray-600">
              Your weekly hours have been consistently above 35 hours. Great work maintaining steady progress!
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-medium text-gray-800 mb-1">Document Output</p>
            <p className="text-xs text-gray-600">
              You've submitted 4 new documents this month, which is above your average. Keep up the momentum!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;