export type Batch = {
  batchId: string;
  productsInspected: number;
  defectiveProducts: number;
  defectRate: number;
};

export const batches: Batch[] = [
  { batchId: "B-2401", productsInspected: 842, defectiveProducts: 11, defectRate: 11 / 842 },
  { batchId: "B-2402", productsInspected: 916, defectiveProducts: 8, defectRate: 8 / 916 },
  { batchId: "B-2403", productsInspected: 788, defectiveProducts: 15, defectRate: 15 / 788 },
  { batchId: "B-2404", productsInspected: 1050, defectiveProducts: 17, defectRate: 17 / 1050 },
  { batchId: "B-2405", productsInspected: 968, defectiveProducts: 6, defectRate: 6 / 968 },
  { batchId: "B-2406", productsInspected: 724, defectiveProducts: 13, defectRate: 13 / 724 },
  { batchId: "B-2407", productsInspected: 1124, defectiveProducts: 21, defectRate: 21 / 1124 },
  { batchId: "B-2408", productsInspected: 890, defectiveProducts: 10, defectRate: 10 / 890 },
  { batchId: "B-2409", productsInspected: 1016, defectiveProducts: 19, defectRate: 19 / 1016 },
  { batchId: "B-2410", productsInspected: 678, defectiveProducts: 5, defectRate: 5 / 678 },
  { batchId: "B-2411", productsInspected: 986, defectiveProducts: 12, defectRate: 12 / 986 },
  { batchId: "B-2412", productsInspected: 1178, defectiveProducts: 24, defectRate: 24 / 1178 },
];

export const totalInspected = batches.reduce((sum, batch) => sum + batch.productsInspected, 0);
export const totalDefective = batches.reduce((sum, batch) => sum + batch.defectiveProducts, 0);
export const overallDefectRate = totalDefective / totalInspected;
export const observedMean = batches.reduce((sum, batch) => sum + batch.defectRate, 0) / batches.length;
export const highestRateBatch = batches.reduce((top, batch) => batch.defectRate > top.defectRate ? batch : top, batches[0]);
export const lowestRateBatch = batches.reduce((low, batch) => batch.defectRate < low.defectRate ? batch : low, batches[0]);

export function formatPct(value: number, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function combinationLog(n: number, k: number) {
  if (k < 0 || k > n) return Number.NEGATIVE_INFINITY;
  const safeK = Math.min(k, n - k);
  let result = 0;
  for (let i = 1; i <= safeK; i += 1) result += Math.log(n - safeK + i) - Math.log(i);
  return result;
}

export function binomialProbability(n: number, p: number, x: number) {
  if (x < 0 || x > n || !Number.isInteger(x)) return 0;
  if (p === 0) return x === 0 ? 1 : 0;
  if (p === 1) return x === n ? 1 : 0;
  const logValue = combinationLog(n, x) + x * Math.log(p) + (n - x) * Math.log1p(-p);
  return Math.exp(logValue);
}

export function binomialCdf(n: number, p: number, x: number) {
  if (x < 0) return 0;
  if (x >= n) return 1;
  let sum = 0;
  for (let value = 0; value <= Math.floor(x); value += 1) sum += binomialProbability(n, p, value);
  return Math.min(1, sum);
}

export function binomialAtLeast(n: number, p: number, x: number) {
  if (x <= 0) return 1;
  if (x > n) return 0;
  return Math.max(0, 1 - binomialCdf(n, p, x - 1));
}

export function seededSimulation(trials: number, n: number, p: number) {
  let seed = 918273 + trials * 17 + n * 31 + Math.round(p * 100000) * 13;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const counts = Array.from({ length: n + 1 }, () => 0);
  for (let trial = 0; trial < trials; trial += 1) {
    let defects = 0;
    for (let product = 0; product < n; product += 1) if (random() < p) defects += 1;
    counts[defects] += 1;
  }
  return counts;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
