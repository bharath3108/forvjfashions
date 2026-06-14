export const isPlaceholder = (value) =>
  !value ||
  value.includes('your_') ||
  value.includes('your-') ||
  value.includes('example.com') ||
  value.includes('XXXXXXXXXX');
