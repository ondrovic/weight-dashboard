export const extractNumber = (value: string | undefined): number => {
  if (!value || value === '--') return 0;
  const numeric = value.replace(/[^0-9.]/g, '');
  const result = parseFloat(numeric);
  return isNaN(result) ? 0 : result;
};

export const formatNumber = (value: number, decimals = 2): string =>
  value.toFixed(decimals);

export const calculatePercentage = (part: number, whole: number): number =>
  whole === 0 ? 0 : (part / whole) * 100;