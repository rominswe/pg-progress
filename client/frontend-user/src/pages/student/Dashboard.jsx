// import { useState, useEffect } from "react";
// import api from "../../services/api";
// import { FileText, Clock, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

// const Dashboard = () => {
//   const [stats, setStats] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
//       const [statsRes, activitiesRes, deadlinesRes] = await Promise.all([
//         api.get("/student/stats"),
//         api.get("/student/activities"),
//         api.get("/student/deadlines"),
//       ]);

//       setStats(statsRes.data || []);
//       setRecentActivities(activitiesRes.data || []);
//       setUpcomingDeadlines(deadlinesRes.data || []);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64 text-gray-500">
//         Loading your dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
//         <p className="text-gray-500 mt-1">Here's your research progress overview</p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon || FileText;
//           return (
//             <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
//                   <p className="text-2xl font-bold mt-2 text-blue-600">{stat.value}</p>
//                 </div>
//                 <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
//                   <Icon className="w-6 h-6 text-blue-600" />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Research Progress + Deadlines */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Progress */}
//         <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Research Progress</h3>
//           {[{ label: "Thesis Writing", value: 70 }, { label: "Data Collection", value: 85 }].map(
//             (progress, i) => (
//               <div key={i} className="mb-4">
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="font-medium text-gray-700">{progress.label}</span>
//                   <span className="text-gray-500">{progress.value}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-blue-600 h-2 rounded-full"
//                     style={{ width: `${progress.value}%` }}
//                   />
//                 </div>
//               </div>
//             )
//           )}
//         </div>

//         {/* Deadlines */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
//           {upcomingDeadlines.map((deadline, index) => (
//             <div
//               key={index}
//               className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
//             >
//               <div
//                 className={`w-2 h-2 rounded-full mt-2 ${
//                   deadline.priority === "high"
//                     ? "bg-red-500"
//                     : deadline.priority === "medium"
//                     ? "bg-orange-500"
//                     : "bg-green-500"
//                 }`}
//               />
//               <div>
//                 <p className="text-sm font-medium text-gray-800">{deadline.task}</p>
//                 <p className="text-xs text-gray-500">{deadline.date}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent Activities */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
//         {recentActivities.map((activity, index) => (
//           <div
//             key={index}
//             className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
//           >
//             <div
//               className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                 activity.status === "success"
//                   ? "bg-green-50"
//                   : activity.status === "warning"
//                   ? "bg-orange-50"
//                   : "bg-blue-50"
//               }`}
//             >
//               {activity.status === "success" ? (
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//               ) : activity.status === "warning" ? (
//                 <AlertCircle className="w-5 h-5 text-orange-600" />
//               ) : (
//                 <TrendingUp className="w-5 h-5 text-blue-600" />
//               )}
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-800">{activity.action}</p>
//               <p className="text-xs text-gray-500">{activity.time}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import { useState, useEffect } from "react";
import api, { authService } from "../../services/api";
import { FileText, Clock, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, activitiesRes, deadlinesRes] = await Promise.all([
        api.get("/student/stats"),
        api.get("/student/activities"),
        api.get("/student/deadlines"),
      ]);

      setStats(statsRes.data || []);
      setRecentActivities(activitiesRes.data || []);
      setUpcomingDeadlines(deadlinesRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
        <p className="text-gray-500 mt-1">Here's your research progress overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon || FileText;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2 text-blue-600">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Research Progress</h3>
          {[{ label: "Thesis Writing", value: 70 }, { label: "Data Collection", value: 85 }].map(
            (progress, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{progress.label}</span>
                  <span className="text-gray-500">{progress.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress.value}%` }} />
                </div>
              </div>
            )
          )}
        </div>

        {/* Deadlines */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                deadline.priority === "high" ? "bg-red-500" :
                deadline.priority === "medium" ? "bg-orange-500" :
                "bg-green-500"
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-800">{deadline.task}</p>
                <p className="text-xs text-gray-500">{deadline.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activity.status === "success" ? "bg-green-50" :
              activity.status === "warning" ? "bg-orange-50" :
              "bg-blue-50"
            }`}>
              {activity.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : activity.status === "warning" ? (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;