export interface Industry {
  id: string;
  label: string;
  selectors: string[];
}

export const INDUSTRIES: Industry[] = [
  { id: "hvac-plumbing", label: "HVAC & plumbing", selectors: ['["craft"~"^(hvac|plumber)$"]'] },
  { id: "electrical", label: "Electrical contractors", selectors: ['["craft"="electrician"]'] },
  { id: "construction", label: "Roofing & construction", selectors: ['["craft"~"^(roofer|builder|carpenter)$"]'] },
  { id: "manufacturing", label: "Machine shops & fabrication", selectors: ['["craft"~"^(metal_construction|machinist|welder)$"]'] },
  { id: "auto-repair", label: "Auto repair", selectors: ['["shop"~"^(car_repair|tyres)$"]'] },
  { id: "landscaping", label: "Landscaping", selectors: ['["craft"~"^(gardener|landscaper)$"]', '["shop"="garden_centre"]'] },
  { id: "professional", label: "Accounting & insurance", selectors: ['["office"~"^(accountant|tax_advisor|insurance)$"]'] },
  { id: "healthcare", label: "Dental & veterinary clinics", selectors: ['["amenity"~"^(dentist|veterinary)$"]'] },
  { id: "printing", label: "Printing & signage", selectors: ['["craft"~"^(printer|signmaker)$"]', '["shop"="copyshop"]'] },
  { id: "food", label: "Bakeries & specialty food", selectors: ['["shop"~"^(bakery|butcher|deli)$"]'] },
];

export const INDUSTRY_IDS = INDUSTRIES.map((industry) => industry.id) as [string, ...string[]];

export function findIndustry(id: string): Industry {
  return INDUSTRIES.find((industry) => industry.id === id) ?? INDUSTRIES[0];
}
