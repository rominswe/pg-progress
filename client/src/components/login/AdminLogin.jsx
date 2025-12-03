import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/config";

export default function LoginPage({onLogin}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login/admin`, { //do not forget to define the routing for admin //
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");
        navigate("/admin/dashboard"); // Redirect to admin dashboard
      } else {
        alert(data.error || "Invalid Admin Credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred. Please try again.");
    } 
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-5xl flex overflow-hidden flex-col md:flex-row"
      >

        {/* LEFT - FORM */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-bold text-blue-700 mb-2">
            CGS Administrator Login
          </h2>
          <p className="text-gray-500 mb-8">
            Authorized personnel only
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aiu.edu.my"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </motion.div>

        {/* RIGHT - BRAND PANEL */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 flex flex-col items-center justify-center text-center"
        >
          <img
            src={aiuImage}
            alt="AIU Logo"
            className="h-28 mb-6 object-contain"
          />
          <h3 className="text-2xl font-bold mb-2">
            Centre for Graduate Studies
          </h3>
          <p className="opacity-80">
            Administrative Control Panel
          </p>

          <ul className="mt-6 space-y-2 text-sm">
            <li>✔ User Management</li>
            <li>✔ Thesis Monitoring</li>
            <li>✔ Student Verification</li>
            <li>✔ Academic Oversight</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}