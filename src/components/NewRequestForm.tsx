import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Urgency } from '@/types';
import { SYMPTOMS_BY_EQUIPMENT, getLikelyIssue, getCostEstimate } from '@/lib/symptoms';
import { Loader2, Send, CheckCircle2, X, Lightbulb, CheckSquare, Square, CircleDollarSign, Home } from 'lucide-react';

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

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
];

interface Props {
  farmerName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function NewRequestForm({ farmerName, onClose, onSubmitted }: Props) {
  const [equipmentType, setEquipmentType] = useState(EQUIPMENT_TYPES[0]);
  const [problemDescription, setProblemDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('normal');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [doorstepRepair, setDoorstepRepair] = useState(false);
  const [equipmentNickname, setEquipmentNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableSymptoms = SYMPTOMS_BY_EQUIPMENT[equipmentType] || SYMPTOMS_BY_EQUIPMENT['Other'];

  const likelyIssue = useMemo(
    () => getLikelyIssue(equipmentType, selectedSymptoms),
    [equipmentType, selectedSymptoms]
  );

  const costEstimate = useMemo(
    () => getCostEstimate(equipmentType, selectedSymptoms),
    [equipmentType, selectedSymptoms]
  );

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

    const { error: insertError } = await supabase.from('requests').insert({
      farmer_name: farmerName,
      equipment_type: equipmentType,
      problem_description: problemDescription,
      urgency,
      status: 'requested',
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : null,
      likely_issue: likelyIssue,
      cost_estimate: costEstimate,
      doorstep_repair: doorstepRepair,
      equipment_nickname: equipmentNickname.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong. Please try again.');
      return;
    }

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
          <h3 className="text-xl font-semibold text-stone-900">Request Submitted!</h3>
          <p className="mt-2 text-sm text-stone-500">
            Your repair request has been received. A technician will review it shortly. You can track its status below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">New Repair Request</h3>
            <p className="text-xs text-stone-500 mt-0.5">Submitting as {farmerName}</p>
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
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Equipment Type</label>
            <select
              value={equipmentType}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Equipment Nickname */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Equipment ID / Nickname <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={equipmentNickname}
              onChange={(e) => setEquipmentNickname(e.target.value)}
              placeholder="e.g. My red tractor, Pump #1"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
            <p className="mt-1.5 text-xs text-stone-400">Name this machine to track its repair history across multiple requests.</p>
          </div>

          {/* Common Symptoms */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Common Symptoms <span className="text-stone-400 font-normal">(select all that apply)</span>
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
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Likely Issue + Cost Estimate */}
          {likelyIssue && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 animate-fade-in space-y-3">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                    Likely Issue
                  </p>
                  <p className="text-sm text-blue-900 leading-relaxed">{likelyIssue}</p>
                </div>
              </div>
              {costEstimate && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-blue-100">
                  <CircleDollarSign className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                      Cost Estimate
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">{costEstimate}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Problem Description</label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the issue — what's happening, when it started, any error codes..."
              rows={4}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
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
              <span className="font-medium">Doorstep repair needed</span>
              <p className="text-xs text-stone-400 mt-0.5">Check this if the equipment cannot be transported to the workshop</p>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
