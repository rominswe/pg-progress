// src/pages/supervisor/Dashboard.jsx

export default function SupervisorDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supervisor Dashboard</h1>
      <p className="text-gray-600">
        Welcome — monitor student progress and review submissions here.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Pending Reviews</h3>
          <p className="text-sm text-gray-500">3 items</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Students Supervised</h3>
          <p className="text-sm text-gray-500">12 students</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-gray-500">2 new</p>
        </div>
      </div>
    </div>
  );
}