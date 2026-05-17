export interface FiberSourceSeed {
  key: string;
  label: string;
  fiber: number;
  unit: string;
  emoji: string;
  active: boolean;
}

export const FIBER_SOURCES: FiberSourceSeed[] = [
  { key: "broccoli", label: "Broccoli", fiber: 5, unit: "cup", emoji: "🥦", active: true },
  { key: "avocado", label: "Avocado", fiber: 10, unit: "avocado", emoji: "🥑", active: true },
  { key: "black_beans", label: "Black Beans", fiber: 15, unit: "cup", emoji: "🫘", active: true },
  { key: "oats", label: "Oats", fiber: 4, unit: "cup", emoji: "🌾", active: true },
  { key: "chia_seeds", label: "Chia Seeds", fiber: 10, unit: "oz", emoji: "🌱", active: true },
  { key: "apple", label: "Apple", fiber: 4.5, unit: "apple", emoji: "🍎", active: true },
  { key: "lentils", label: "Lentils", fiber: 15, unit: "cup", emoji: "🫘", active: true },
  { key: "spinach", label: "Spinach", fiber: 4, unit: "cup", emoji: "🥬", active: true },
  { key: "sweet_potato", label: "Sweet Potato", fiber: 4, unit: "potato", emoji: "🍠", active: true },
  { key: "almonds", label: "Almonds", fiber: 3.5, unit: "oz", emoji: "🥜", active: true },
];
