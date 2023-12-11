/**
 * Fixes an issue with sqlite3 dates not being parsed correctly
 */
export class DateTransformer {
  to(value: Date | string) {
    return fixDate(value);
  }
  from(value: string | Date) {
    return fixDate(value);
  }
}

function fixDate(date: Date | string): Date {
  if (typeof date === "string") {
    return new Date(date);
  }
  return date;
}
