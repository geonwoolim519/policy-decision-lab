export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function sumValues(values: Record<string, number>) {
  return Object.values(values).reduce((total, value) => total + value, 0);
}

export function intensity(allocated: number, baseCost: number) {
  if (allocated <= 0 || baseCost <= 0) return 0;
  const ratio = allocated / baseCost;
  if (ratio <= 1) return ratio;
  return 1 + Math.log2(ratio) * 0.35;
}
