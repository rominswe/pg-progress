import { useState } from 'react';
import { Save, Plus, Calendar } from 'lucide-react';

const ProgressUpdates = () => {
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    achievements: '',
    challenges: '',
    nextSteps: '',
  });

  const previousUpdates = [
    {
      date: '2025-10-15',
      title: 'Data Collection Progress',
      achievements: 'Completed 80% of survey responses. Conducted 5 additional interviews.',
      challenges: 'Low response rate from certain demographics.',
      nextSteps: 'Implement targeted follow-up strategy for remaining respondents.',
    },
    {
      date: '2025-09-28',
      title: 'Methodology Refinement',
      achievements: 'Finalized data collection instruments. Received ethics approval.',
      challenges: 'Had to adjust sampling strategy due to participant availability.',
      nextSteps: 'Begin primary data collection phase.',
    },
    {
      date: '2025-09-10',
      title: 'Literature Review Completion',
      achievements: 'Completed comprehensive literature review covering 150+ sources.',
      challenges: 'Limited access to some recent publications.',
      nextSteps: 'Draft methodology chapter.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting update:', newUpdate);
    setNewUpdate({
      title: '',
      description: '',
      achievements: '',
      challenges: '',
      nextSteps: '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Progress Updates</h2>
        <p className="text-gray-500 mt-1">Update your research progress and track your journey</p>
      </div>

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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
                rows="5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
                rows="5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Previous Updates</h3>

        <div className="space-y-4">
          {previousUpdates.map((update, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">{update.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{update.date}</span>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Full
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Achievements
                  </p>
                  <p className="text-sm text-gray-700">{update.achievements}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Challenges
                  </p>
                  <p className="text-sm text-gray-700">{update.challenges}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Next Steps
                  </p>
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