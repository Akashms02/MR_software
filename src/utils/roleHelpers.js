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
 * Helper to identify if a given user role is a managerial supervisor role.
 * Consolidates all standard and custom manager roles (e.g., ABM, RBM, ZBM, Area Manager, VP, etc.).
 */
export const isManagerRole = (role) => {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
  
  const managerRoles = [
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
    'vp'
  ];
  
  return managerRoles.includes(normalized);
};

/**
 * Returns a user-friendly, capitalized label for the role.
 */
export const getDisplayRole = (role) => {
  if (!role) return 'Employee';
  
  if (isFieldSalesRole(role)) {
    return 'Medical Representative';
  }
  
  const normalized = role.toUpperCase().trim();
  
  // Managers
  if (normalized === 'ABM') return 'Area Business Manager (ABM)';
  if (normalized === 'RBM') return 'Regional Business Manager (RBM)';
  if (normalized === 'ZBM') return 'Zonal Business Manager (ZBM)';
  if (normalized === 'ASM') return 'Area Sales Manager (ASM)';
  if (normalized === 'RSM') return 'Regional Sales Manager (RSM)';
  if (normalized === 'ZSM') return 'Zonal Sales Manager (ZSM)';
  if (normalized === 'VP') return 'Vice President (VP)';
  
  return role
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};
