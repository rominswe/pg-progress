import React from 'react';
import { MessageSquare, User, Clock, Star } from 'lucide-react';

const Feedback = () => {
  const feedbackItems = [
    {
      id: 1,
      supervisor: 'Dr. Sarah Johnson',
      document: 'Chapter 3 - Methodology',
      date: '2025-10-28',
      time: '14:30',
      rating: 4,
      status: 'unread',
      comment:
        'Excellent work on the methodology section. Your research design is well-structured and clearly articulated. However, I suggest expanding the section on data validation methods. Also, consider adding more details about your sampling strategy and how you addressed potential biases.',
      suggestions: [
        'Add more detail to the data validation section',
        'Include discussion on addressing potential biases',
        'Consider adding a flowchart for the research process',
      ],
    },
    {
      id: 2,
      supervisor: 'Dr. Sarah Johnson',
      document: 'Progress Report Q3',
      date: '2025-10-20',
      time: '10:15',
      rating: 5,
      status: 'read',
      comment:
        'Outstanding progress this quarter! Your data collection efforts have been thorough and systematic. The preliminary findings look promising. Keep up the excellent work!',
      suggestions: ['Continue with current approach', 'Start drafting results chapter'],
    },
    {
      id: 3,
      supervisor: 'Dr. Sarah Johnson',
      document: 'Literature Review',
      date: '2025-09-25',
      time: '16:45',
      rating: 4,
      status: 'read',
      comment:
        'Comprehensive literature review with good coverage of relevant sources. The critical analysis demonstrates deep understanding of the field. Minor revisions needed in the theoretical framework section.',
      suggestions: [
        'Strengthen theoretical framework discussion',
        'Add 2-3 more recent studies from 2025',
        'Consider including more international perspectives',
      ],
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Supervisor Feedback</h2>
        <p className="text-gray-500 mt-1">View feedback and comments from your supervisor</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Unread</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Rating</p>
              <p className="text-3xl font-bold text-green-600 mt-2">4.3</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
              item.status === 'unread' ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.supervisor}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Feedback on: <span className="font-medium">{item.document}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {item.date} at {item.time}
                    </span>
                    <div className="flex gap-0.5">{renderStars(item.rating)}</div>
                  </div>
                </div>
              </div>

              {item.status === 'unread' && (
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  New
                </span>
              )}
            </div>

            {/* Comment */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{item.comment}</p>
            </div>

            {/* Suggestions */}
            {item.suggestions && item.suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm font-semibold text-blue-900 mb-2">Suggested Actions:</p>
                <ul className="space-y-1.5">
                  {item.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Reply
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                View Document
              </button>
              {item.status === 'unread' && (
                <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;