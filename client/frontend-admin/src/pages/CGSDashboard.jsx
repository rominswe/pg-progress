import React from "react";
import { Users, UserCheck, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';

const stats = [
  {
    title: 'Total Students',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Active Supervisors',
    value: '89',
    change: '+3%',
    icon: UserCheck,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Pending Verifications',
    value: '45',
    change: '-8%',
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: 'Documents This Month',
    value: '328',
    change: '+23%',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600',
  },
];

const recentActivities = [
  { id: 1, action: 'New student registered', user: 'Ahmad bin Ibrahim', time: '2 mins ago' },
  { id: 2, action: 'Document approved', user: 'Dr. Razak bin Abdullah', time: '15 mins ago' },
  { id: 3, action: 'Progress report submitted', user: 'Siti Nurhaliza', time: '1 hour ago' },
  { id: 4, action: 'Supervisor assigned', user: 'Prof. Dr. Aminah', time: '2 hours ago' },
  { id: 5, action: 'Thesis draft uploaded', user: 'Muhammad Farhan', time: '3 hours ago' },
];

export default function CGSDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of the system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}