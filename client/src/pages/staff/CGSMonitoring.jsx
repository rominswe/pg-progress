import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Activity, Users, Search, Filter, ArrowUpRight, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { progressService } from '../../services/api';

export default function CGSMonitoring() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await progressService.getMyStudents(); // Re-using this endpoint (it returns students in Dept)
      setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    } finally {
      setLoading(false);
    }
  };

  // Generic status helper based on progress
  const getDerivedStatus = (progress) => {
    if (progress >= 80) return 'On Track';
    if (progress >= 50) return 'Delayed'; // Logic: 50-79 is acceptable but maybe delayed? Or "In Progress"
    return 'At Risk';
  };

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
          <Badge className="bg-red-100 text-red-500 border-red-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
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

  // Calculate generic stats
  const onTrackCount = students.filter(s => getDerivedStatus(s.progress) === 'On Track').length;
  const delayedCount = students.filter(s => getDerivedStatus(s.progress) === 'Delayed').length;
  const atRiskCount = students.filter(s => getDerivedStatus(s.progress) === 'At Risk').length;

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
          { label: 'On Track', count: onTrackCount, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delayed', count: delayedCount, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-50' },
          { label: 'At Risk', count: atRiskCount, icon: Users, color: 'text-red-400', bg: 'bg-red-50' }
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
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="mt-4 text-slate-500 font-bold">Syncing data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 border-b border-slate-100">
                      <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</TableHead>
                      <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Supervisor</TableHead>
                      <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Program</TableHead>
                      <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Progress</TableHead>
                      <TableHead className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                          No students found in this department.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100">
                                {student.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{student.name}</span>
                                <span className="text-xs text-slate-400">{student.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-slate-400 italic">N/A</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              {student.program || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5 flex flex-col w-32">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                <span>COMPLETION</span>
                                <span>{student.progress}%</span>
                              </div>
                              <Progress
                                value={student.progress}
                                className="h-1.5"
                                indicatorClassName={
                                  student.progress >= 80 ? 'bg-blue-600' :
                                    student.progress >= 50 ? 'bg-blue-400' : 'bg-red-400'
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-6">{getStatusBadge(getDerivedStatus(student.progress))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
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
