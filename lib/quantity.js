const WEIGHT_PATTERN = /^([0-9]+(?:\.[0-9]+)?)\s*(kg|g)$/i;

export function parseQuantityToKg(quantityStr) {
  if (!quantityStr || typeof quantityStr !== "string") return null;

  const trimmed = quantityStr.trim();
  const match = trimmed.match(WEIGHT_PATTERN);

  if (!match) return null;

  const value = parseFloat(match[1]);

  if (!Number.isFinite(value) || value < 0) return null;

  const unit = match[2].toLowerCase();

  return unit === "kg" ? value : value / 1000;
}

export function formatKg(kg) {
  if (kg == null || !Number.isFinite(kg)) return "";

  if (kg < 1) {
    return `${Math.round(kg * 1000)}g`;
  }

  return `${kg.toFixed(1)}kg`;
}

export function computeConsumedKg(originalKg, remainingKg) {
  if (!Number.isFinite(originalKg) || originalKg < 0) {
    return {
      consumedKg: null,
      error: "Invalid original weight.",
    };
  }

  if (!Number.isFinite(remainingKg) || remainingKg < 0) {
    return {
      consumedKg: null,
      error: "Remaining weight can't be negative.",
    };
  }

  if (remainingKg > originalKg) {
    return {
      consumedKg: null,
      error: "Remaining weight can't be more than the original weight.",
    };
  }

  return {
    consumedKg: originalKg - remainingKg,
    error: null,
  };
}

export function parseEstimateKg(estimateStr) {
  if (!estimateStr || typeof estimateStr !== "string") return null;

  const trimmed = estimateStr.trim();

  const explicitWeight = parseQuantityToKg(trimmed);
  if (explicitWeight !== null) return explicitWeight;

  if (!/^([0-9]+(?:\.[0-9]+)?)$/.test(trimmed)) return null;

  const value = Number(trimmed);

  if (!Number.isFinite(value) || value < 0) return null;

  return value;
}