import React from "react";
import { Users, UserCheck, Clock, FileText, TrendingUp, Bell, ChevronRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { motion } from "framer-motion";

const stats = [
  {
    title: 'Total Students',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'blue',
  },
  {
    title: 'Active Supervisors',
    value: '89',
    change: '+3%',
    icon: UserCheck,
    color: 'blue',
  },
  {
    title: 'Pending Verifications',
    value: '45',
    change: '-8%',
    icon: Clock,
    color: 'blue',
  },
  {
    title: 'Documents This Month',
    value: '328',
    change: '+23%',
    icon: FileText,
    color: 'blue',
  },
];

const recentActivities = [
  { id: 1, action: 'New student registered', user: 'Ahmad bin Ibrahim', time: '2 mins ago', type: 'registration' },
  { id: 2, action: 'Document approved', user: 'Dr. Razak bin Abdullah', time: '15 mins ago', type: 'approval' },
  { id: 3, action: 'Progress report submitted', user: 'Siti Nurhaliza', time: '1 hour ago', type: 'submission' },
  { id: 4, action: 'Supervisor assigned', user: 'Prof. Dr. Aminah', time: '2 hours ago', type: 'assignment' },
  { id: 5, action: 'Thesis draft uploaded', user: 'Muhammad Farhan', time: '3 hours ago', type: 'submission' },
];

export default function CGSDashboard() {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-full px-6 mx-auto pb-12"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">CGS Administration Portal</h1>
            <p className="text-blue-100 font-medium text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System overview and administrative analytics for AIU PG Portal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold">System Online</span>
            </div>
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 transform hover:-translate-y-1 group bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </CardTitle>
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      <TrendingUp className={`w-3 h-3 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
                      {stat.change}
                    </div>
                    <span className="text-xs font-semibold text-slate-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  Recent System Activity
                </CardTitle>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All Logs</button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{activity.action}</p>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">{activity.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wide group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        {activity.time}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-sm text-sm uppercase tracking-widest">
                Generate Analytical Report
              </button>
            </div>
          </Card>
        </motion.div>

        {/* System Health / Secondary Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden h-full">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-6 h-6 text-orange-500" />
                System Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Database Backup Successful</p>
                    <p className="text-xs text-slate-500 font-medium">Daily automated backup completed at 03:00 AM.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">New Form Template Released</p>
                    <p className="text-xs text-slate-500 font-medium">Evaluation Form v3.0 is now active for supervisors.</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-50">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Pending System Update</p>
                    <p className="text-xs text-slate-400 font-medium">Maintenance scheduled for next Sunday.</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-blue-600 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-lg font-bold mb-2 relative z-10">Admin Support</h4>
                <p className="text-xs text-blue-100 mb-4 relative z-10 font-medium">Need help managing the portal or technical assistance?</p>
                <button className="w-full py-2.5 bg-white text-blue-600 font-bold rounded-xl text-xs relative z-10 shadow-lg">
                  Contact IT Support
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
