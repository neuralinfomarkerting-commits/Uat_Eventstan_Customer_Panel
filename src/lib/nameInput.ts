// Name fields: letters (any language), spaces, apostrophes, hyphens and dots only.
// Digits and other symbols are stripped as the user types.
export const NAME_MAX_LENGTH = 50;

export const sanitizeName = (value: string): string =>
  value
    .replace(/[^\p{L}\p{M}\s'’.-]/gu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "")
    .slice(0, NAME_MAX_LENGTH);

// Valid = at least 2 letters and nothing but allowed characters.
export const isValidName = (value: string): boolean => {
  const v = value.trim();
  return (
    v.length >= 2 &&
    v.length <= NAME_MAX_LENGTH &&
    /^[\p{L}\p{M}\s'’.-]+$/u.test(v) &&
    (v.match(/\p{L}/gu)?.length ?? 0) >= 2
  );
};

export const NAME_ERROR = "Name can contain letters only (no numbers or symbols).";
