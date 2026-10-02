import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Urgency } from '@/types';
import { SYMPTOMS_BY_EQUIPMENT, getLikelyIssue, getCostEstimate } from '@/lib/symptoms';
import { getMatchingSpecialization } from '@/lib/technicianMatching';
import { Loader2, Send, CheckCircle2, X, Lightbulb, CheckSquare, Square, CircleDollarSign, Home, Mic, Volume2, Square as StopIcon } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useSpeech, useSpeechRecognition } from '@/lib/useVoice';

const EQUIPMENT_TYPES = [
  'Tractor',
  'Sprayer',
  'Tiller',
  'Harvester',
  'Pump',
  'Planter',
  'Weeder',
  'Other',
];

const URGENCY_OPTIONS: { value: Urgency; key: string }[] = [
  { value: 'normal', key: 'urgency.normal' },
  { value: 'urgent', key: 'urgency.urgent' },
  { value: 'critical', key: 'urgency.critical' },
];

interface Props {
  farmerName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function NewRequestForm({ farmerName, onClose, onSubmitted }: Props) {
  const { t, tf } = useLanguage();
  const { speaking, speak, stopSpeaking } = useSpeech();
  const [speakingIssue, setSpeakingIssue] = useState(false);

  useEffect(() => {
    if (!speaking) setSpeakingIssue(false);
  }, [speaking]);

  const speechRecognition = useSpeechRecognition((text: string) => {
    setProblemDescription((prev) => (prev.trim() ? `${prev} ${text}` : text));
  });
  const [equipmentType, setEquipmentType] = useState(EQUIPMENT_TYPES[0]);
  const [problemDescription, setProblemDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('normal');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [doorstepRepair, setDoorstepRepair] = useState(false);
  const [equipmentNickname, setEquipmentNickname] = useState('');
  const [matchedTechnicianName, setMatchedTechnicianName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableSymptoms = SYMPTOMS_BY_EQUIPMENT[equipmentType] || SYMPTOMS_BY_EQUIPMENT['Other'];

  const likelyIssueResult = useMemo(
    () => getLikelyIssue(equipmentType, selectedSymptoms),
    [equipmentType, selectedSymptoms]
  );

  const costEstimateResult = useMemo(
    () => getCostEstimate(equipmentType, selectedSymptoms),
    [equipmentType, selectedSymptoms]
  );

  const likelyIssueText = useMemo(() => {
    if (!likelyIssueResult) return null;
    if (likelyIssueResult.isGeneral) {
      const symptomNames = likelyIssueResult.symptoms.map((s) => t(`symptom.${s}`)).join(', ');
      return tf('issue.general', { symptoms: symptomNames });
    }
    return tf('issue.prefix', {
      issue: t(likelyIssueResult.issueKey),
      time: likelyIssueResult.estTime,
    });
  }, [likelyIssueResult, t, tf]);

  const costEstimateText = useMemo(() => {
    if (!costEstimateResult) return null;
    return tf('cost.template', {
      low: `\u20B9${costEstimateResult.low}`,
      high: `\u20B9${costEstimateResult.high}`,
    });
  }, [costEstimateResult, tf]);

  function handleEquipmentChange(value: string) {
    setEquipmentType(value);
    setSelectedSymptoms([]);
  }

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const matchedSpecialization = getMatchingSpecialization(
      equipmentType,
      selectedSymptoms,
      problemDescription,
    );
    let technicianId: string | null = null;
    let technicianName: string | null = null;

    if (matchedSpecialization) {
      const { data: technician, error: technicianError } = await supabase
        .from('technicians')
        .select('id, name')
        .eq('specialization', matchedSpecialization)
        .order('rating', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (technicianError) {
        setSubmitting(false);
        setError(t('form.error.noTech'));
        return;
      }

      technicianId = technician?.id || null;
      technicianName = technician?.name || null;
    }

    const { error: insertError } = await supabase.from('requests').insert({
      farmer_name: farmerName,
      equipment_type: equipmentType,
      problem_description: problemDescription,
      urgency,
      status: 'requested',
      technician_id: technicianId,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : null,
      likely_issue: likelyIssueText,
      cost_estimate: costEstimateText,
      doorstep_repair: doorstepRepair,
      equipment_nickname: equipmentNickname.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(t('form.error'));
      return;
    }

    setMatchedTechnicianName(technicianName);
    setSuccess(true);
    setTimeout(() => {
      onSubmitted();
    }, 1800);
  }

  const canSubmit = problemDescription.trim() && !submitting;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-semibold text-stone-900">{t('form.success')}</h3>
          {matchedTechnicianName ? (
            <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-800">
                {t('form.success.matched')} <span className="font-semibold">{matchedTechnicianName}</span>.
              </p>
              <p className="mt-1 text-xs text-green-600">
                {t('form.success.matched.desc')}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-500">
              {t('form.success.unmatched')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{t('form.title')}</h3>
            <p className="text-xs text-stone-500 mt-0.5">{t('form.submittingAs')} {farmerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Equipment Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('form.equipmentType')}</label>
            <select
              value={equipmentType}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
            >
              {EQUIPMENT_TYPES.map((eq) => (
                <option key={eq} value={eq}>{t(`eq.${eq}`)}</option>
              ))}
            </select>
          </div>

          {/* Equipment Nickname */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('form.equipmentNickname')} <span className="text-stone-400 font-normal">{t('form.equipmentNickname.optional')}</span>
            </label>
            <input
              type="text"
              value={equipmentNickname}
              onChange={(e) => setEquipmentNickname(e.target.value)}
              placeholder={t('form.equipmentNickname.placeholder')}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
            <p className="mt-1.5 text-xs text-stone-400">{t('form.equipmentNickname.hint')}</p>
          </div>

          {/* Common Symptoms */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              {t('form.symptoms')} <span className="text-stone-400 font-normal">{t('form.symptoms.optional')}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSymptoms.map((symptom) => {
                const checked = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                      checked
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-300 shrink-0" />
                    )}
                    {t(`symptom.${symptom}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Likely Issue + Cost Estimate */}
          {likelyIssueText && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 animate-fade-in space-y-3">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                      {t('form.likelyIssue')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (speakingIssue) {
                          stopSpeaking();
                          setSpeakingIssue(false);
                        } else {
                          speak(likelyIssueText);
                          setSpeakingIssue(true);
                        }
                      }}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors shrink-0 ${
                        speakingIssue
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'
                      }`}
                      title={speakingIssue ? t('common.stop') : t('common.listen')}
                    >
                      {speakingIssue ? <StopIcon className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm text-blue-900 leading-relaxed">{likelyIssueText}</p>
                </div>
              </div>
              {costEstimateText && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-blue-100">
                  <CircleDollarSign className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                      {t('form.costEstimate')}
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">{costEstimateText}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('form.problemDescription')}</label>
            <div className="relative">
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder={t('form.problemPlaceholder')}
                rows={4}
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none pr-11"
                required
              />
              {speechRecognition.hasSupport && (
                <button
                  type="button"
                  onClick={() => {
                    if (speechRecognition.isListening) {
                      speechRecognition.stopListening();
                    } else {
                      speechRecognition.startListening();
                    }
                  }}
                  className={`absolute top-2.5 right-2.5 inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                    speechRecognition.isListening
                      ? 'text-red-600 bg-red-50 animate-pulse'
                      : 'text-stone-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title={speechRecognition.isListening ? t('common.stopListening') : t('common.speak')}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('form.urgency')}</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{t(u.key)}</option>
              ))}
            </select>
          </div>

          {/* Doorstep repair toggle */}
          <button
            type="button"
            onClick={() => setDoorstepRepair((prev) => !prev)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all w-full ${
              doorstepRepair
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            {doorstepRepair ? (
              <CheckSquare className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-300 shrink-0" />
            )}
            <div className="flex-1">
              <span className="font-medium">{t('form.doorstepRepair')}</span>
              <p className="text-xs text-stone-400 mt-0.5">{t('form.doorstepRepair.desc')}</p>
            </div>
            <Home className={`w-5 h-5 shrink-0 ${doorstepRepair ? 'text-green-600' : 'text-stone-300'}`} />
          </button>

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
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('form.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('form.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
