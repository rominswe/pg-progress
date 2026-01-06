import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

// ✅ This component is responsible for displaying thesis progress milestones only.
// It should not handle layout or navigation — those are managed by StudentLayout.

const ThesisSubmission = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch thesis milestones from backend (replace dummy data later)
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        // Example (replace with your actual endpoint later):
        // const res = await fetch('/api/student/milestones');
        // const data = await res.json();
        // setMilestones(data);

        // Temporary placeholder data
        const dummyData = [
          {
            title: 'Research Proposal',
            status: 'completed',
            date: '2024-09-15',
            description: 'Initial research proposal submitted and approved',
          },
          {
            title: 'Literature Review',
            status: 'completed',
            date: '2024-10-20',
            description: 'Comprehensive literature review completed',
          },
          {
            title: 'Methodology Chapter',
            status: 'completed',
            date: '2025-08-15',
            description: 'Research methodology documented and approved',
          },
          {
            title: 'Data Collection',
            status: 'in-progress',
            date: 'In Progress',
            description: 'Currently collecting and processing research data',
          },
          {
            title: 'Results & Analysis',
            status: 'pending',
            date: 'Not Started',
            description: 'Analysis of collected data',
          },
          {
            title: 'Discussion Chapter',
            status: 'pending',
            date: 'Not Started',
            description: 'Interpretation and discussion of findings',
          },
          {
            title: 'Final Thesis',
            status: 'pending',
            date: 'Not Started',
            description: 'Complete thesis compilation and submission',
          },
        ];

        setMilestones(dummyData);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  // ✅ Helper functions for colors and progress
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    const completed = milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  if (loading) return <p className="text-center mt-4">Loading thesis milestones...</p>;

  return (
    <div className="space-y-6 p-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Thesis Submission</h2>
        <p className="text-gray-500 mt-1">Track your thesis milestones and submission progress</p>
      </div>

      {/* ✅ Overall Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Overall Progress</h3>
            <p className="text-sm text-gray-500 mt-1">
              Complete all milestones to submit your final thesis
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{getProgressPercentage()}%</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {/* ✅ Milestone Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {milestones.filter((m) => m.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {milestones.filter((m) => m.status === 'in-progress').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">
              {milestones.filter((m) => m.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
        </div>
      </div>

      {/* ✅ Thesis Milestones Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Thesis Milestones</h3>

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative">
              {index !== milestones.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-full ${
                    milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                ></div>
              )}

              <div
                className={`flex items-start gap-4 p-4 rounded-lg border-2 ${getStatusColor(
                  milestone.status
                )}`}
              >
                <div className="relative z-10">
                  {milestone.status === 'completed' ? (
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  ) : milestone.status === 'in-progress' ? (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <Circle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        milestone.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : milestone.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {milestone.date}
                    </span>
                  </div>

                  {/* ✅ Future Backend Hook: Milestone Actions */}
                  {milestone.status === 'in-progress' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => alert('File upload form or submission modal goes here.')}
                        className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Submit Work
                      </button>
                      <button className="text-sm px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Submission Guidelines Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• All documents must be in PDF format</li>
          <li>• Each milestone must be approved before proceeding to the next</li>
          <li>• Allow 5–7 working days for supervisor review</li>
          <li>• Final thesis submission requires all previous milestones to be completed</li>
        </ul>
      </div>
    </div>
  );
};

export default ThesisSubmission;