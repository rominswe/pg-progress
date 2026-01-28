import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);

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

  useEffect(() => {
    let isMounted = true;

    const fetchActivity = async () => {
      try {
        setActivityLoading(true);
        setActivityError(null);

        const res = await adminService.getRecentActivity();
        if (!isMounted) return;

        if (res?.success) {
          setRecentActivity(res.data || []);
        } else {
          setActivityError("Failed to load recent activity");
        }
      } catch (err) {
        console.error("Failed to load recent activity:", err);
        if (isMounted) setActivityError("Failed to load recent activity");
      } finally {
        if (isMounted) setActivityLoading(false);
      }
    };

    fetchActivity();

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
      link: '/cgs/users'
    },
    {
      title: 'Total Academic Staff',
      value: statsData.totalStaff,
      change: `+${statsData.staffGrowth || 0}%`,
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-600',
      link: '/cgs/users'
    },
    {
      title: 'Total Account Pending Verifications',
      value: statsData.totalPending,
      change: 'Active',
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600',
      link: '/cgs/approvals'
    },
    {
      title: 'Total Documents Processed',
      value: statsData.totalDocuments,
      change: `+${statsData.docGrowth || 0}%`,
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-600',
      link: '/cgs/monitoring'
    },
  ], [statsData, loading]);

  const formattedActivities = recentActivity.map((activity) => ({
    ...activity,
    action: `${activity.studentName} uploaded ${activity.documentType}`,
    time: activity.date ? new Date(activity.date).toLocaleDateString() : 'Just now',
  }));

  const getActivityTone = (status) => {
    if (status === 'Approved') return 'bg-emerald-50 text-emerald-600 shadow-emerald-200';
    if (status === 'Rejected') return 'bg-red-50 text-red-600 shadow-red-200';
    return 'bg-blue-50 text-blue-600 shadow-blue-200';
  };



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
            <Card
              key={stat.title}
              role="button"
              tabIndex={0}
              className="hover:shadow-md transition-shadow cursor-pointer focus-visible:outline focus-visible:ring focus-visible:ring-blue-500/40"
              onClick={() => stat.link && navigate(stat.link)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  stat.link && navigate(stat.link);
                }
              }}
            >
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

      {/* Recent Activity Log */}
      <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-4">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h2>
          <p className="text-sm text-slate-500">
            Latest uploads and actions monitored by CGS staff.
          </p>
        </div>
        <div className="p-8 space-y-6">
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : activityError ? (
            <p className="text-sm text-destructive text-center">{activityError}</p>
          ) : formattedActivities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center">No recent activities recorded yet.</p>
          ) : (
            formattedActivities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start gap-5">
                {index !== formattedActivities.length - 1 && (
                  <div className="absolute left-[20px] top-12 bottom-[-22px] w-0.5 bg-slate-100" />
                )}
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${getActivityTone(activity.status)}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="pt-1 flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{activity.action}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{activity.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Academic Calendar Section */}
      <section className="mt-8">
        <CalendarComponent events={calendarEvents} type="admin" />
      </section>
    </div>
  );

}
