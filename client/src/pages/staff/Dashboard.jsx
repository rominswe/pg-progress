import { useEffect, useState, useMemo } from "react";
import { Users, UserCheck, Clock, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import adminService from "@/services/adminService";

/**
 * Dashboard Component
 * Displays system-wide overview statistics for Post Graduate users and recent activities.
 */
export default function Dashboard() {
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalPending: 0,
    totalDocuments: 328,
  });

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch accurate statistics from the dedicated backend endpoint
        const res = await adminService.getDashboardStats();

        if (res?.success && res?.data) {
          if (isMounted) {
            setStatsData(res.data);
          }
        }
      } catch (err) {
        console.error("Dashboard stats fetch error:", err);
        if (isMounted) {
          setError("Failed to load dashboard statistics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Memoized Stats Grid Configuration ---
  const statsConfig = useMemo(() => [
    {
      title: 'Total Post Graduate Students',
      value: statsData.totalStudents,
      change: '+12%', // Mock trend
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Total Academic Staff',
      value: statsData.totalStaff,
      change: '+3%', // Mock trend
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Total Account Pending Verifications',
      value: statsData.totalPending,
      change: '-8%', // Mock trend
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Total Documents This Month',
      value: statsData.totalDocuments,
      change: '+23%', // Mock trend
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-600',
    },
  ], [statsData, loading]);

  // --- Static Recent Activities (Mock) ---
  const recentActivities = [
    { id: 1, action: 'New student registered', user: 'Ahmad bin Ibrahim', time: '2 mins ago' },
    { id: 2, action: 'Document approved', user: 'Dr. Razak bin Abdullah', time: '15 mins ago' },
    { id: 3, action: 'Progress report submitted', user: 'Siti Nurhaliza', time: '1 hour ago' },
    { id: 4, action: 'Supervisor assigned', user: 'Prof. Dr. Aminah', time: '2 hours ago' },
    { id: 5, action: 'Thesis draft uploaded', user: 'Muhammad Farhan', time: '3 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of the system.</p>
      </header>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Recent Activity Section */}
      <section>
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
      </section>
    </div>
  );
}
