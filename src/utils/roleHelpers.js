/**
 * Helper to identify if a given user role is a field sales / representative role.
 * Consolidates all standard and custom field representative roles (e.g., MR, ME, MSE, Sales Executive, etc.).
 */
export const isFieldSalesRole = (role) => {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
  
  // Exact non-field roles to exclude
  const nonFieldRoles = [
    'super admin',
    'superadmin',
    'admin',
    'hr',
    'regional manager',
    'area manager',
    'medical manager',
    'zone manager',
    'vice president',
    'regional sales manager',
    'area sales manager',
    'zonal sales manager',
    'zonal business manager',
    'regional business manager',
    'area business manager',
    'abm',
    'rbm',
    'zbm',
    'asm',
    'rsm',
    'zsm',
    'doctor',
    'pharmacist',
    'distributor',
    'patient'
  ];
  
  return !nonFieldRoles.includes(normalized);
};

/**
 * Returns a user-friendly, capitalized label for the role.
 */
export const getDisplayRole = (role) => {
  if (!role) return 'Field Representative';
  
  const normalized = role.toUpperCase().trim();
  if (normalized === 'MR') return 'Medical Representative (MR)';
  if (normalized === 'ME') return 'Medical Executive (ME)';
  if (normalized === 'MSE') return 'Medical Sales Executive (MSE)';
  if (normalized === 'MSR') return 'Medical Sales Representative (MSR)';
  
  return role
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};
