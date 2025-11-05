// src/pages/supervisor/ReviewSubmissions.jsx

export default function ReviewSubmissions() {
  const submissions = [
    {
      id: "1",
      student: "Ahmad Bin Ali",
      title: "Proposal Draft",
      date: "2025-01-10",
      status: "Pending",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Review Submissions</h1>

      <div className="space-y-4">
        {submissions.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-gray-500">
                  {s.student} • {s.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded">
                  Approve
                </button>
                <button className="px-3 py-1 bg-red-500 text-white rounded">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}