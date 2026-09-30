// 24-hour HH:mm helpers shared by the booking forms (same behaviour as checkout).
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidTime = (v: string) => TIME_RE.test(v.trim());

/** Turns whatever is typed into a clamped, auto-colon'd HH:mm string. */
export function formatTimeInput(value: string): string {
  let digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 1 && Number(digits) > 2) digits = `0${digits}`;
  if (digits.length >= 2 && Number(digits.slice(0, 2)) > 23) {
    digits = `23${digits.slice(2)}`;
  }
  if (digits.length === 3 && Number(digits[2]) > 5) {
    digits = `${digits.slice(0, 2)}5`;
  }
  if (digits.length === 4 && Number(digits.slice(2)) > 59) {
    digits = `${digits.slice(0, 2)}59`;
  }
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}
