export const SYMPTOMS_BY_EQUIPMENT: Record<string, string[]> = {
  Tractor: [
    "Won't start",
    'Engine stalls',
    'Smoke from exhaust',
    'Overheating',
    'Unusual noise',
    'Other',
  ],
  Sprayer: [
    'Nozzle clogged',
    'Pressure loss',
    'Leaking',
    'Pump not working',
    'Other',
  ],
  Tiller: [
    "Won't start",
    'Blades not turning',
    'Engine stalls',
    'Vibration / shaking',
    'Other',
  ],
  Harvester: [
    "Won't start",
    'Cutting bar jammed',
    'Grain loss / spillage',
    'Conveyor not moving',
    'Overheating',
    'Other',
  ],
  Pump: [
    'Not drawing water',
    'Motor not starting',
    'Leaking',
    'Overheating',
    'Other',
  ],
  Planter: [
    'Seed not dropping',
    'Uneven spacing',
    'Hopper jammed',
    'Depth control issue',
    'Other',
  ],
  Weeder: [
    "Won't start",
    'Tines not rotating',
    'Engine stalls',
    'Uneven cutting',
    'Other',
  ],
  Other: [
    "Won't start",
    'Unusual noise',
    'Leaking',
    'Overheating',
    'Other',
  ],
};

interface IssueRule {
  match: string[];
  issueKey: string;
  estTime: string;
}

const ISSUE_RULES: Record<string, IssueRule[]> = {
  Tractor: [
    { match: ["Won't start", 'Smoke from exhaust'], issueKey: 'issue.Tractor.0', estTime: '15–20 mins' },
    { match: ["Won't start", 'Overheating'], issueKey: 'issue.Tractor.1', estTime: '20–30 mins' },
    { match: ['Engine stalls', 'Unusual noise'], issueKey: 'issue.Tractor.2', estTime: '25–35 mins' },
    { match: ['Overheating', 'Smoke from exhaust'], issueKey: 'issue.Tractor.3', estTime: '30–45 mins' },
    { match: ['Overheating'], issueKey: 'issue.Tractor.4', estTime: '15–25 mins' },
    { match: ["Won't start"], issueKey: 'issue.Tractor.5', estTime: '10–20 mins' },
    { match: ['Engine stalls'], issueKey: 'issue.Tractor.6', estTime: '15–25 mins' },
    { match: ['Smoke from exhaust'], issueKey: 'issue.Tractor.7', estTime: '20–30 mins' },
    { match: ['Unusual noise'], issueKey: 'issue.Tractor.8', estTime: '20–40 mins' },
  ],
  Sprayer: [
    { match: ['Nozzle clogged', 'Pressure loss'], issueKey: 'issue.Sprayer.0', estTime: '15–25 mins' },
    { match: ['Pump not working', 'Pressure loss'], issueKey: 'issue.Sprayer.1', estTime: '20–30 mins' },
    { match: ['Leaking', 'Pressure loss'], issueKey: 'issue.Sprayer.2', estTime: '10–20 mins' },
    { match: ['Nozzle clogged'], issueKey: 'issue.Sprayer.3', estTime: '10–15 mins' },
    { match: ['Pump not working'], issueKey: 'issue.Sprayer.4', estTime: '20–35 mins' },
    { match: ['Leaking'], issueKey: 'issue.Sprayer.5', estTime: '10–20 mins' },
  ],
  Tiller: [
    { match: ["Won't start", 'Engine stalls'], issueKey: 'issue.Tiller.0', estTime: '15–25 mins' },
    { match: ['Blades not turning', 'Vibration / shaking'], issueKey: 'issue.Tiller.1', estTime: '20–30 mins' },
    { match: ["Won't start"], issueKey: 'issue.Tiller.2', estTime: '10–20 mins' },
    { match: ['Blades not turning'], issueKey: 'issue.Tiller.3', estTime: '15–25 mins' },
    { match: ['Vibration / shaking'], issueKey: 'issue.Tiller.4', estTime: '10–20 mins' },
  ],
  Harvester: [
    { match: ['Cutting bar jammed', 'Conveyor not moving'], issueKey: 'issue.Harvester.0', estTime: '25–40 mins' },
    { match: ['Grain loss / spillage', 'Conveyor not moving'], issueKey: 'issue.Harvester.1', estTime: '20–35 mins' },
    { match: ["Won't start", 'Overheating'], issueKey: 'issue.Harvester.2', estTime: '25–40 mins' },
    { match: ['Cutting bar jammed'], issueKey: 'issue.Harvester.3', estTime: '15–25 mins' },
    { match: ['Grain loss / spillage'], issueKey: 'issue.Harvester.4', estTime: '15–25 mins' },
    { match: ['Conveyor not moving'], issueKey: 'issue.Harvester.5', estTime: '20–30 mins' },
  ],
  Pump: [
    { match: ['Not drawing water', 'Motor not starting'], issueKey: 'issue.Pump.0', estTime: '20–35 mins' },
    { match: ['Not drawing water', 'Leaking'], issueKey: 'issue.Pump.1', estTime: '15–25 mins' },
    { match: ['Overheating', 'Motor not starting'], issueKey: 'issue.Pump.2', estTime: '25–40 mins' },
    { match: ['Not drawing water'], issueKey: 'issue.Pump.3', estTime: '15–25 mins' },
    { match: ['Leaking'], issueKey: 'issue.Pump.4', estTime: '10–20 mins' },
    { match: ['Overheating'], issueKey: 'issue.Pump.5', estTime: '15–25 mins' },
  ],
  Planter: [
    { match: ['Seed not dropping', 'Hopper jammed'], issueKey: 'issue.Planter.0', estTime: '15–25 mins' },
    { match: ['Uneven spacing', 'Depth control issue'], issueKey: 'issue.Planter.1', estTime: '20–30 mins' },
    { match: ['Seed not dropping'], issueKey: 'issue.Planter.2', estTime: '10–20 mins' },
    { match: ['Uneven spacing'], issueKey: 'issue.Planter.3', estTime: '15–25 mins' },
    { match: ['Hopper jammed'], issueKey: 'issue.Planter.4', estTime: '10–15 mins' },
  ],
  Weeder: [
    { match: ["Won't start", 'Engine stalls'], issueKey: 'issue.Weeder.0', estTime: '15–25 mins' },
    { match: ['Tines not rotating', 'Uneven cutting'], issueKey: 'issue.Weeder.1', estTime: '20–30 mins' },
    { match: ["Won't start"], issueKey: 'issue.Weeder.2', estTime: '10–20 mins' },
    { match: ['Tines not rotating'], issueKey: 'issue.Weeder.3', estTime: '15–25 mins' },
    { match: ['Uneven cutting'], issueKey: 'issue.Weeder.4', estTime: '10–20 mins' },
  ],
  Other: [
    { match: ["Won't start", 'Overheating'], issueKey: 'issue.Other.0', estTime: '20–35 mins' },
    { match: ["Won't start"], issueKey: 'issue.Other.1', estTime: '10–20 mins' },
    { match: ['Unusual noise'], issueKey: 'issue.Other.2', estTime: '15–30 mins' },
    { match: ['Leaking'], issueKey: 'issue.Other.3', estTime: '10–20 mins' },
    { match: ['Overheating'], issueKey: 'issue.Other.4', estTime: '15–25 mins' },
  ],
};

