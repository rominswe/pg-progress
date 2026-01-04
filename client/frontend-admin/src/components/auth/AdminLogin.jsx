import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import { useAuth } from "../../../../shared/auth/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CGSS"); // CGS Admin | CGS Staff
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

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

      navigate("/cgs/dashboard", { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const featureList =
    role === "CGSADM"
      ? [
          "Full User & Role Management",
          "System Configuration Control",
          "Security & Audit Oversight",
          "Academic Governance",
        ]
      : [
          "Student Monitoring",
          "Document Verification",
          "Progress Tracking",
          "Operational Support",
        ];

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
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
            <Lock className="w-10 h-10 text-blue-700 mx-auto md:mx-0 mb-3" />
            <h2 className="text-3xl font-extrabold text-gray-800">
              {role === "CGSS" ? "CGS Staff Portal" : "CGS Admin Portal"}
            </h2>
            <p className="text-gray-500 mt-1">
              Authorized {role === "CGSS" ? "Staff" : "Administrator"} access only
            </p>
          </motion.div>

          {/* ROLE SELECTOR */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            >
              <option value="CGSADM">Admin</option>
              <option value="CGSS">Staff</option>
            </select>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aiu.edu.my"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 shadow-md ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-300/50"
              }`}
            >
              {loading
                ? "Verifying..."
                : `Login as ${role === "CGSADM" ? "Admin" : "Staff"}`}
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
              Centre for Graduate Studies
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
              Secure administrative access for postgraduate governance.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
