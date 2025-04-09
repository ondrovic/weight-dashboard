export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const part = dateString.split(',')[0].trim();
  const date = new Date(part);
  return isValidDate(date) ? date : null;
};

export const isValidDate = (date: Date): boolean =>
  date instanceof Date && !isNaN(date.getTime());

export const formatDateMMDDYY = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = String(date.getFullYear()).slice(2);
  return `${m}-${d}-${y}`;
};

export const formatDateMMDDYYYY = (date: Date): string => {
  const m = String(date.getMonth() + 1);
  const d = String(date.getDate());
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
};