// ISO-3166 alpha-2 -> international dial code. Used only as a fallback when the
// master-data API returns a country without a phoneCode (or without the "+").
export const DIAL_CODES: Record<string, string> = {
  AF: "+93", AL: "+355", DZ: "+213", AD: "+376", AO: "+244", AR: "+54", AM: "+374",
  AU: "+61", AT: "+43", AZ: "+994", BH: "+973", BD: "+880", BY: "+375", BE: "+32",
  BZ: "+501", BJ: "+229", BT: "+975", BO: "+591", BA: "+387", BW: "+267", BR: "+55",
  BN: "+673", BG: "+359", KH: "+855", CM: "+237", CA: "+1", CL: "+56", CN: "+86",
  CO: "+57", CR: "+506", HR: "+385", CU: "+53", CY: "+357", CZ: "+420", DK: "+45",
  EC: "+593", EG: "+20", SV: "+503", ER: "+291", EE: "+372", ET: "+251", FJ: "+679",
  FI: "+358", FR: "+33", GE: "+995", DE: "+49", GH: "+233", GR: "+30", GT: "+502",
  HK: "+852", HU: "+36", IS: "+354", IN: "+91", ID: "+62", IR: "+98", IQ: "+964",
  IE: "+353", IL: "+972", IT: "+39", JP: "+81", JO: "+962", KZ: "+7", KE: "+254",
  KW: "+965", KG: "+996", LA: "+856", LV: "+371", LB: "+961", LY: "+218", LT: "+370",
  LU: "+352", MO: "+853", MY: "+60", MV: "+960", MT: "+356", MU: "+230", MX: "+52",
  FM: "+691", MD: "+373", MC: "+377", MN: "+976", ME: "+382", MA: "+212", MZ: "+258",
  MM: "+95", NA: "+264", NP: "+977", NL: "+31", NZ: "+64", NI: "+505", NG: "+234",
  KP: "+850", NO: "+47", OM: "+968", PK: "+92", PS: "+970", PA: "+507", PY: "+595",
  PE: "+51", PH: "+63", PL: "+48", PT: "+351", QA: "+974", RO: "+40", RU: "+7",
  RW: "+250", SA: "+966", SN: "+221", RS: "+381", SG: "+65", SK: "+421", SI: "+386",
  SO: "+252", ZA: "+27", KR: "+82", SS: "+211", ES: "+34", LK: "+94", SD: "+249",
  SE: "+46", CH: "+41", SY: "+963", TW: "+886", TJ: "+992", TZ: "+255", TH: "+66",
  TN: "+216", TR: "+90", TM: "+993", UG: "+256", UA: "+380", AE: "+971", GB: "+44",
  US: "+1", UY: "+598", UZ: "+998", VE: "+58", VN: "+84", YE: "+967", ZM: "+260",
  ZW: "+263",
};

// Returns a clean "+NN" dial code, or "" when it can't be determined.
export function resolveDialCode(phoneCode: string | null | undefined, isoCode?: string | null): string {
  const raw = (phoneCode ?? "").trim();
  if (raw) {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits) return `+${digits}`;
  }
  return DIAL_CODES[(isoCode ?? "").trim().toUpperCase()] ?? "";
}
