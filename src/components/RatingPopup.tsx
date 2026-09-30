import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RepairRequestWithTech } from '@/types';
import { Star, Loader as Loader2, X, CircleCheck as CheckCircle2, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface Props {
  request: RepairRequestWithTech;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RatingPopup({ request, onClose, onSubmitted }: Props) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const techName = request.technician?.name || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;

    setError(null);
    setSubmitting(true);

    const { error: insertError } = await supabase.from('reviews').insert({
      request_id: request.id,
      technician_id: request.technician_id,
      farmer_name: request.farmer_name,
      rating,
      feedback: feedback.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(t('form.error'));
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onSubmitted();
    }, 1800);
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-semibold text-stone-900">{t('rating.success')}</h3>
          <p className="mt-2 text-sm text-stone-500">
            {t('rating.success.desc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h3 className="text-lg font-semibold text-stone-900">{t('rating.title')}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-stone-500 mb-1">{t('rating.experience')}</p>
            <p className="font-semibold text-stone-900">{techName}</p>
            <p className="text-xs text-stone-400 mt-1">
              {t(`eq.${request.equipment_type}`)} {t('rating.repair')}
            </p>
          </div>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-stone-200 fill-stone-100'
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm text-stone-500 animate-fade-in">
              {rating === 1 && t('rating.poor')}
              {rating === 2 && t('rating.fair')}
              {rating === 3 && t('rating.good')}
              {rating === 4 && t('rating.veryGood')}
              {rating === 5 && t('rating.excellent')}
            </p>
          )}

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-stone-400" />
                {t('rating.feedback')}
                <span className="text-stone-400 font-normal">{t('rating.feedback.optional')}</span>
              </span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('rating.feedbackPlaceholder')}
              rows={3}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {t('rating.skip')}
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('rating.submitting')}
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  {t('rating.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
