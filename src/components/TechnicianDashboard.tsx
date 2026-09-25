import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RepairRequestWithTech, Technician, Status } from '@/types';
import {
  Loader2, ArrowLeft, Wrench, Star, CheckCircle2, User, Clock,
  ChevronRight, X,
} from 'lucide-react';

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

const STATUS_FLOW: Status[] = ['requested', 'assigned', 'in_progress', 'completed'];
const NEXT_STATUS: Record<string, Status> = {
  requested: 'assigned',
  assigned: 'in_progress',
  in_progress: 'completed',
};

const URGENCY_LABELS: Record<string, string> = {
  normal: 'Normal',
  urgent: 'Urgent',
  critical: 'Critical',
};

const URGENCY_STYLES: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700',
  urgent: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

type FilterTab = 'all' | 'pending' | 'active' | 'completed';

interface Props {
  onBack: () => void;
}

export default function TechnicianDashboard({ onBack }: Props) {
  const [requests, setRequests] = useState<RepairRequestWithTech[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [activeTechId, setActiveTechId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequestWithTech | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*, technician:technicians(id, name, specialization, rating)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
      return;
    }
    setRequests((data || []) as RepairRequestWithTech[]);
    setLoading(false);
  }, []);

  const loadTechnicians = useCallback(async () => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error loading technicians:', error);
      return;
    }
    setTechnicians((data || []) as Technician[]);
  }, []);

  useEffect(() => {
    loadRequests();
    loadTechnicians();
  }, [loadRequests, loadTechnicians]);

  async function advanceStatus(req: RepairRequestWithTech) {
    const next = NEXT_STATUS[req.status];
    if (!next) return;

    setUpdating(true);
    const update: Record<string, unknown> = { status: next };

    if (req.status === 'requested' && activeTechId) {
      update.technician_id = activeTechId;
    } else if (req.status === 'requested' && req.technician_id) {
      // keep existing tech assignment
    } else if (req.status === 'requested' && !activeTechId) {
      if (technicians.length > 0) {
        update.technician_id = technicians[0].id;
      }
    }

    const { error } = await supabase
      .from('requests')
      .update(update)
      .eq('id', req.id);

    setUpdating(false);

    if (error) {
      console.error('Error updating request:', error);
      return;
    }

    await loadRequests();
    setSelectedRequest(null);
  }

  async function cancelRequest(req: RepairRequestWithTech) {
    setUpdating(true);
    const { error } = await supabase
      .from('requests')
      .update({ status: 'cancelled' })
      .eq('id', req.id);

    setUpdating(false);
    if (error) {
      console.error('Error cancelling request:', error);
      return;
    }
    await loadRequests();
    setSelectedRequest(null);
  }

  const filtered = requests.filter((r) => {
    if (activeTab === 'pending') return r.status === 'requested';
    if (activeTab === 'active') return ['assigned', 'in_progress'].includes(r.status);
    if (activeTab === 'completed') return r.status === 'completed' || r.status === 'cancelled';
    return true;
  });

  const tabCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'requested').length,
    active: requests.filter((r) => ['assigned', 'in_progress'].includes(r.status)).length,
    completed: requests.filter((r) => ['completed', 'cancelled'].includes(r.status)).length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Requested' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ];

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
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-700">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-stone-900 leading-tight">Technician Dashboard</h1>
                <p className="text-xs text-stone-500 leading-tight">Manage repair assignments</p>
              </div>
            </div>
          </div>

          {/* Tech identity selector */}
          <select
            value={activeTechId || ''}
            onChange={(e) => setActiveTechId(e.target.value || null)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          >
            <option value="">Working as…</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Technician cards */}
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Our Team</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {technicians.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                activeTechId === t.id
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-stone-100 hover:border-stone-200'
              }`}
              onClick={() => setActiveTechId(activeTechId === t.id ? null : t.id)}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold">
                  {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-stone-500 truncate">{t.specialization}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{t.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-stone-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-stone-900'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-stone-400">{tabCounts[tab.key]}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Request list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 text-stone-400 mb-4">
              <Wrench className="w-7 h-7" />
            </div>
            <h3 className="text-base font-medium text-stone-700">No requests here</h3>
            <p className="mt-1 text-sm text-stone-500">
              {activeTab === 'pending'
                ? 'All caught up — no requested repairs.'
                : 'Requests will appear here when available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-stone-100 p-5 hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${URGENCY_STYLES[req.urgency]}`}>
                        {URGENCY_LABELS[req.urgency] || req.urgency}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-stone-900 text-base">{req.equipment_type}</h3>
                    <p className="mt-1 text-sm text-stone-600 line-clamp-2">{req.problem_description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {req.farmer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(req.created_at).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric',
                        })}
                      </span>
                      {req.technician && (
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-stone-400" />
                          {req.technician.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action area */}
                  <div className="flex flex-col items-end gap-2">
                    {req.status !== 'completed' && req.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
                        >
                          Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {NEXT_STATUS[req.status] && (
                          <button
                            onClick={() => advanceStatus(req)}
                            disabled={updating}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                          >
                            {req.status === 'requested' && 'Assign & Accept'}
                            {req.status === 'assigned' && 'Start Work'}
                            {req.status === 'in_progress' && <><CheckCircle2 className="w-4 h-4" /> Complete</>}
                          </button>
                        )}
                      </>
                    )}
                    {req.status === 'completed' && (
                      <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                    {req.status === 'cancelled' && (
                      <span className="text-sm text-red-500 font-medium">Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h3 className="text-lg font-semibold text-stone-900">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${URGENCY_STYLES[selectedRequest.urgency]}`}>
                  {URGENCY_LABELS[selectedRequest.urgency] || selectedRequest.urgency}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[selectedRequest.status]}`}>
                  {STATUS_LABELS[selectedRequest.status]}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Equipment</p>
                <p className="font-semibold text-stone-900">{selectedRequest.equipment_type}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Problem</p>
                <p className="text-sm text-stone-700 leading-relaxed">{selectedRequest.problem_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Farmer</p>
                  <p className="text-sm text-stone-700">{selectedRequest.farmer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Submitted</p>
                  <p className="text-sm text-stone-700">
                    {new Date(selectedRequest.created_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Technician</p>
                  <p className="text-sm text-stone-700">
                    {selectedRequest.technician
                      ? `${selectedRequest.technician.name} (${selectedRequest.technician.specialization})`
                      : 'Not yet assigned'}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Progress</p>
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((s, idx) => {
                    const currentIdx = STATUS_FLOW.indexOf(selectedRequest.status);
                    const reached = idx <= currentIdx;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
                          {idx > 0 && (
                            <div className={`h-1 w-full mb-2 -mt-2.5 ${idx <= currentIdx ? 'bg-amber-500' : 'bg-stone-200'}`} />
                          )}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              reached
                                ? 'bg-amber-500 text-white'
                                : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1 ${reached ? 'text-stone-700' : 'text-stone-400'}`}>
                            {STATUS_LABELS[s]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-stone-100">
                {selectedRequest.status !== 'cancelled' && selectedRequest.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => cancelRequest(selectedRequest)}
                      disabled={updating}
                      className="flex-1 rounded-lg border border-red-200 text-red-600 px-4 py-2.5 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel Request
                    </button>
                    {NEXT_STATUS[selectedRequest.status] && (
                      <button
                        onClick={() => advanceStatus(selectedRequest)}
                        disabled={updating}
                        className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {updating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {selectedRequest.status === 'requested' && 'Assign & Accept'}
                            {selectedRequest.status === 'assigned' && 'Start Work'}
                            {selectedRequest.status === 'in_progress' && 'Mark Complete'}
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
