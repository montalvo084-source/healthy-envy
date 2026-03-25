export interface ProteinSource {
  key: string;
  label: string;
  protein: number; // grams per unit
  unit: string;
  emoji: string;
  active: boolean;
}

export const PROTEIN_SOURCES: ProteinSource[] = [
  {
    key: "eggs",
    label: "Hard-Boiled Eggs",
    protein: 6,
    unit: "eggs",
    emoji: "🥚",
    active: true,
  },
  {
    key: "chicken",
    label: "Chicken Breast (oz)",
    protein: 8.5,
    unit: "oz",
    emoji: "🍗",
    active: true,
  },
  {
    key: "proteinShake",
    label: "Protein Shake",
    protein: 25,
    unit: "shakes",
    emoji: "🥤",
    active: true,
  },
  {
    key: "greekYogurt",
    label: "Greek Yogurt (cup)",
    protein: 17,
    unit: "cups",
    emoji: "🥛",
    active: true,
  },
  {
    key: "tuna",
    label: "Tuna Can",
    protein: 20,
    unit: "cans",
    emoji: "🐟",
    active: true,
  },
  {
    key: "beans",
    label: "Beans (cup)",
    protein: 15,
    unit: "cups",
    emoji: "🫘",
    active: true,
  },
];

export function getActiveProteinSources(): ProteinSource[] {
  return PROTEIN_SOURCES.filter((s) => s.active);
}

export function getProteinSource(key: string): ProteinSource | undefined {
  return PROTEIN_SOURCES.find((s) => s.key === key);
}
