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
  issue: string;
  estTime: string;
}

const ISSUE_RULES: Record<string, IssueRule[]> = {
  Tractor: [
    { match: ["Won't start", 'Smoke from exhaust'], issue: 'Fuel system or ignition fault', estTime: '15–20 mins' },
    { match: ["Won't start", 'Overheating'], issue: 'Cooling system failure or low coolant', estTime: '20–30 mins' },
    { match: ['Engine stalls', 'Unusual noise'], issue: 'Mechanical wear or low oil pressure', estTime: '25–35 mins' },
    { match: ['Overheating', 'Smoke from exhaust'], issue: 'Coolant leak or head gasket failure', estTime: '30–45 mins' },
    { match: ['Overheating'], issue: 'Radiator blockage or thermostat failure', estTime: '15–25 mins' },
    { match: ["Won't start"], issue: 'Battery, starter, or fuel supply issue', estTime: '10–20 mins' },
    { match: ['Engine stalls'], issue: 'Fuel filter clog or idle adjustment', estTime: '15–25 mins' },
    { match: ['Smoke from exhaust'], issue: 'Oil or fuel mixture problem', estTime: '20–30 mins' },
    { match: ['Unusual noise'], issue: 'Bearing, belt, or drivetrain wear', estTime: '20–40 mins' },
  ],
  Sprayer: [
    { match: ['Nozzle clogged', 'Pressure loss'], issue: 'Nozzle blockage or pump wear', estTime: '15–25 mins' },
    { match: ['Pump not working', 'Pressure loss'], issue: 'Pump diaphragm or valve failure', estTime: '20–30 mins' },
    { match: ['Leaking', 'Pressure loss'], issue: 'Hose or fitting failure', estTime: '10–20 mins' },
    { match: ['Nozzle clogged'], issue: 'Nozzle cleaning or replacement', estTime: '10–15 mins' },
    { match: ['Pump not working'], issue: 'Pump motor or drive issue', estTime: '20–35 mins' },
    { match: ['Leaking'], issue: 'Seal or gasket replacement', estTime: '10–20 mins' },
  ],
  Tiller: [
    { match: ["Won't start", 'Engine stalls'], issue: 'Carburetor or fuel line blockage', estTime: '15–25 mins' },
    { match: ['Blades not turning', 'Vibration / shaking'], issue: 'Belt or drive shaft damage', estTime: '20–30 mins' },
    { match: ["Won't start"], issue: 'Spark plug, fuel, or battery issue', estTime: '10–20 mins' },
    { match: ['Blades not turning'], issue: 'Belt slip or blade obstruction', estTime: '15–25 mins' },
    { match: ['Vibration / shaking'], issue: 'Loose mount or unbalanced blades', estTime: '10–20 mins' },
  ],
  Harvester: [
    { match: ['Cutting bar jammed', 'Conveyor not moving'], issue: 'Drive belt or chain failure', estTime: '25–40 mins' },
    { match: ['Grain loss / spillage', 'Conveyor not moving'], issue: 'Conveyor belt slip or auger blockage', estTime: '20–35 mins' },
    { match: ["Won't start", 'Overheating'], issue: 'Cooling system or engine fault', estTime: '25–40 mins' },
    { match: ['Cutting bar jammed'], issue: 'Blade or guard obstruction', estTime: '15–25 mins' },
    { match: ['Grain loss / spillage'], issue: 'Sieve or settings adjustment', estTime: '15–25 mins' },
    { match: ['Conveyor not moving'], issue: 'Belt tension or motor issue', estTime: '20–30 mins' },
  ],
  Pump: [
    { match: ['Not drawing water', 'Motor not starting'], issue: 'Motor or impeller failure', estTime: '20–35 mins' },
    { match: ['Not drawing water', 'Leaking'], issue: 'Suction line crack or seal failure', estTime: '15–25 mins' },
    { match: ['Overheating', 'Motor not starting'], issue: 'Motor winding or capacitor failure', estTime: '25–40 mins' },
    { match: ['Not drawing water'], issue: 'Priming issue or blocked intake', estTime: '15–25 mins' },
    { match: ['Leaking'], issue: 'Seal or pipe fitting replacement', estTime: '10–20 mins' },
    { match: ['Overheating'], issue: 'Bearing wear or low flow', estTime: '15–25 mins' },
  ],
  Planter: [
    { match: ['Seed not dropping', 'Hopper jammed'], issue: 'Seed meter or hopper obstruction', estTime: '15–25 mins' },
    { match: ['Uneven spacing', 'Depth control issue'], issue: 'Drive chain or depth gauge misadjustment', estTime: '20–30 mins' },
    { match: ['Seed not dropping'], issue: 'Seed tube or meter blockage', estTime: '10–20 mins' },
    { match: ['Uneven spacing'], issue: 'Meter calibration or sprocket wear', estTime: '15–25 mins' },
    { match: ['Hopper jammed'], issue: 'Agitator or cleanout needed', estTime: '10–15 mins' },
  ],
  Weeder: [
    { match: ["Won't start", 'Engine stalls'], issue: 'Fuel system or carburetor fault', estTime: '15–25 mins' },
    { match: ['Tines not rotating', 'Uneven cutting'], issue: 'Belt slip or tine damage', estTime: '20–30 mins' },
    { match: ["Won't start"], issue: 'Spark plug or fuel supply issue', estTime: '10–20 mins' },
    { match: ['Tines not rotating'], issue: 'Drive belt or gearbox issue', estTime: '15–25 mins' },
    { match: ['Uneven cutting'], issue: 'Tine wear or height adjustment', estTime: '10–20 mins' },
  ],
  Other: [
    { match: ["Won't start", 'Overheating'], issue: 'Engine or motor fault', estTime: '20–35 mins' },
    { match: ["Won't start"], issue: 'Power or fuel supply issue', estTime: '10–20 mins' },
    { match: ['Unusual noise'], issue: 'Mechanical wear or loose component', estTime: '15–30 mins' },
    { match: ['Leaking'], issue: 'Seal or gasket replacement', estTime: '10–20 mins' },
    { match: ['Overheating'], issue: 'Cooling or ventilation issue', estTime: '15–25 mins' },
  ],
};

export function getLikelyIssue(equipmentType: string, symptoms: string[]): string | null {
  if (!symptoms.length || symptoms.length === 0) return null;
  const rules = ISSUE_RULES[equipmentType] || ISSUE_RULES['Other'];

  for (const rule of rules) {
    if (rule.match.every((s) => symptoms.includes(s))) {
      return `Likely Issue: ${rule.issue}. Estimated diagnosis time: ${rule.estTime}.`;
    }
  }

  return `Likely Issue: General inspection recommended based on reported symptoms (${symptoms.join(', ')}). Estimated diagnosis time: 15–30 mins.`;
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

export function getCostEstimate(equipmentType: string, symptoms: string[]): string | null {
  if (!symptoms.length || symptoms.length === 0) return null;

  const base = BASE_COST_BY_EQUIPMENT[equipmentType] || BASE_COST_BY_EQUIPMENT['Other'];
  let low = base.low;
  let high = base.high;

  const complexCount = symptoms.filter((s) => COMPLEX_SYMPOMS.has(s)).length;
  const symptomBonus = Math.max(0, symptoms.length - 1);

  low += complexCount * 100 + symptomBonus * 50;
  high += complexCount * 200 + symptomBonus * 100;

  return `Estimated diagnostic + labor cost: \u20B9${low}-\u20B9${high} (excluding spare parts).`;
}
