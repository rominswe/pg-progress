import React from "react";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">AIU PG Progress System</h1>
      <Dashboard />
    </div>
  );
}
