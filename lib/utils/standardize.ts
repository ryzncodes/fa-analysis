/**
 * Utility functions for standardizing data formats across the application
 */

/**
 * Converts any date input into a consistent ISO 8601 format
 * @param input - Date string or Date object
 * @returns Formatted date string in ISO 8601 format
 */
export function normalizeDate(input: string | Date): string {
  if (!input) return '';
  
  try {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toISOString();
  } catch (error) {
    console.error('Error normalizing date:', error);
    return '';
  }
}

/**
 * Formats numbers to include thousand separators or converts to a readable scale
 * @param input - Number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  input: number,
  options: { format?: 'compact' | 'fixed' | 'percentage'; decimals?: number } = {}
): string {
  if (input === undefined || input === null || isNaN(input)) return 'N/A';

  const { format = 'fixed', decimals = 2 } = options;

  try {
    switch (format) {
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: decimals,
        }).format(input);

      case 'percentage':
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(input);

      case 'fixed':
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(input);
    }
  } catch (error) {
    console.error('Error formatting number:', error);
    return 'N/A';
  }
}

/**
 * Formats currency values
 * @param input - Number to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  input: number,
  currency: string = 'USD'
): string {
  if (input === undefined || input === null || isNaN(input)) return 'N/A';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(input);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return 'N/A';
  }
}

/**
 * Formats market cap values to a readable format
 * @param marketCap - Market cap value
 * @returns Formatted market cap string
 */
export function formatMarketCap(marketCap: number): string {
  if (!marketCap) return 'N/A';
  
  return formatNumber(marketCap, { format: 'compact' });
}

/**
 * Formats percentage values
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return formatNumber(value, { format: 'percentage', decimals });
}

/**
 * Validates and formats financial ratios
 * @param ratio - Ratio value
 * @param decimals - Number of decimal places
 * @returns Formatted ratio string
 */
export function formatRatio(ratio: number, decimals: number = 2): string {
  if (ratio === undefined || ratio === null || isNaN(ratio)) return 'N/A';
  return formatNumber(ratio, { format: 'fixed', decimals });
} 