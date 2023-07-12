export function dateToIso8601(date: Date | string | null | undefined): string {
  if (date === null || date === undefined) {
    return null;
  }
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

export function iso8601ToDate(iso8601: string | null | undefined): Date {
  if (iso8601 === null || iso8601 === undefined) {
    return null;
  }
  return new Date(iso8601);
}

export function bigintToNumber(value: bigint): number {
  return Number(value);
}

export function numberToBigint(value: number): bigint {
  return BigInt(value);
}

export function parseNumber(
  value: string | undefined | null,
): number | undefined {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

export function inc<T extends string>(value: T, ...array: T[]): boolean {
  return array.includes(value);
}

export type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Array<infer U>
    ? Array<Serialized<U>>
    : T[K] extends object
    ? Serialized<T[K]>
    : T[K] extends T | null | undefined
    ? Serialized<T>
    : T[K];
};

export function serialize<T extends object>(obj: T): Serialized<T> {
  const newObj: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Date) {
      newObj[key] = dateToIso8601(value);
    } else if (Array.isArray(value)) {
      newObj[key] = value.map((v) => serialize(v));
    } else if (typeof value === 'object' && value !== null) {
      newObj[key] = serialize(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

/** 종이재고 */
export const serialP = (invoiceCode: string) =>
  `P${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 송장 */
export const serialI = (invoiceCode: string) =>
  `I${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 거래 */
export const serialT = (invoiceCode: string) =>
  `T${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 내부작업 */
export const serialW = (invoiceCode: string) =>
  `W${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

export const searchKeywordsToIntArray = (keywords: string): number[] => {
  if (!keywords) return [];
  return keywords.split('|').map((keyword) => parseInt(keyword, 10));
};

export const searchKeywordsToStringArray = (keywords: string): string[] => {
  if (!keywords) return [];
  return keywords.split('|').map((keyword) => keyword);
};

export const isSameMonth = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
};

export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
