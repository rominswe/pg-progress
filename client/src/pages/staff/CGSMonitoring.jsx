import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Activity, Users, Search, Filter, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const mockProgress = [
  { id: 1, studentName: 'Ahmad bin Ibrahim', supervisorName: 'Dr. Razak', department: 'Computer Science', progress: 85, status: 'On Track' },
  { id: 2, studentName: 'Siti Nurhaliza', supervisorName: 'Prof. Aminah', department: 'Information Systems', progress: 45, status: 'Delayed' },
  { id: 3, studentName: 'Muhammad Farhan', supervisorName: 'Dr. Zulkifli', department: 'Cyber Security', progress: 20, status: 'At Risk' },
  { id: 4, studentName: 'Nurul Izzah', supervisorName: 'Dr. Sarah', department: 'Software Engineering', progress: 95, status: 'On Track' },
];

export default function CGSMonitoring() {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'On Track':
        return (
          <Badge className="bg-blue-600 text-white border-blue-600 shadow-sm px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
            {status}
          </Badge>
        );
      case 'Delayed':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
            {status}
          </Badge>
        );
      case 'At Risk':
        return (
          <Badge className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="rounded-full">{status}</Badge>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-white" />
              Progress Monitoring
            </h1>
            <p className="text-blue-100 font-medium text-lg">
              Analyze student academic progression and pinpoint areas requiring intervention.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all font-bold text-sm">
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'On Track', count: mockProgress.filter(p => p.status === 'On Track').length, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delayed', count: mockProgress.filter(p => p.status === 'Delayed').length, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-50' },
          { label: 'At Risk', count: mockProgress.filter(p => p.status === 'At Risk').length, icon: Users, color: 'text-slate-400', bg: 'bg-slate-50' }
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 transition-all" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <div className="text-4xl font-black text-slate-900 mt-1">{stat.count}</div>
                  <p className="text-xs font-semibold text-slate-400 mt-2">Active postgraduates</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Table */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold text-slate-800">Student Progress Overview</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 border-b border-slate-100">
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Supervisor</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Department</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Progress</TableHead>
                    <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {mockProgress.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100">
                            {item.studentName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{item.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-600">{item.supervisorName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {item.department}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 flex flex-col w-32">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>COMPLETION</span>
                            <span>{item.progress}%</span>
                          </div>
                          <Progress
                            value={item.progress}
                            className="h-1.5"
                            indicatorClassName="bg-blue-600"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-6">{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="p-4 border-t border-slate-50 bg-slate-50/20 text-center">
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
              View Full Departmental Analytics
            </button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
