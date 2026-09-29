const IRRIGATION_TERMS = ['irrigation', 'water', 'pressure', 'flow', 'leak', 'nozzle', 'spray'];
const PRECISION_TERMS = ['drone', 'precision', 'gps', 'mapping', 'autonomous', 'sensor'];
const POWER_TERMS = ['generator', 'power', 'electrical', 'electric', 'battery', 'voltage', 'outlet'];

export function getMatchingSpecialization(
  equipmentType: string,
  symptoms: string[],
  problemDescription: string,
): string | null {
  const equipment = equipmentType.toLowerCase();
  const issueText = [...symptoms, problemDescription].join(' ').toLowerCase();

  if (equipment.includes('tractor') || equipment.includes('harvester')) {
    return 'Tractors & Harvesters';
  }

  if ((equipment.includes('pump') || equipment.includes('sprayer')) &&
      IRRIGATION_TERMS.some((term) => issueText.includes(term))) {
    return 'Irrigation Systems';
  }

  if (PRECISION_TERMS.some((term) => equipment.includes(term) || issueText.includes(term))) {
    return 'Drones & Precision Ag Tech';
  }

  if (POWER_TERMS.some((term) => equipment.includes(term) || issueText.includes(term))) {
    return 'Generators & Power Equipment';
  }

  return null;
}

export function requestMatchesTechnician(
  technicianSpecialization: string,
  matchedSpecialization: string | null,
): boolean {
  return matchedSpecialization === null || technicianSpecialization === matchedSpecialization;
}
