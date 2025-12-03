import { useState, useEffect } from 'react';
import { FileText, MessageSquare, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';

const Dashboard = () => {
  // ================= STATE SETUP =================
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // ✅ Example API endpoints — update based on your backend routes
        const [statsRes, activitiesRes, deadlinesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/student/stats`),
          axios.get(`${API_BASE_URL}/student/activities`),
          axios.get(`${API_BASE_URL}/student/deadlines`),
        ]);

        // ✅ Populate data
        setStats(statsRes.data || []);
        setRecentActivities(activitiesRes.data || []);
        setUpcomingDeadlines(deadlinesRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ================= LOADING STATE =================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  // ================= MAIN RENDER =================
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
        <p className="text-gray-500 mt-1">Here's your research progress overview</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon || FileText;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold mt-2 text-blue-600`}>
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Progress + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Research Progress</h3>
            <span className="text-sm text-gray-500">Overall: 58%</span>
          </div>

          <div className="space-y-4">
            {/* 👇 Example progress bars — replace with backend data if available */}
            {[
              { label: 'Thesis Writing', value: 70 },
              { label: 'Data Collection', value: 85 },
              { label: 'Literature Review', value: 100 },
              { label: 'Data Analysis', value: 45 },
              { label: 'Final Review', value: 15 },
            ].map((progress, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{progress.label}</span>
                  <span className="text-gray-500">{progress.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progress.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    deadline.priority === 'high'
                      ? 'bg-red-500'
                      : deadline.priority === 'medium'
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{deadline.task}</p>
                  <p className="text-xs text-gray-500 mt-1">{deadline.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.status === 'success'
                    ? 'bg-green-50'
                    : activity.status === 'warning'
                    ? 'bg-orange-50'
                    : 'bg-blue-50'
                }`}
              >
                {activity.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : activity.status === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;