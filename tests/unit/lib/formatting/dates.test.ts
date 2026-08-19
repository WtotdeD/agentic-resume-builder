import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  formatSingleDate,
  formatDateRange,
  calculateDuration,
} from '@/lib/formatting/dates';

describe('formatDateRange', () => {
  describe('when formatting date ranges with start and end dates', () => {
    it('formats date range as "Mon YYYY - Mon YYYY"', () => {
      const result = formatDateRange('2020-01', '2021-12');
      expect(result).toBe('Jan 2020 - Dec 2021');
    });

    it('formats date range with different months in same year', () => {
      const result = formatDateRange('2023-03', '2023-11');
      expect(result).toBe('Mar 2023 - Nov 2023');
    });

    it('formats all months correctly', () => {
      const monthTests = [
        { date: '2024-01', expected: 'Jan' },
        { date: '2024-02', expected: 'Feb' },
        { date: '2024-03', expected: 'Mar' },
        { date: '2024-04', expected: 'Apr' },
        { date: '2024-05', expected: 'May' },
        { date: '2024-06', expected: 'Jun' },
        { date: '2024-07', expected: 'Jul' },
        { date: '2024-08', expected: 'Aug' },
        { date: '2024-09', expected: 'Sep' },
        { date: '2024-10', expected: 'Oct' },
        { date: '2024-11', expected: 'Nov' },
        { date: '2024-12', expected: 'Dec' },
      ];

      monthTests.forEach(({ date, expected }) => {
        const result = formatDateRange(date, date);
        expect(result).toBe(`${expected} 2024`);
      });
    });
  });

  describe('when formatting date ranges with null or undefined end date', () => {
    it('formats range with null endDate as "Mon YYYY - Present"', () => {
      const result = formatDateRange('2020-01', null);
      expect(result).toBe('Jan 2020 - Present');
    });

    it('formats range with undefined endDate as "Mon YYYY - Present"', () => {
      const result = formatDateRange('2020-01', undefined);
      expect(result).toBe('Jan 2020 - Present');
    });
  });

  describe('when start and end dates are the same', () => {
    it('returns single date instead of range', () => {
      const result = formatDateRange('2023-06', '2023-06');
      expect(result).toBe('Jun 2023');
    });
  });
});

describe('calculateDuration', () => {
  describe('when calculating duration between two dates', () => {
    it('calculates duration in years and months', () => {
      const result = calculateDuration('2020-01', '2022-04');
      expect(result).toBe('2 years 3 months');
    });

    it('calculates duration with exactly 1 year', () => {
      const result = calculateDuration('2020-01', '2021-01');
      expect(result).toBe('1 year');
    });

    it('calculates duration with exactly 1 month', () => {
      const result = calculateDuration('2023-05', '2023-06');
      expect(result).toBe('1 month');
    });

    it('calculates duration with only months (less than 1 year)', () => {
      const result = calculateDuration('2023-01', '2023-07');
      expect(result).toBe('6 months');
    });

    it('calculates duration with only years (no remaining months)', () => {
      const result = calculateDuration('2018-03', '2023-03');
      expect(result).toBe('5 years');
    });

    it('calculates duration spanning multiple years', () => {
      const result = calculateDuration('2015-06', '2020-09');
      expect(result).toBe('5 years 3 months');
    });

    it('calculates duration with 11 months', () => {
      const result = calculateDuration('2023-01', '2023-12');
      expect(result).toBe('11 months');
    });
  });

  describe('when end date is null or undefined', () => {
    let originalDate: typeof Date;

    beforeEach(() => {
      originalDate = global.Date;
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      global.Date = originalDate;
    });

    it('uses current date when endDate is null', () => {
      vi.setSystemTime(new Date('2024-06-15'));
      const result = calculateDuration('2020-01', null);
      expect(result).toBe('4 years 5 months');
    });

    it('uses current date when endDate is undefined', () => {
      vi.setSystemTime(new Date('2024-06-15'));
      const result = calculateDuration('2020-01', undefined);
      expect(result).toBe('4 years 5 months');
    });

    it('calculates correctly with current date at year boundary', () => {
      vi.setSystemTime(new Date('2025-01-01'));
      const result = calculateDuration('2020-01', null);
      expect(result).toBe('5 years');
    });
  });

  describe('when handling edge cases', () => {
    it('returns "0 months" when start equals end', () => {
      const result = calculateDuration('2023-06', '2023-06');
      expect(result).toBe('0 months');
    });

    it('returns "0 months" when end date is before start date', () => {
      const result = calculateDuration('2023-12', '2023-01');
      expect(result).toBe('0 months');
    });

    it('handles year transitions correctly', () => {
      const result = calculateDuration('2023-11', '2024-02');
      expect(result).toBe('3 months');
    });

    it('handles leap year February correctly', () => {
      const result = calculateDuration('2020-02', '2020-03');
      expect(result).toBe('1 month');
    });
  });
});

describe('formatSingleDate with Dutch locale', () => {
  it('formats all 12 Dutch month names correctly', () => {
    const monthTests = [
      { date: '2024-01', expected: 'jan' },
      { date: '2024-02', expected: 'feb' },
      { date: '2024-03', expected: 'mrt' },
      { date: '2024-04', expected: 'apr' },
      { date: '2024-05', expected: 'mei' },
      { date: '2024-06', expected: 'jun' },
      { date: '2024-07', expected: 'jul' },
      { date: '2024-08', expected: 'aug' },
      { date: '2024-09', expected: 'sep' },
      { date: '2024-10', expected: 'okt' },
      { date: '2024-11', expected: 'nov' },
      { date: '2024-12', expected: 'dec' },
    ];

    monthTests.forEach(({ date, expected }) => {
      expect(formatSingleDate(date, 'nl')).toBe(`${expected} 2024`);
    });
  });
});

describe('formatDateRange with Dutch locale', () => {
  it('formats date range with Dutch month names', () => {
    const result = formatDateRange('2024-01', '2024-06', 'nl');
    expect(result).toBe('jan 2024 - jun 2024');
  });

  it('uses "Heden" for null end date', () => {
    const result = formatDateRange('2024-01', null, 'nl');
    expect(result).toBe('jan 2024 - Heden');
  });

  it('returns single date when start equals end', () => {
    const result = formatDateRange('2024-03', '2024-03', 'nl');
    expect(result).toBe('mrt 2024');
  });
});

describe('calculateDuration with Dutch locale', () => {
  it('uses "jaar" and "maanden" for years and months', () => {
    const result = calculateDuration('2020-01', '2022-04', 'nl');
    expect(result).toBe('2 jaar 3 maanden');
  });

  it('uses singular "jaar" for exactly 1 year', () => {
    const result = calculateDuration('2020-01', '2021-01', 'nl');
    expect(result).toBe('1 jaar');
  });

  it('uses singular "maand" for exactly 1 month', () => {
    const result = calculateDuration('2023-05', '2023-06', 'nl');
    expect(result).toBe('1 maand');
  });

  it('returns "0 maanden" for zero duration', () => {
    const result = calculateDuration('2023-06', '2023-06', 'nl');
    expect(result).toBe('0 maanden');
  });
});
