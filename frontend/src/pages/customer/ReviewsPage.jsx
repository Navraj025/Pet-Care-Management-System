import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ReviewsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    try {
      const [apptsRes, revsRes] = await Promise.all([
        API.get('/appointments?status=COMPLETED'),
        API.get('/reviews')
      ]);
      setAppointments(apptsRes.data);
      setReviews(revsRes.data);
      if (apptsRes.data.length > 0) setSelectedApptId(apptsRes.data[0].id);
    } catch (err) {
      console.error("Failed to load feedback data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      showError("Please select a completed appointment");
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/reviews', {
        appointment_id: parseInt(selectedApptId),
        rating,
        comment
      });
      showSuccess("Thank you for your feedback!");
      setComment('');
      fetchData();
    } catch (err) {
      console.error("Feedback error:", err);
      showError(err.response?.data?.detail || "Feedback submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Feedback & Reviews</h2>
        <p className="text-xs text-slate-500">Rate your experience after completed veterinary or grooming visits</p>
      </div>

      {/* Submit Feedback Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <span>Submit Visit Feedback</span>
        </h3>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">You have no completed appointments available to review yet.</p>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Completed Visit</label>
              <select
                value={selectedApptId}
                onChange={(e) => setSelectedApptId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.appointment_date}: {a.service?.name} for {a.pet?.name} with {a.staff?.user?.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl transition-transform ${
                      rating >= star ? 'text-amber-400 scale-110' : 'text-slate-200'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Comments & Feedback</label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your pet treated? Doctor expertise, hygiene..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      {/* Submitted Reviews Showcase */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-900">Recent Customer Reviews</h3>
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-slate-400">{rev.created_at?.slice(0, 10)}</span>
              </div>
              <p className="text-slate-800 font-semibold">{rev.comment || "Great service!"}</p>
              <p className="text-[11px] text-slate-400">Service: {rev.service?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
