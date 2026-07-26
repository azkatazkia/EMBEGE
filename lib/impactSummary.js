function sumBy(rows, key) {
  return (rows ?? []).reduce((total, row) => {
    const value = Number(row?.[key]);

    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

function round1(number) {
  return Math.round(number * 10) / 10;
}

function round2(number) {
  return Math.round(number * 100) / 100;
}

export function summarizeImpact(consumptionLogs, wasteLogs) {
  const savedKg = round2(
    sumBy(consumptionLogs, "quantity_consumed_kg")
  );

  const savedCo2Kg = round2(
    sumBy(consumptionLogs, "co2_kg")
  );

  const savedValueSgd = round2(
    sumBy(consumptionLogs, "value_sgd")
  );

  const wastedKg = round2(
    sumBy(wasteLogs, "quantity_wasted_kg")
  );

  const wastedCo2Kg = round2(
    sumBy(wasteLogs, "co2_kg")
  );

  const wastedValueSgd = round2(
    sumBy(wasteLogs, "value_sgd")
  );

  const totalKg = round2(savedKg + wastedKg);
  const hasData = totalKg > 0;

  const savedPercent = hasData
    ? round1((savedKg / totalKg) * 100)
    : null;

  const wastedPercent = hasData
    ? round1((wastedKg / totalKg) * 100)
    : null;

  return {
    savedKg,
    savedCo2Kg,
    savedValueSgd,
    wastedKg,
    wastedCo2Kg,
    wastedValueSgd,
    totalKg,
    savedPercent,
    wastedPercent,
    hasData,
  };
}

export function formatSgd(value) {
  if (!Number.isFinite(value)) return "S$0";

  return Number.isInteger(value)
    ? `S$${value}`
    : `S$${value.toFixed(2)}`;
}

export function formatCo2Kg(value) {
  if (!Number.isFinite(value)) return "0 kg CO₂e";

  return `${value.toFixed(1)} kg CO₂e`;
}