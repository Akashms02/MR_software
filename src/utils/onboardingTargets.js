/** Map approved onboarding request → visit picker target (Postman: location check-in targetId) */
export const mapOnboardingToVisitTarget = (req) => {
  if (!req) return null;
  const type = String(req.type || 'DOCTOR').toUpperCase();
  const isChemist = type === 'CHEMIST';
  return {
    id: req.doctorId ?? req.chemistId ?? req.targetId ?? req.id,
    requestId: req.id,
    apiType: isChemist ? 'CHEMIST' : 'DOCTOR',
    name: req.name || 'Unknown',
    type: isChemist ? 'Pharmacy' : 'Doctor',
    specialty:
      req.doctorSpeciality ||
      req.doctorSpecialty ||
      req.chemistContactPerson ||
      (isChemist ? 'Chemist' : 'Doctor'),
    clinic: [req.address, req.city, req.state].filter(Boolean).join(', ') || req.city || '',
    latitude: req.latitude,
    longitude: req.longitude,
  };
};

export const getApprovedVisitTargets = (requests) => {
  if (!Array.isArray(requests)) return [];
  return requests
    .filter((r) => String(r.status || '').toUpperCase() === 'APPROVED')
    .map(mapOnboardingToVisitTarget)
    .filter(Boolean);
};
