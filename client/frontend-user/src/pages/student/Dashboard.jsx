import { useState, useEffect } from 'react';
import { FileText, MessageSquare, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
// import { API_BASE_URL } from "../../services/api";

const Dashboard = () => {
  // ================= STATE SETUP =================
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // ✅ Example API endpoints — update based on your backend routes
        const [statsRes, activitiesRes, deadlinesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/student/stats`),
          axios.get(`${API_BASE_URL}/student/activities`),
          axios.get(`${API_BASE_URL}/student/deadlines`),
        ]);

        // ✅ Populate data
        setStats(statsRes.data || []);
        setRecentActivities(activitiesRes.data || []);
        setUpcomingDeadlines(deadlinesRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ================= LOADING STATE =================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  // ================= MAIN RENDER =================
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
        <p className="text-gray-500 mt-1">Here's your research progress overview</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon || FileText;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold mt-2 text-blue-600`}>
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Progress + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Research Progress</h3>
            <span className="text-sm text-gray-500">Overall: 58%</span>
          </div>

          <div className="space-y-4">
            {/* 👇 Example progress bars — replace with backend data if available */}
            {[
              { label: 'Thesis Writing', value: 70 },
              { label: 'Data Collection', value: 85 },
              { label: 'Literature Review', value: 100 },
              { label: 'Data Analysis', value: 45 },
              { label: 'Final Review', value: 15 },
            ].map((progress, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{progress.label}</span>
                  <span className="text-gray-500">{progress.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progress.value}%` }}
                  ></div>
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

// import { useState, useEffect } from 'react';
// import { FileText, MessageSquare, Clock, CheckCircle, TrendingUp, AlertCircle, Bookmark } from 'lucide-react';
// // import axios from 'axios'; // 🛑 Commented out Axios for mock testing
// // import { API_BASE_URL } from '../../services/config'; // 🛑 Commented out API_BASE_URL

// // ================= MOCK DATA DEFINITIONS =================
// // You can adjust these values to test different scenarios and styles
// const MOCK_STATS = [
//   { title: "Documents Submitted", value: 7, icon: FileText, color: "blue" },
//   { title: "Supervisor Messages", value: 12, icon: MessageSquare, color: "green" },
//   { title: "Upcoming Milestones", value: 3, icon: Clock, color: "orange" },
//   { title: "Overall Progress", value: "58%", icon: TrendingUp, color: "purple" },
// ];

// const MOCK_ACTIVITIES = [
//   { action: "Submitted Chapter 3 Draft", time: "1 hour ago", status: "success" },
//   { action: "Supervisor requested review meeting", time: "5 hours ago", status: "warning" },
//   { action: "Logged 8 hours of research time", time: "1 day ago", status: "info" },
//   { action: "Final Literature Review Approved", time: "2 days ago", status: "success" },
// ];

// const MOCK_DEADLINES = [
//   { task: "Submit Progress Report (Month 6)", date: "Dec 15, 2025", priority: "high" },
//   { task: "Data Collection Phase End", date: "Jan 10, 2026", priority: "medium" },
//   { task: "Supervisor Meeting preparation", date: "Dec 8, 2025", priority: "low" },
//   { task: "Draft Chapter 4 Submission", date: "Jan 25, 2026", priority: "high" },
// ];
// // ================= END MOCK DATA =================

// const Dashboard = () => {
//   // ================= STATE SETUP =================
//   const [stats, setStats] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // ================= FETCH DASHBOARD DATA (NOW MOCKED) =================
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setIsLoading(true);

//         // 🛑 MOCK IMPLEMENTATION: Simulate API latency with a short delay
//         await new Promise(resolve => setTimeout(resolve, 500)); 

//         // 🟢 Assign Mock Data to State
//         setStats(MOCK_STATS);
//         setRecentActivities(MOCK_ACTIVITIES);
//         setUpcomingDeadlines(MOCK_DEADLINES);

//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   // Helper function to get text color based on stat
//   const getStatColor = (color) => {
//     switch (color) {
//       case 'green': return 'text-green-600';
//       case 'orange': return 'text-orange-600';
//       case 'purple': return 'text-purple-600';
//       case 'blue':
//       default: return 'text-blue-600';
//     }
//   };
  
//   // Helper function to get background color based on stat
//   const getBgColor = (color) => {
//     switch (color) {
//       case 'green': return 'bg-green-50';
//       case 'orange': return 'bg-orange-50';
//       case 'purple': return 'bg-purple-50';
//       case 'blue':
//       default: return 'bg-blue-50';
//     }
//   };

//   // ================= LOADING STATE =================
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64 text-gray-500">
//         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//         Loading your dashboard...
//       </div>
//     );
//   }

//   // ================= MAIN RENDER =================
//   return (
//     // 1. Set fixed height, flex column layout, and hide main scrollbar
//     // Assumes the header/nav bar height is 64px (h-16)
//     <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 p-4 sm:p-6 overflow-hidden">
      
//       {/* Header Section (Fixed height) */}
//       <div className="mb-6 flex-shrink-0">
//         <h2 className="text-3xl font-extrabold text-gray-900">Student Dashboard</h2>
//         <p className="text-gray-500 mt-1">Here's your research progress and immediate tasks overview</p>
//       </div>

//       {/* Stats Section (Fixed height) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-shrink-0">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon || FileText;
//           const StatColor = getStatColor(stat.color);
//           const StatBg = getBgColor(stat.color);
          
//           return (
//             <div
//               key={index}
//               className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 border-l-4 border-blue-600"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
//                   <p className={`text-3xl font-bold mt-2 ${StatColor}`}>
//                     {stat.value}
//                   </p>
//                 </div>
//                 <div className={`w-12 h-12 rounded-full ${StatBg} flex items-center justify-center`}>
//                   <Icon className={`w-6 h-6 ${StatColor}`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* 2. Main Content Area: This container takes remaining space and handles its own scroll */}
//       <div className="flex-grow overflow-y-auto space-y-8 pb-4">
        
//         {/* Research Progress + Deadlines */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Research Progress */}
//           <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-lg">
//             <div className="flex items-center justify-between mb-8 border-b pb-4">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center">
//                 <TrendingUp className="w-5 h-5 mr-2 text-blue-600" /> Research Progress Snapshot
//               </h3>
//               <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
//                 Overall: {stats.find(s => s.title === "Overall Progress")?.value || "N/A"}
//               </span>
//             </div>

//             <div className="space-y-6">
//               {/* 👇 Example progress bars — using hardcoded data for visualization */}
//               {[
//                 { label: 'Thesis Writing', value: 70 },
//                 { label: 'Data Collection', value: 85 },
//                 { label: 'Literature Review', value: 100, completed: true },
//                 { label: 'Data Analysis', value: 45 },
//                 { label: 'Final Review', value: 15 },
//               ].map((progress, i) => (
//                 <div key={i}>
//                   <div className="flex justify-between text-sm mb-2">
//                     <span className={`font-medium ${progress.completed ? 'text-green-600' : 'text-gray-700'}`}>
//                       {progress.label} {progress.completed && <CheckCircle className="inline w-4 h-4 ml-1" />}
//                     </span>
//                     <span className="font-semibold text-gray-500">{progress.value}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2.5">
//                     <div
//                       className={`h-2.5 rounded-full transition-all duration-700 ${progress.completed ? 'bg-green-500' : 'bg-blue-600'}`}
//                       style={{ width: `${progress.value}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Upcoming Deadlines */}
//           <div className="bg-white rounded-xl p-8 shadow-lg">
//             <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-4">
//               <Clock className="w-5 h-5 mr-2 text-orange-600" /> Upcoming Deadlines
//             </h3>
//             <div className="space-y-4">
//               {upcomingDeadlines.length > 0 ? (
//                 upcomingDeadlines.map((deadline, index) => (
//                   <div
//                     key={index}
//                     className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-150 border border-gray-100"
//                   >
//                     <div className="pt-1">
//                       <Bookmark 
//                         className={`w-5 h-5 flex-shrink-0 ${
//                           deadline.priority === 'high' ? 'text-red-500 fill-red-500/10' :
//                           deadline.priority === 'medium' ? 'text-orange-500 fill-orange-500/10' :
//                           'text-green-500 fill-green-500/10'
//                         }`}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-base font-semibold text-gray-800">{deadline.task}</p>
//                       <p className="text-sm text-gray-500 mt-0.5 font-medium">{deadline.date}</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No immediate deadlines found. Keep up the good work!</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Recent Activities Timeline */}
//         <div className="bg-white rounded-xl p-8 shadow-lg">
//           <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center border-b pb-4">
//             <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" /> Recent Activities Timeline
//           </h3>
//           <div className="space-y-6">
//             {recentActivities.length > 0 ? (
//               recentActivities.map((activity, index) => {
//                 let Icon, iconColor, bgColor;
//                 switch (activity.status) {
//                   case 'success':
//                     Icon = CheckCircle;
//                     iconColor = 'text-green-600';
//                     bgColor = 'bg-green-100';
//                     break;
//                   case 'warning':
//                     Icon = AlertCircle;
//                     iconColor = 'text-orange-600';
//                     bgColor = 'bg-orange-100';
//                     break;
//                   case 'info':
//                   default:
//                     Icon = TrendingUp;
//                     iconColor = 'text-blue-600';
//                     bgColor = 'bg-blue-100';
//                     break;
//                 }

//                 return (
//                   <div
//                     key={index}
//                     className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition duration-150"
//                   >
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} flex-shrink-0 mt-1`}>
//                       <Icon className={`w-5 h-5 ${iconColor}`} />
//                     </div>
//                     <div className="flex-1 border-l pl-4">
//                       <p className="text-base font-semibold text-gray-800">{activity.action}</p>
//                       <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <p className="text-gray-500 text-center py-4">No recent activity found.</p>
//             )}
//           </div>
//         </div>
//       </div> {/* End of flex-grow scrollable area */}
//     </div>
//   );
// };

// export default Dashboard;