export interface LikelyIssueResult {
  issueKey: string;
  estTime: string;
  isGeneral: boolean;
  symptoms: string[];
}

export function getLikelyIssue(equipmentType: string, symptoms: string[]): LikelyIssueResult | null {
  if (!symptoms.length || symptoms.length === 0) return null;
  const rules = ISSUE_RULES[equipmentType] || ISSUE_RULES['Other'];

  for (const rule of rules) {
    if (rule.match.every((s) => symptoms.includes(s))) {
      return { issueKey: rule.issueKey, estTime: rule.estTime, isGeneral: false, symptoms };
    }
  }

  return { issueKey: 'issue.general', estTime: '15–30 mins', isGeneral: true, symptoms };
}

const BASE_COST_BY_EQUIPMENT: Record<string, { low: number; high: number }> = {
  Tractor: { low: 500, high: 1000 },
  Harvester: { low: 700, high: 1200 },
  Sprayer: { low: 300, high: 600 },
  Pump: { low: 300, high: 600 },
  Tiller: { low: 200, high: 450 },
  Planter: { low: 250, high: 500 },
  Weeder: { low: 200, high: 400 },
  Other: { low: 250, high: 500 },
};

const COMPLEX_SYMPOMS = new Set([
  "Won't start",
  'Motor not starting',
  'Smoke from exhaust',
  'Overheating',
  'Unusual noise',
  'Pump not working',
  'Vibration / shaking',
  'Cutting bar jammed',
  'Conveyor not moving',
]);

export interface CostEstimateResult {
  low: number;
  high: number;
}

export function getCostEstimate(equipmentType: string, symptoms: string[]): CostEstimateResult | null {
  if (!symptoms.length || symptoms.length === 0) return null;

  const base = BASE_COST_BY_EQUIPMENT[equipmentType] || BASE_COST_BY_EQUIPMENT['Other'];
  let low = base.low;
  let high = base.high;

  const complexCount = symptoms.filter((s) => COMPLEX_SYMPOMS.has(s)).length;
  const symptomBonus = Math.max(0, symptoms.length - 1);

  low += complexCount * 100 + symptomBonus * 50;
  high += complexCount * 200 + symptomBonus * 100;

  return { low, high };
}
