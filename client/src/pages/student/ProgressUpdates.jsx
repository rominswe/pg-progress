// src/pages/student/ProgressUpdates.jsx
import { useState, useEffect } from 'react';
import { FileText, Plus, Save, Calendar } from 'lucide-react';

const ProgressUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    achievements: '',
    challenges: '',
    nextSteps: '',
  });

  // ✅ Fetch progress updates (dummy for now)
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        // Simulate API response
        const dummyData = [
          {
            id: 1,
            date: '2025-10-15',
            title: 'Data Collection Progress',
            achievements: 'Completed 80% of survey responses. Conducted 5 additional interviews.',
            challenges: 'Low response rate from certain demographics.',
            nextSteps: 'Implement targeted follow-up strategy for remaining respondents.',
            description: 'Collected key data for thesis results.',
            status: 'Reviewed',
          },
          {
            id: 2,
            date: '2025-09-28',
            title: 'Methodology Refinement',
            achievements: 'Finalized data collection instruments. Received ethics approval.',
            challenges: 'Had to adjust sampling strategy due to participant availability.',
            nextSteps: 'Begin primary data collection phase.',
            description: 'Revised methodology chapter successfully.',
            status: 'Pending Review',
          },
        ];
        setUpdates(dummyData);
      } catch (error) {
        console.error('Error fetching progress updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  // ✅ Handle new submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: updates.length + 1,
      date: new Date().toISOString().split('T')[0],
      ...newUpdate,
      status: 'Pending Review',
    };
    setUpdates([newEntry, ...updates]);
    setNewUpdate({
      title: '',
      description: '',
      achievements: '',
      challenges: '',
      nextSteps: '',
    });
  };

  if (loading) return <p className="text-center mt-6">Loading progress updates...</p>;

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-600" />
          Progress Updates
        </h1>
      </div>

      {/* Submit New Update */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Submit New Progress Update</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newUpdate.title}
              onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
              placeholder="e.g., Weekly Progress Update - Week 15"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brief Description
            </label>
            <textarea
              value={newUpdate.description}
              onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
              placeholder="Provide a brief overview of this update period..."
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newUpdate.achievements}
                onChange={(e) => setNewUpdate({ ...newUpdate, achievements: e.target.value })}
                placeholder="What did you accomplish?"
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenges Faced
              </label>
              <textarea
                value={newUpdate.challenges}
                onChange={(e) => setNewUpdate({ ...newUpdate, challenges: e.target.value })}
                placeholder="Any difficulties or obstacles?"
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Steps <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newUpdate.nextSteps}
              onChange={(e) => setNewUpdate({ ...newUpdate, nextSteps: e.target.value })}
              placeholder="What are your plans for the next period?"
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Submit Update
            </button>
            <button
              type="button"
              onClick={() =>
                setNewUpdate({
                  title: '',
                  description: '',
                  achievements: '',
                  challenges: '',
                  nextSteps: '',
                })
              }
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Display Updates */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Previous Updates</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {updates.map((update) => (
            <div
              key={update.id}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">{update.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{update.date}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    update.status === 'Reviewed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {update.status}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700 text-sm">{update.description}</p>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Achievements</p>
                  <p className="text-sm text-gray-700">{update.achievements}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Challenges</p>
                  <p className="text-sm text-gray-700">{update.challenges}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Next Steps</p>
                  <p className="text-sm text-gray-700">{update.nextSteps}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressUpdates;