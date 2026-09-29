import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { type Batch, initialBatches } from "@/lib/stats";

const STORAGE_KEY = "quality-lab-manufacturing-batches";

type NewBatch = {
  batchId: string;
  productsInspected: number;
  defectiveProducts: number;
};

type BatchContextValue = {
  batches: Batch[];
  addBatch: (batch: NewBatch) => { ok: boolean; message?: string };
  removeBatch: (batchId: string) => boolean;
  resetBatches: () => void;
};

const BatchContext = createContext<BatchContextValue | null>(null);

function readStoredBatches(): Batch[] {
  if (typeof window === "undefined") return initialBatches;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialBatches;
    const parsed = JSON.parse(stored) as Batch[];
    if (!Array.isArray(parsed) || parsed.length === 0) return initialBatches;
    const valid = parsed.filter((batch) =>
      typeof batch.batchId === "string" &&
      batch.batchId.trim().length > 0 &&
      Number.isInteger(batch.productsInspected) &&
      batch.productsInspected > 0 &&
      Number.isInteger(batch.defectiveProducts) &&
      batch.defectiveProducts >= 0 &&
      batch.defectiveProducts <= batch.productsInspected,
    ).map((batch) => ({
      ...batch,
      batchId: batch.batchId.trim(),
      defectRate: batch.defectiveProducts / batch.productsInspected,
    }));
    return valid.length > 0 ? valid : initialBatches;
  } catch {
    return initialBatches;
  }
}

export function BatchProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>(readStoredBatches);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  }, [batches]);

  const addBatch = (batch: NewBatch) => {
    const batchId = batch.batchId.trim();
    if (!batchId) return { ok: false, message: "Enter a batch ID." };
    if (batches.some((existing) => existing.batchId.toLowerCase() === batchId.toLowerCase())) {
      return { ok: false, message: "That batch ID already exists. Choose a different ID." };
    }
    if (!Number.isInteger(batch.productsInspected) || batch.productsInspected < 1) {
      return { ok: false, message: "Products inspected must be a whole number greater than 0." };
    }
    if (!Number.isInteger(batch.defectiveProducts) || batch.defectiveProducts < 0 || batch.defectiveProducts > batch.productsInspected) {
      return { ok: false, message: "Defective products must be between 0 and products inspected." };
    }
    setBatches((current) => [...current, {
      batchId,
      productsInspected: batch.productsInspected,
      defectiveProducts: batch.defectiveProducts,
      defectRate: batch.defectiveProducts / batch.productsInspected,
    }]);
    return { ok: true };
  };

  const removeBatch = (batchId: string) => {
    if (batches.length <= 1) return false;
    setBatches((current) => current.filter((batch) => batch.batchId !== batchId));
    return true;
  };

  return <BatchContext.Provider value={{ batches, addBatch, removeBatch, resetBatches: () => setBatches(initialBatches) }}>{children}</BatchContext.Provider>;
}

export function useBatches() {
  const context = useContext(BatchContext);
  if (!context) throw new Error("useBatches must be used inside BatchProvider");
  return context;
}