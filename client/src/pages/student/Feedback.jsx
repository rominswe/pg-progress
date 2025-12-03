import { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Star } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';

const Feedback = () => {
  // ===============================
  // 🔹 STATE MANAGEMENT
  // ===============================
  const USE_API = false;

  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy data for UI testing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dummyFeedbackData = [
    {
      id: 1,
      supervisor: 'Dr. Sarah Lee',
      message: 'Please refine your literature review section with recent 2023 studies.',
      date: '2025-11-12',
    },
    {
      id: 2,
      supervisor: 'Prof. David Wong',
      message: 'Good progress on methodology. Let’s meet next week to discuss data analysis.',
      date: '2025-11-10',
    },
    {
      id: 3,
      supervisor: 'Dr. Alice Tan',
      message: 'Your writing has improved. Focus on consistency in citation formatting.',
      date: '2025-11-08',
    },
  ];

  // ===============================
  // 🔹 FETCH DATA FROM BACKEND API
  // ===============================
  useEffect(() => {
    if (!USE_API) {
          // Using dummy data
          setFeedbackItems(dummyFeedbackData);
          setLoading(false);
          return;
        }
        
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/student/feedback`);
        setFeedbackItems(response.data); // adjust if data is nested (e.g., response.data.feedback)
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback data.');
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [USE_API, dummyFeedbackData]);

  // ===============================
  // 🔹 RENDER STARS FUNCTION
  // ===============================
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // ===============================
  // 🔹 CONDITIONAL UI STATES
  // ===============================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // ===============================
  // 🔹 MAIN UI RENDER
  // ===============================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Supervisor Feedback</h2>
        <p className="text-gray-500 mt-1">View feedback and comments from your supervisor</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{feedbackItems.length}</p>
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
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {feedbackItems.filter((item) => item.status === 'unread').length}
              </p>
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
              <p className="text-3xl font-bold text-green-600 mt-2">
                {(
                  feedbackItems.reduce((sum, item) => sum + item.rating, 0) /
                  (feedbackItems.length || 1)
                ).toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK LIST */}
      <div className="space-y-4">
        {feedbackItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
              item.status === 'unread' ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
            }`}
          >
            {/* HEADER */}
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

            {/* COMMENT */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{item.comment}</p>
            </div>

            {/* SUGGESTIONS */}
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

            {/* ACTION BUTTONS */}
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