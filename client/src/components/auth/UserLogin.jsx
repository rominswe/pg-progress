import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("STU"); // STU | SUV | EXA
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const roleLabel =
    role === "STU" ? "Student" :
      role === "SUV" ? "Supervisor" :
        "Examiner";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(role, { email, password });

      // 🔐 Temporary password enforcement
      if (data?.mustChangePassword) {
        navigate(data.redirectUrl, { replace: true });
        return;
      }

      // 🚦 Redirect by role
      const dashboardMap = {
        STU: "/student/dashboard",
        SUV: "/supervisor/dashboard",
        EXA: "/examiner/dashboard",
      };
      navigate(dashboardMap[role] || "/login", { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const featureList =
    role === "STU"
      ? [
        "Thesis Status Tracking",
        "Supervisor Communication",
        "Document Submission",
        "Milestone Monitoring",
      ]
      : role === "SUV"
        ? [
          "Student Progress Oversight",
          "Document Approval Workflow",
          "Feedback & Guidance Tools",
          "Reporting & Metrics",
        ]
        : [
          "Thesis Examination",
          "Evaluation Reports",
          "Academic Feedback",
          "Assessment Management",
        ];

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: 'url("/login-bg.jpg")' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl w-full max-w-5xl flex overflow-hidden flex-col md:flex-row border border-gray-100"
      >
        {/* LEFT - FORM */}
        <div className="w-full md:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left mb-8"
          >
            <Users className="w-10 h-10 text-blue-700 mx-auto md:mx-0 mb-3" />
            <h2 className="text-3xl font-extrabold text-gray-800">
              AIU PG Progress
            </h2>
            <p className="text-gray-500 mt-1 text-lg">
              Welcome to the {roleLabel} Portal
            </p>
          </motion.div>

          {/* ROLE BUTTONS */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { id: "STU", label: "Student" },
              { id: "SUV", label: "Supervisor" },
              { id: "EXA", label: "Examiner" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold border-2 transition-all duration-300 shadow-sm ${role === r.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <motion.input
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                required
                whileFocus={{ scale: 1.01 }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                placeholder={`Enter ${roleLabel} email`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  whileFocus={{ scale: 1.01 }}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold transition duration-200 shadow-md ${loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-blue-700 shadow-blue-300/50"
                }`}
            >
              {loading ? "Signing in..." : `Sign In as ${roleLabel}`}
            </motion.button>

            {error && (
              <p className="text-red-600 text-sm mt-2 text-center">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* RIGHT - INFO PANEL */}
        <div className="relative w-full md:w-1/2 p-8 lg:p-14 bg-gray-50/50 border-l border-gray-200 flex flex-col justify-center items-start text-gray-800">
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
              Features for the selected role:
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
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <p className="mt-8 text-xs text-gray-500">
              Secure access for postgraduate academic workflows.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}