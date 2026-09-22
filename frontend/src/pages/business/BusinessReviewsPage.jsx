import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BusinessReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get('/business-owner/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      showToast("Failed to load reviews.", "error");
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Customer Feedback & Reviews</h1>
          <p className="text-xs text-slate-500">Reviews submitted specifically for your business</p>
        </div>

        <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-4 py-2 rounded-2xl">
          <Star className="w-5 h-5 text-amber-500 fill-current" />
          <span className="font-extrabold text-base text-amber-900 dark:text-amber-300">{avgRating} / 5.0</span>
          <span className="text-xs text-amber-700 dark:text-amber-400">({reviews.length} Reviews)</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Reviews Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Reviews left by customers after completed appointments will be displayed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {rev.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{rev.customer_name}</h4>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{rev.service_name}</span>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium">{rev.created_at}</span>
              </div>

              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                ))}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessReviewsPage;
