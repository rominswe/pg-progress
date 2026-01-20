import { useEffect, useState, useMemo } from "react";
import { Users, UserCheck, Clock, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import adminService from "@/services/adminService";
import { useCalendar } from "@/hooks/useCalendar";
import CalendarComponent from "@/components/common/CalendarComponent";
import { useAuth } from "@/components/auth/AuthContext";

/**
 * Dashboard Component
 * Displays system-wide overview statistics for Post Graduate users and recent activities.
 */
export default function Dashboard() {
  const { user } = useAuth();
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: calendarData } = useCalendar('admin');
  const calendarEvents = calendarData?.data || [];
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalPending: 0,
    totalDocuments: 328,
  });

  // --- Data Fetching ---

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes] = await Promise.all([
          adminService.getDashboardStats()
        ]);

        if (isMounted) {
          if (statsRes?.success && statsRes?.data) {
            setStatsData(statsRes.data);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (isMounted) setError("Failed to load dashboard data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Memoized Stats Grid Configuration ---
  const statsConfig = useMemo(() => [
    {
      title: 'Total Post Graduate Students',
      value: statsData.totalStudents,
      change: `+${statsData.studentGrowth || 0}%`,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Total Academic Staff',
      value: statsData.totalStaff,
      change: `+${statsData.staffGrowth || 0}%`,
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Total Account Pending Verifications',
      value: statsData.totalPending,
      change: 'Active',
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Total Documents Processed',
      value: statsData.totalDocuments,
      change: `+${statsData.docGrowth || 0}%`,
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-600',
    },
  ], [statsData, loading]);



  return (
    <div className="space-y-8 max-w-full px-6 mx-auto animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {user?.role_id === 'CGSADM' ? 'CGS Admin Dashboard' : 'CGS Staff Dashboard'}
          </h1>
          <p className="text-blue-100 font-medium text-lg italic opacity-90">
            {user?.role_id === 'CGSADM'
              ? 'System-wide oversight and academic management portal.'
              : 'Institutional monitoring and postgraduate support portal.'}
          </p>
        </div>
      </div>

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

      {/* Academic Calendar Section */}
      <section className="mt-8">
        <CalendarComponent events={calendarEvents} type="admin" />
      </section>
    </div>
  );

}
