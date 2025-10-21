export const PROJECT_STATUS_OPTIONS = [
  'Active',
  'In Progress',
  'Completed',
  'Paused',
  'Discontinued'
];

export const PROJECT_CATEGORY_OPTIONS = [
  'Software',
  'Hardware',
  'Research',
  'Creative',
  'Community',
  'Other'
];

// Route must start with a forward slash and may include alphanumeric characters,
// forward slashes, underscores, or hyphens.
export const PROJECT_ROUTE_PATTERN = /^\/[A-Za-z0-9/_-]+$/;

export const DEFAULT_PROJECT_CATEGORY = PROJECT_CATEGORY_OPTIONS[0];
export const DEFAULT_PROJECT_STATUS = PROJECT_STATUS_OPTIONS[0];
