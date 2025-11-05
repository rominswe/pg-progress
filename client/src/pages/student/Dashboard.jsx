import React from 'react';
import { FileText, MessageSquare, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Thesis Status',
      value: 'In Progress',
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Supervisor Feedback',
      value: '3 New',
      icon: MessageSquare,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Tasks',
      value: '5 Tasks',
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Milestones',
      value: '7 / 12',
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const recentActivities = [
    { action: 'Submitted Chapter 3 Draft', time: '2 hours ago', status: 'success' },
    { action: 'Received feedback on Methodology', time: '1 day ago', status: 'info' },
    { action: 'Uploaded Research Proposal', time: '3 days ago', status: 'success' },
    { action: 'Meeting scheduled with supervisor', time: '5 days ago', status: 'warning' },
  ];

  const upcomingDeadlines = [
    { task: 'Submit Chapter 4', date: '2025-11-15', priority: 'high' },
    { task: 'Literature Review Update', date: '2025-11-20', priority: 'medium' },
    { task: 'Progress Report', date: '2025-11-30', priority: 'medium' },
    { task: 'Ethics Approval Renewal', date: '2025-12-05', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, John!</h2>
        <p className="text-gray-500 mt-1">Here's your research progress overview</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Progress and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Research Progress</h3>
            <span className="text-sm text-gray-500">Overall: 58%</span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Thesis Writing', value: 70, color: 'bg-blue-600' },
              { label: 'Data Collection', value: 85, color: 'bg-green-600' },
              { label: 'Literature Review', value: 100, color: 'bg-green-600' },
              { label: 'Data Analysis', value: 45, color: 'bg-orange-600' },
              { label: 'Final Review', value: 15, color: 'bg-red-600' },
            ].map((progress, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{progress.label}</span>
                  <span className="text-gray-500">{progress.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${progress.color} h-2 rounded-full`} style={{ width: `${progress.value}%` }}></div>
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