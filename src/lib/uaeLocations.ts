// Location data for the address form.
// Right now the platform only operates in Dubai, so the "State" (Emirate)
// field is fixed to Dubai and only Dubai's areas are offered as "City".
// To support more emirates later, add them to UAE_STATES and add a matching
// key to CITIES_BY_STATE with that emirate's list of areas.

export const UAE_STATES = ["Dubai"] as const;

export type UaeState = (typeof UAE_STATES)[number];

export const DEFAULT_UAE_STATE: UaeState = "Dubai";

// Commonly used Dubai areas/communities, shown in the searchable "City" dropdown.
export const DUBAI_CITIES: string[] = [
  "Al Barsha",
  "Al Barsha Heights (Tecom)",
  "Al Furjan",
  "Al Garhoud",
  "Al Jaddaf",
  "Al Karama",
  "Al Khawaneej",
  "Al Mankhool",
  "Al Mizhar",
  "Al Nahda",
  "Al Qusais",
  "Al Quoz",
  "Al Rigga",
  "Al Safa",
  "Al Satwa",
  "Al Sufouh",
  "Al Twar",
  "Al Warqa",
  "Arabian Ranches",
  "Barsha South",
  "Bur Dubai",
  "Business Bay",
  "City Walk",
  "Deira",
  "Discovery Gardens",
  "Downtown Dubai",
  "Dubai Investment Park (DIP)",
  "Dubai Marina",
  "Dubai Silicon Oasis",
  "Dubai South",
  "Dubai Sports City",
  "Dubai Studio City",
  "Dubailand",
  "Emirates Hills",
  "Jebel Ali",
  "Jumeirah",
  "Jumeirah Beach Residence (JBR)",
  "Jumeirah Golf Estates",
  "Jumeirah Islands",
  "Jumeirah Lake Towers (JLT)",
  "Jumeirah Park",
  "Jumeirah Village Circle (JVC)",
  "Jumeirah Village Triangle (JVT)",
  "Karama",
  "Meadows",
  "Mirdif",
  "Motor City",
  "Mudon",
  "Muhaisnah",
  "Nad Al Sheba",
  "Oud Metha",
  "Palm Jumeirah",
  "Ras Al Khor",
  "Remraam",
  "Springs",
  "The Greens",
  "The Lakes",
  "The Views",
  "Town Square",
  "Umm Suqeim",
  "Warsan",
  "World Trade Centre",
];

export const CITIES_BY_STATE: Record<UaeState, string[]> = {
  Dubai: DUBAI_CITIES,
};

export function getCitiesForState(state: string): string[] {
  return CITIES_BY_STATE[state as UaeState] ?? [];
}
