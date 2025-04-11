/**
 * Format a number to a human-readable string with appropriate unit suffix (k, M, B, T)
 * @param value - The number to format
 * @param decimalPlaces - Number of decimal places to show (default: 1)
 * @returns Formatted string with appropriate unit (e.g., 1000 -> "1k")
 */
export function formatNumberWithUnit(value: number, decimalPlaces: number = 1): string {
  const units = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
  ];
  
  // Regular expression to trim trailing zeros after decimal point
  const trimDecimalRegex = /\.0+$|(\.[0-9]*[1-9])0+$/;
  
  // Find the appropriate unit by checking from largest to smallest
  const unit = units
    .slice()
    .reverse()
    .find((unit) => value >= unit.value);
  
  if (!unit) {
    return '0';
  }
  
  // Format the number with the unit
  // If the unit has a symbol (k, M, etc.), use the specified decimal places
  // Otherwise (for values < 1000), don't show decimal places
  const formattedNumber = (value / unit.value)
    .toFixed(unit.symbol ? decimalPlaces : 0)
    .replace(trimDecimalRegex, '$1');
  
  return `${formattedNumber}${unit.symbol}`;
} 