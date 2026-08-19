type Locale = 'en' | 'nl';

const MONTH_NAMES: Record<Locale, readonly string[]> = {
  en: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  nl: [
    'jan',
    'feb',
    'mrt',
    'apr',
    'mei',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec',
  ],
};

const PRESENT: Record<Locale, string> = { en: 'Present', nl: 'Heden' };

const DURATION_TERMS: Record<
  Locale,
  { year: string; years: string; month: string; months: string; zero: string }
> = {
  en: {
    year: 'year',
    years: 'years',
    month: 'month',
    months: 'months',
    zero: '0 months',
  },
  nl: {
    year: 'jaar',
    years: 'jaar',
    month: 'maand',
    months: 'maanden',
    zero: '0 maanden',
  },
};

function parseDate(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  return { year, month };
}

export function formatSingleDate(
  dateStr: string,
  locale: Locale = 'en',
): string {
  const { year, month } = parseDate(dateStr);
  const monthName = MONTH_NAMES[locale][month - 1];
  return `${monthName ?? 'Unknown'} ${year}`;
}

export function formatDateRange(
  startDate: string,
  endDate: string | null | undefined,
  locale: Locale = 'en',
): string {
  const start = formatSingleDate(startDate, locale);

  if (!endDate) {
    return `${start} - ${PRESENT[locale]}`;
  }

  const end = formatSingleDate(endDate, locale);

  if (start === end) {
    return start;
  }

  return `${start} - ${end}`;
}

export function getTotalMonths(
  startDate: string,
  endDate: string | null | undefined,
): number {
  const start = parseDate(startDate);
  const end = endDate
    ? parseDate(endDate)
    : {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      };

  const total = (end.year - start.year) * 12 + (end.month - start.month);
  return Math.max(total, 1);
}

export function calculateDuration(
  startDate: string,
  endDate: string | null | undefined,
  locale: Locale = 'en',
): string {
  const start = parseDate(startDate);
  const end = endDate
    ? parseDate(endDate)
    : {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      };

  const rawMonths = (end.year - start.year) * 12 + (end.month - start.month);
  const totalMonths = Math.max(rawMonths, 0);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const terms = DURATION_TERMS[locale];

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? terms.year : terms.years}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? terms.month : terms.months}`);
  }

  return parts.length > 0 ? parts.join(' ') : terms.zero;
}
