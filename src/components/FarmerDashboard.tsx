import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RepairRequestWithTech, Urgency } from '@/types';
import { Plus, Loader2, ArrowLeft, Tractor, Wrench, Clock, User, Lightbulb, Activity, Star, CheckCircle2, Package, CircleDollarSign, BadgeCheck, Home, Tag, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import NewRequestForm from './NewRequestForm';
import RatingPopup from './RatingPopup';
import SpareParts from './SpareParts';

const URGENCY_STYLES: Record<Urgency, string> = {
  normal: 'bg-gray-100 text-gray-700',
  urgent: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const URGENCY_LABELS: Record<Urgency, string> = {
  normal: 'Normal',
  urgent: 'Urgent',
  critical: 'Critical',
};

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-gray-100 text-gray-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface Props {
  onBack: () => void;
}

export default function FarmerDashboard({ onBack }: Props) {
  const [requests, setRequests] = useState<RepairRequestWithTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [ratingRequest, setRatingRequest] = useState<RepairRequestWithTech | null>(null);
  const [autoPrompted, setAutoPrompted] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const loadRequests = useCallback(async () => {
    if (!farmerName) return;
    const { data, error } = await supabase
      .from('requests')
      .select('*, technician:technicians(id, name, specialization, rating), review:reviews(id, rating, feedback)')
      .eq('farmer_name', farmerName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
      return;
    }
    setRequests((data || []) as RepairRequestWithTech[]);
    setLoading(false);
  }, [farmerName]);

  useEffect(() => {
    if (nameEntered) {
      setLoading(true);
      setAutoPrompted(false);
      loadRequests();
    }
  }, [nameEntered, loadRequests]);

  // Auto-prompt rating for the most recent completed request that hasn't been reviewed
  useEffect(() => {
    if (!loading && !autoPrompted && !ratingRequest) {
      const unreviewed = requests.find(
        (r) => r.status === 'completed' && r.technician_id && !r.review
      );
      if (unreviewed) {
        setRatingRequest(unreviewed);
      }
      setAutoPrompted(true);
    }
  }, [loading, autoPrompted, ratingRequest, requests]);

  const requestedCount = requests.filter((r) => r.status === 'requested').length;
  const activeCount = requests.filter((r) =>
    ['assigned', 'in_progress'].includes(r.status)
  ).length;
  const doneCount = requests.filter((r) => r.status === 'completed').length;

  const maintenanceReminders = (() => {
    const byNickname = new Map<string, { nickname: string; equipmentType: string; completedCount: number }>();
    for (const r of requests) {
      const nickname = r.equipment_nickname?.trim();
      if (!nickname) continue;
      const key = nickname.toLowerCase();
      let entry = byNickname.get(key);
      if (!entry) {
        entry = { nickname, equipmentType: r.equipment_type, completedCount: 0 };
        byNickname.set(key, entry);
      }
      if (r.status === 'completed') entry.completedCount++;
    }
    return Array.from(byNickname.values()).filter((e) => e.completedCount >= 2);
  })();

  // Name gate — ask farmer for their name before showing dashboard
  if (!nameEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-100 text-green-700">
              <Tractor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Farmer Portal</h2>
              <p className="text-sm text-stone-500">Tell us who you are to get started</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nameInput.trim()) {
                setFarmerName(nameInput.trim());
                setNameEntered(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Your Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Jane Cooper"
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-px bg-stone-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 text-green-700">
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-stone-900 leading-tight">Farmer Dashboard</h1>
                <p className="text-xs text-stone-500 leading-tight">Welcome, {farmerName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParts(true)}
              className="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Spare Parts</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-100">
            <p className="text-2xl sm:text-3xl font-bold text-stone-900">{requestedCount}</p>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Requested</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-100">
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{activeCount}</p>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-100">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{doneCount}</p>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Completed</p>
          </div>
        </div>

        {/* Preventive maintenance reminders */}
        {maintenanceReminders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Preventive Maintenance Reminders
            </h2>
            <div className="space-y-3">
              {maintenanceReminders.map((reminder) => (
                <div
                  key={reminder.nickname.toLowerCase()}
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 animate-slide-up"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-amber-900 leading-relaxed">
                      <span className="font-semibold">{reminder.nickname}</span> has needed repairs{' '}
                      {reminder.completedCount} times — consider a preventive maintenance check-up.
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600">
                      {reminder.equipmentType} · {reminder.completedCount} completed repair{reminder.completedCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request list */}
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Your Past Requests</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 text-stone-400 mb-4">
              <Tractor className="w-7 h-7" />
            </div>
            <h3 className="text-base font-medium text-stone-700">No requests yet</h3>
            <p className="mt-1 text-sm text-stone-500">
              Click "New Request" to submit your first repair.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req, i) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-stone-100 p-5 hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${URGENCY_STYLES[req.urgency]}`}>
                      {URGENCY_LABELS[req.urgency]}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                    {req.doorstep_repair && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
                        <Home className="w-3 h-3" />
                        Doorstep Visit
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(req.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-semibold text-stone-900 text-base">{req.equipment_type}</h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{req.problem_description}</p>

                {req.symptoms && req.symptoms.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    {req.symptoms.map((s) => (
                      <span key={s} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}

                {req.likely_issue && (
                  <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 space-y-2">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-900 leading-relaxed">{req.likely_issue}</p>
                    </div>
                    {req.cost_estimate && (
                      <div className="flex items-start gap-2 pt-2 border-t border-blue-100">
                        <CircleDollarSign className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-900 leading-relaxed">{req.cost_estimate}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-stone-50 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <User className="w-4 h-4 text-stone-400" />
                    {req.farmer_name}
                  </span>
                  {req.technician ? (
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Wrench className="w-4 h-4 text-stone-400" />
                      {req.technician.name}
                      {req.technician.rating >= 4.5 && (
                        <BadgeCheck className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-amber-500">★ {req.technician.rating}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-stone-400">
                      <Wrench className="w-4 h-4" />
                      Unassigned
                    </span>
                  )}

                  {/* Rating area for completed requests */}
                  {req.status === 'completed' && req.technician_id && (
                    req.review ? (
                      <span className="flex items-center gap-1.5 ml-auto">
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= req.review!.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-stone-200 fill-stone-100'
                              }`}
                            />
                          ))}
                        </span>
                        <span className="text-xs text-stone-400">Rated</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setRatingRequest(req)}
                        className="ml-auto flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Rate this repair
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <NewRequestForm
          farmerName={farmerName}
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            setShowForm(false);
            loadRequests();
          }}
        />
      )}

      {ratingRequest && (
        <RatingPopup
          request={ratingRequest}
          onClose={() => setRatingRequest(null)}
          onSubmitted={() => {
            setRatingRequest(null);
            loadRequests();
          }}
        />
      )}

      {showParts && (
        <SpareParts onClose={() => setShowParts(false)} />
      )}
    </div>
  );
}
