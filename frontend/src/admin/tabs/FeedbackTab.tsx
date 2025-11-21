import { Star } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function FeedbackTab() {
  const { state } = useAppContext();
  const feedback = state.feedback;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Feedback</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map((item) => (
          <div key={item.id} className="feedback-card bg-gray-50 rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="feedback-header flex items-center gap-4 mb-4">
              <div className="user-avatar w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                {item.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h4 className="text-md font-semibold text-gray-800">{item.fullName}</h4>
                <div className="flex text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill={item.id === 'f2' ? 'none' : 'currentColor'} stroke="currentColor" />
                </div>
              </div>
            </div>
            <p className="feedback-text text-gray-700 text-sm">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
