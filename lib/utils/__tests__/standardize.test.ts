// lib/utils/__tests__/standardize.test.ts

import {
  normalizeDate,
  formatNumber,
  formatCurrency,
  formatMarketCap,
  formatPercentage,
  formatRatio,
} from '../standardize';

describe('normalizeDate', () => {
  it('should format date string to ISO format', () => {
    expect(normalizeDate('2024-01-01')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should handle Date object', () => {
    const date = new Date('2024-01-01');
    expect(normalizeDate(date)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should return empty string for invalid input', () => {
    expect(normalizeDate('')).toBe('');
    expect(normalizeDate('invalid-date')).toBe('');
  });
});

describe('formatNumber', () => {
  it('should format numbers with default options', () => {
    expect(formatNumber(1234.5678)).toBe('1,234.57');
  });

  it('should format numbers in compact notation', () => {
    expect(formatNumber(1234567, { format: 'compact' })).toBe('1.23M');
  });

  it('should format percentages', () => {
    expect(formatNumber(0.1234, { format: 'percentage' })).toBe('12.34%');
  });

  it('should handle invalid inputs', () => {
    expect(formatNumber(NaN)).toBe('N/A');
    expect(formatNumber(null as unknown as number)).toBe('N/A');
    expect(formatNumber(undefined as unknown as number)).toBe('N/A');
  });
});

describe('formatCurrency', () => {
  it('should format currency with default USD', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format currency with specified currency', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('should handle invalid inputs', () => {
    expect(formatCurrency(NaN)).toBe('N/A');
    expect(formatCurrency(null as unknown as number)).toBe('N/A');
  });
});

describe('formatMarketCap', () => {
  it('should format market cap in billions', () => {
    expect(formatMarketCap(1234567890)).toBe('1.23B');
  });

  it('should format market cap in millions', () => {
    expect(formatMarketCap(1234567)).toBe('1.23M');
  });

  it('should handle invalid inputs', () => {
    expect(formatMarketCap(0)).toBe('N/A');
    expect(formatMarketCap(null as unknown as number)).toBe('N/A');
  });
});

describe('formatPercentage', () => {
  it('should format decimal as percentage', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%');
  });

  it('should handle custom decimal places', () => {
    expect(formatPercentage(0.1234, 1)).toBe('12.3%');
  });

  it('should handle invalid inputs', () => {
    expect(formatPercentage(NaN)).toBe('N/A');
    expect(formatPercentage(null as unknown as number)).toBe('N/A');
  });
});

describe('formatRatio', () => {
  it('should format ratio with default decimal places', () => {
    expect(formatRatio(12.3456)).toBe('12.35');
  });

  it('should format ratio with custom decimal places', () => {
    expect(formatRatio(12.3456, 3)).toBe('12.346');
  });

  it('should handle invalid inputs', () => {
    expect(formatRatio(NaN)).toBe('N/A');
    expect(formatRatio(null as unknown as number)).toBe('N/A');
  });
}); 