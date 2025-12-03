// // // src/components/login/userLogin.jsx

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FileText } from "lucide-react";
// import { API_BASE_URL } from "../../services/config";

// export default function userLogin({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("student");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/login/${role}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("role", role);

//         if (onLogin) onLogin(role);

//         // Redirect correctly
//         if (role === "student") navigate("/student/Dashboard");
//         else if (role === "supervisor") navigate("/supervisor/Dashboard");
//         else navigate("/");
//       } else {
//         alert(data.error || "Login failed");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       alert("An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div
//       className="flex items-center justify-center min-h-screen bg-cover bg-center"
//       style={{ backgroundImage: 'url("/login-bg.jpg")' }}
//     >
//       <motion.div
//         initial={{ opacity: 0, scale: 0.8, y: 50 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         className="bg-white shadow-2xl rounded-2xl flex w-full max-w-4xl min-h-[500px] overflow-hidden m-4"
//       >
//         {/* LEFT SIDE */}
//         <motion.div
//           initial={{ x: -50, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.7, delay: 0.2 }}
//           className="flex-1 flex flex-col justify-center p-8 border-r bg-white"
//         >
//           <div className="flex flex-col items-center mb-6">
//             <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
//               <FileText className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800">PG Monitoring System</h1>
//             <p className="text-gray-500 mt-1 text-lg">
//               {role === "student" ? "Student Portal" : "Supervisor Portal"}
//             </p>
//           </div>

//           {/* Role Buttons */}
//           <div className="flex justify-center gap-4 mb-6">
//             <button
//               type="button"
//               onClick={() => setRole("student")}
//               className={`px-5 py-2 rounded-xl font-semibold border transition-all duration-300 shadow-md ${
//                 role === "student"
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "bg-white text-blue-600 border-blue-600"
//               }`}
//             >
//               Student
//             </button>

//             <button
//               type="button"
//               onClick={() => setRole("supervisor")}
//               className={`px-5 py-2 rounded-xl font-semibold border transition-all duration-300 shadow-md ${
//                 role === "supervisor"
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "bg-white text-blue-600 border-blue-600"
//               }`}
//             >
//               Supervisor
//             </button>
//           </div>

//           {/* Login Form */}
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <motion.input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 whileFocus={{ scale: 1.01 }}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                 placeholder={`Enter ${role} email`}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <motion.input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 whileFocus={{ scale: 1.01 }}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                 placeholder="Enter your password"
//               />
//             </div>

//             <motion.button
//               type="submit"
//               disabled={loading}
//               whileHover={{ scale: loading ? 1 : 1.02 }}
//               className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold transition ${
//                 loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
//               }`}
//             >
//               {loading ? "Signing in..." : `Sign In as ${role}`}
//             </motion.button>
//           </form>
//         </motion.div>

//         {/* RIGHT SIDE */}
//         <motion.div
//           initial={{ x: 50, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.7, delay: 0.3 }}
//           className="flex-1 hidden md:flex flex-col items-center justify-center p-8 bg-blue-50 relative"
//         >
//           <img
//             src="/aiu.jpg"
//             className="absolute inset-0 w-full h-full object-cover opacity-30"
//           />

//           <div className="relative z-10 text-center">
//             <h3 className="text-3xl font-extrabold text-blue-800 mb-4">
//               Welcome to PG Monitoring System
//             </h3>
//             <p className="text-lg text-blue-700 font-medium mb-6">
//               Your gateway to academic progress and supervision.
//             </p>

//             <ul className="list-disc space-y-3 text-left mx-auto w-fit">
//               <li className="text-xl font-bold text-blue-700">Track Student Progress</li>
//               <li className="text-xl font-bold text-blue-700">Submit Reports</li>
//               <li className="text-xl font-bold text-blue-700">Approve Documents</li>
//             </ul>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CheckCircle } from "lucide-react"; // Changed FileText to Users/CheckCircle
import { API_BASE_URL } from "../../services/config";

export default function userLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);

        if (onLogin) onLogin(role);

        // Redirect correctly
        if (role === "student") navigate("/student/Dashboard");
        else if (role === "supervisor") navigate("/supervisor/Dashboard");
        else navigate("/");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
  };
  
  // Dynamically set feature list based on selected role
  const featureList = role === "student"
    ? ["Thesis Status Tracking", "Supervisor Communication", "Document Submission", "Milestone Monitoring"]
    : ["Student Progress Oversight", "Document Approval Workflow", "Feedback and Guidance Tools", "Reporting and Metrics"];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: 'url("/login-bg.jpg")' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl w-full max-w-5xl flex overflow-hidden flex-col md:flex-row border border-gray-100" // Unified Card Style
      >

        {/* LEFT - FORM */}
        <div className="w-full md:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left mb-8"
          >
            {/* Dynamic Icon */}
            <Users className="w-10 h-10 text-blue-700 mx-auto md:mx-0 mb-3" /> 
            
            <h2 className="text-3xl font-extrabold text-gray-800">
              PG Monitoring System
            </h2>
            <p className="text-gray-500 mt-1 text-lg">
              {role === "student" ? "Student Portal" : "Supervisor Portal"}
            </p>
          </motion.div>

          {/* Role Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`px-6 py-2 rounded-lg font-semibold border-2 transition-all duration-300 shadow-sm ${
                role === "student"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setRole("supervisor")}
              className={`px-6 py-2 rounded-lg font-semibold border-2 transition-all duration-300 shadow-sm ${
                role === "supervisor"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
              }`}
            >
              Supervisor
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                whileFocus={{ scale: 1.01 }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                placeholder={`Enter ${role} email`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                whileFocus={{ scale: 1.01 }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                placeholder="Enter your password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold transition duration-200 shadow-md ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700 shadow-blue-300/50"
              }`}
            >
              {loading ? "Signing in..." : `Sign In as ${role}`}
            </motion.button>
          </form>
        </div>

        {/* RIGHT - BRAND PANEL (Subtle, White-based design) */}
        <div className="relative w-full md:w-1/2 p-8 lg:p-14 bg-gray-50/50 border-l border-gray-200 flex flex-col justify-center items-start text-gray-800">
          
          {/* Subtle Background Image */}
          <img
            src="/aiu.jpg"
            alt="AIU Background"
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 w-full"
          >
            <h3 className="text-2xl font-bold text-blue-700 mb-2 border-b-2 border-blue-200 pb-2">
              PG Monitoring System
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-6">
              Features for the **{role}** role:
            </p>

            <motion.ul 
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
              className="space-y-3"
            >
              {featureList.map((item, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-center text-gray-700 font-medium"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            
            <p className="mt-8 text-xs text-gray-500">
              Ensuring efficient and transparent management of postgraduate studies.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}