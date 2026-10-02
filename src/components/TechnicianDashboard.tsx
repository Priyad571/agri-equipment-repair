import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RepairRequestWithTech, Technician, Status, Review } from '@/types';
import { getMatchingSpecialization, requestMatchesTechnician } from '@/lib/technicianMatching';
import SpareParts from './SpareParts';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/lib/LanguageContext';
import { Loader as Loader2, ArrowLeft, Wrench, Star, CircleCheck as CheckCircle2, User, Clock, ChevronRight, X, Lightbulb, Activity, MessageSquare, Package, CircleDollarSign, BadgeCheck, Chrome as Home, Volume2, Square } from 'lucide-react';
import { useSpeech } from '@/lib/useVoice';

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-gray-100 text-gray-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_FLOW: Status[] = ['requested', 'assigned', 'in_progress', 'completed'];
const NEXT_STATUS: Record<string, Status> = {
  requested: 'assigned',
  assigned: 'in_progress',
  in_progress: 'completed',
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
  const { t, lang } = useLanguage();
  const { speaking, speak, stopSpeaking } = useSpeech();
  const [speakingTarget, setSpeakingTarget] = useState<string | null>(null);

  function handleSpeak(text: string, target: string) {
    if (speaking && speakingTarget === target) {
      stopSpeaking();
      setSpeakingTarget(null);
    } else {
      speak(text);
      setSpeakingTarget(target);
    }
  }

  function makeSpeakButton(text: string, target: string) {
    const isThisSpeaking = speaking && speakingTarget === target;
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleSpeak(text, target); }}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors shrink-0 ${
          isThisSpeaking
            ? 'text-amber-600 bg-amber-50'
            : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50'
        }`}
        title={isThisSpeaking ? t('common.stop') : t('common.listen')}
      >
        {isThisSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    );
  }
  const [requests, setRequests] = useState<RepairRequestWithTech[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [reviewsByTech, setReviewsByTech] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [activeTechId, setActiveTechId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequestWithTech | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const [partsEquipmentFilter, setPartsEquipmentFilter] = useState<string | undefined>(undefined);

  const loadRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*, technician:technicians(id, name, specialization, rating), review:reviews(id, rating, feedback)')
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

  const loadReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading reviews:', error);
      return;
    }

    const grouped: Record<string, Review[]> = {};
    (data || []).forEach((r: Review) => {
      if (!grouped[r.technician_id]) grouped[r.technician_id] = [];
      grouped[r.technician_id].push(r);
    });
    setReviewsByTech(grouped);
  }, []);

  useEffect(() => {
    loadRequests();
    loadTechnicians();
    loadReviews();
  }, [loadRequests, loadTechnicians, loadReviews]);

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

  const activeTechnician = technicians.find((tech) => tech.id === activeTechId) || null;

  const filtered = requests.filter((r) => {
    if (activeTab === 'pending') {
      if (r.status !== 'requested') return false;
      if (activeTechnician) {
        const matchedSpec = getMatchingSpecialization(
          r.equipment_type,
          r.symptoms || [],
          r.problem_description,
        );
        return requestMatchesTechnician(activeTechnician.specialization, matchedSpec);
      }
      return true;
    }
    if (activeTab === 'active') return ['assigned', 'in_progress'].includes(r.status);
    if (activeTab === 'completed') return r.status === 'completed' || r.status === 'cancelled';
    return true;
  });

  const tabCounts = {
    all: requests.length,
    pending: requests.filter((r) => {
      if (r.status !== 'requested') return false;
      if (activeTechnician) {
        const matchedSpec = getMatchingSpecialization(
          r.equipment_type,
          r.symptoms || [],
          r.problem_description,
        );
        return requestMatchesTechnician(activeTechnician.specialization, matchedSpec);
      }
      return true;
    }).length,
    active: requests.filter((r) => ['assigned', 'in_progress'].includes(r.status)).length,
    completed: requests.filter((r) => ['completed', 'cancelled'].includes(r.status)).length,
  };

  const tabs: { key: FilterTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'tech.tab.all' },
    { key: 'pending', labelKey: 'tech.tab.requested' },
    { key: 'active', labelKey: 'tech.tab.active' },
    { key: 'completed', labelKey: 'tech.tab.done' },
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
              <span className="hidden sm:inline">{t('back')}</span>
            </button>
            <div className="h-6 w-px bg-stone-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-700">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-stone-900 leading-tight">{t('tech.dashboard')}</h1>
                <p className="text-xs text-stone-500 leading-tight">{t('tech.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Tech identity selector */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => { setPartsEquipmentFilter(undefined); setShowParts(true); }}
              className="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t('farmer.spareParts')}</span>
            </button>
            <select
              value={activeTechId || ''}
              onChange={(e) => setActiveTechId(e.target.value || null)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            >
              <option value="">{t('tech.workingAs')}</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Technician cards */}
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">{t('tech.ourTeam')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {technicians.map((tech) => {
            const techReviews = reviewsByTech[tech.id] || [];
            return (
              <div
                key={tech.id}
                className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                  activeTechId === tech.id
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-stone-100 hover:border-stone-200'
                }`}
                onClick={() => setActiveTechId(activeTechId === tech.id ? null : tech.id)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold">
                    {tech.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-stone-900 text-sm truncate">{tech.name}</p>
                      {tech.rating >= 4.5 && (
                        <BadgeCheck className="w-4 h-4 text-green-600 shrink-0" />
                      )}
                    </div>
                    {tech.rating >= 4.5 ? (
                      <p className="text-xs text-green-600 font-medium truncate">{t('tech.certified')}</p>
                    ) : (
                      <p className="text-xs text-stone-500 truncate">{t(`spec.${tech.specialization}`)}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{tech.rating.toFixed(1)}</span>
                  </div>
                  {tech.rating_count > 0 && (
                    <span className="text-xs text-stone-400">({tech.rating_count} {tech.rating_count !== 1 ? t('tech.reviews') : t('tech.review')})</span>
                  )}
                </div>
              </div>
            );
          })}
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
              {t(tab.labelKey)}
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
            <h3 className="text-base font-medium text-stone-700">{t('tech.noRequests')}</h3>
            <p className="mt-1 text-sm text-stone-500">
              {activeTab === 'pending'
                ? activeTechnician
                  ? `${t('tech.noRequests.matched')} (${t(`spec.${activeTechnician.specialization}`)}).`
                  : t('tech.noRequests.allCaughtUp')
                : t('tech.noRequests.desc')}
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
                        {t(`urgency.${req.urgency}`)}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[req.status]}`}>
                        {t(`status.${req.status}`)}
                      </span>
                      {req.doorstep_repair && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
                          <Home className="w-3 h-3" />
                          {t('farmer.doorstepVisit')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-stone-900 text-base">{t(`eq.${req.equipment_type}`)}</h3>
                    <p className="mt-1 text-sm text-stone-600 line-clamp-2">{req.problem_description}</p>
                    {req.symptoms && req.symptoms.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {req.symptoms.map((s) => (
                          <span key={s} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{t(`symptom.${s}`)}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {req.farmer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(req.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'ka' ? 'kn-IN' : undefined, {
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
                          {t('tech.details')}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {NEXT_STATUS[req.status] && (
                          <button
                            onClick={() => advanceStatus(req)}
                            disabled={updating}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                          >
                            {req.status === 'requested' && t('tech.assignAccept')}
                            {req.status === 'assigned' && t('tech.startWork')}
                            {req.status === 'in_progress' && <><CheckCircle2 className="w-4 h-4" /> {t('tech.complete')}</>}
                          </button>
                        )}
                      </>
                    )}
                    {req.status === 'completed' && (
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {t('tech.viewDetails')}
                      </button>
                    )}
                    {req.status === 'cancelled' && (
                      <span className="text-sm text-red-500 font-medium">{t('tech.cancelled')}</span>
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
              <h3 className="text-lg font-semibold text-stone-900">{t('tech.requestDetails')}</h3>
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
                  {t(`urgency.${selectedRequest.urgency}`)}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[selectedRequest.status]}`}>
                  {t(`status.${selectedRequest.status}`)}
                </span>
                {selectedRequest.doorstep_repair && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
                    <Home className="w-3 h-3" />
                    {t('farmer.doorstepVisit')}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{t('tech.equipment')}</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900">{t(`eq.${selectedRequest.equipment_type}`)}</p>
                  {makeSpeakButton(t(`eq.${selectedRequest.equipment_type}`), 'detail-equipment')}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{t('tech.problem')}</p>
                <div className="flex items-start gap-2">
                  <p className="text-sm text-stone-700 leading-relaxed flex-1">{selectedRequest.problem_description}</p>
                  {makeSpeakButton(selectedRequest.problem_description, 'detail-problem')}
                </div>
              </div>

              {selectedRequest.symptoms && selectedRequest.symptoms.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">{t('tech.symptomsReported')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.symptoms.map((s) => (
                      <span key={s} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">{t(`symptom.${s}`)}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.likely_issue && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">{t('form.likelyIssue')}</p>
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-blue-900 leading-relaxed flex-1">{selectedRequest.likely_issue}</p>
                        {makeSpeakButton(selectedRequest.likely_issue, 'detail-issue')}
                      </div>
                      {selectedRequest.cost_estimate && (
                        <div className="mt-2 pt-2 border-t border-blue-100 flex items-start gap-2">
                          <CircleDollarSign className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800 leading-relaxed">{selectedRequest.cost_estimate}</p>
                        </div>
                      )}
                      <button
                        onClick={() => { setPartsEquipmentFilter(selectedRequest.equipment_type); setShowParts(true); }}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        {t('tech.checkParts')} {t(`eq.${selectedRequest.equipment_type}`)}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{t('tech.farmer')}</p>
                  <p className="text-sm text-stone-700">{selectedRequest.farmer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{t('tech.submitted')}</p>
                  <p className="text-sm text-stone-700">
                    {new Date(selectedRequest.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'ka' ? 'kn-IN' : undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{t('tech.technician')}</p>
                  {selectedRequest.technician ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-stone-700">{selectedRequest.technician.name}</p>
                        {selectedRequest.technician.rating >= 4.5 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            {t('tech.certified')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{t(`spec.${selectedRequest.technician.specialization}`)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-stone-700">{t('tech.notAssigned')}</p>
                  )}
                </div>
              </div>

              {/* Farmer's rating & feedback for this request */}
              {selectedRequest.review && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">{t('tech.farmersRating')}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= selectedRequest.review!.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-200 fill-stone-100'
                        }`}
                      />
                    ))}
                  </div>
                  {selectedRequest.review.feedback && (
                    <p className="text-sm text-stone-700 leading-relaxed italic">
                      "{selectedRequest.review.feedback}"
                    </p>
                  )}
                </div>
              )}

              {/* Recent Reviews for the assigned technician */}
              {selectedRequest.technician && (reviewsByTech[selectedRequest.technician.id] || []).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                    {t('tech.recentReviews')} {selectedRequest.technician.name}
                  </p>
                  <div className="space-y-3">
                    {(reviewsByTech[selectedRequest.technician.id] || []).slice(0, 5).map((rev) => (
                      <div key={rev.id} className="rounded-lg border border-stone-100 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-stone-600">{rev.farmer_name}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-stone-200 fill-stone-100'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.feedback && (
                          <p className="text-xs text-stone-600 leading-relaxed flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                            {rev.feedback}
                          </p>
                        )}
                        <p className="text-[10px] text-stone-400 mt-1.5">
                          {new Date(rev.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'ka' ? 'kn-IN' : undefined, {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">{t('tech.progress')}</p>
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
                            {t(`status.${s}`)}
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
                      {t('tech.cancelRequest')}
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
                            {selectedRequest.status === 'requested' && t('tech.assignAccept')}
                            {selectedRequest.status === 'assigned' && t('tech.startWork')}
                            {selectedRequest.status === 'in_progress' && t('tech.markComplete')}
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

      {showParts && (
        <SpareParts
          onClose={() => setShowParts(false)}
          initialEquipmentFilter={partsEquipmentFilter}
        />
      )}
    </div>
  );
}
