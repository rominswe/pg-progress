import { Users, FileCheck, CheckCircle, FileText } from "lucide-react";
import Card from "./ui/Card";
import { dashboardStats, students } from "../../data/supervisorData";

export default function SupervisorDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: dashboardStats.totalStudents,
      icon: Users,
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Pending Reviews",
      value: dashboardStats.pendingReviews,
      icon: FileCheck,
      textColor: "text-yellow-600",
      bgLight: "bg-yellow-50",
    },
    {
      title: "Thesis Approved",
      value: dashboardStats.thesisApproved,
      icon: CheckCircle,
      textColor: "text-green-600",
      bgLight: "bg-green-50",
    },
    {
      title: "Proposals Reviewed",
      value: dashboardStats.proposalsReviewed,
      icon: FileText,
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
    },
  ];

  const recentActivity = [...students]
    .sort(
      (a, b) =>
        new Date(b.lastSubmissionDate).getTime() -
        new Date(a.lastSubmissionDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Dr. Sarah Johnson</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgLight} p-3 rounded-lg`}>
                  <Icon className={stat.textColor} size={28} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Student Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Student Progress Overview
          </h2>
          <div className="space-y-4">
            {students.slice(0, 4).map((student) => (
              <div key={student.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {student.name}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {student.progress}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      student.progress >= 80
                        ? "bg-green-500"
                        : student.progress >= 50
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((student) => (
              <div
                key={student.id}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {student.researchTitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Last submission:{" "}
                    {new Date(
                      student.lastSubmissionDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Average Student Progress
            </p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(
                  students.reduce((sum, s) => sum + s.progress, 0) /
                    students.length
                )}
                %
              </p>
              <p className="text-xs text-green-600 font-medium mb-1">
                +5% this month
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Response Time</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-800">2.3 days</p>
              <p className="text-xs text-green-600 font-medium mb-1">
                -0.5 days
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-800">85%</p>
              <p className="text-xs text-green-600 font-medium mb-1">+3%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
