import { parsePhoneNumber } from "libphonenumber-js";

export const normalizePhoneValue = (value, defaultCountry = "MY") => {
  if (!value) return undefined;

  const trimmed = String(value).trim();
  if (!trimmed) return undefined;

  const parsed = parsePhoneNumber(trimmed, defaultCountry);
  if (parsed?.isValid()) {
    return parsed.format("E.164");
  }

  return undefined;
};
