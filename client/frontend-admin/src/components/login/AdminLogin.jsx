import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserCircle, CheckCircle, Lock } from "lucide-react"; // Added new icons
import { API_BASE_URL } from "../../services/config";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");
        navigate("/admin/dashboard");
      } else {
        alert(data.error || "Invalid Admin Credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); 
    }
  }

  // Define transition for smooth list item appearance
  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
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
        className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl w-full max-w-5xl flex overflow-hidden flex-col md:flex-row border border-gray-100" // Subtle shadow and border
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
              CGS Admin Login
            </h2>
            <p className="text-gray-500 mt-1">
              Authorized personnel access only
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aiu.edu.my"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 shadow-md ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-300/50"
              }`}
            >
              {loading ? "Verifying..." : "Secure Login"}
            </motion.button>
          </form>
        </div>

        {/* RIGHT - BRAND PANEL (Subtle, White-based design) */}
        <div className="relative w-full md:w-1/2 p-8 lg:p-14 bg-gray-50/50 border-l border-gray-200 flex flex-col justify-center items-start text-gray-800">
          
          {/* Subtle Background Image */}
          <img
            src="/aiu.jpg"
            alt="AIU Background"
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm" // Very subtle effect
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
              Administrative Control Features Overview:
            </p>

            <motion.ul 
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
              className="space-y-3"
            >
              {[
                "Comprehensive User Management",
                "Real-time Thesis Monitoring",
                "Student Status Verification",
                "Full Academic Oversight"
              ].map((item, index) => (
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
              Ensuring integrity and efficiency in postgraduate administration.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}