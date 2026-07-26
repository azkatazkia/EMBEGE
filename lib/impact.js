const IMPACT_FACTORS = [
  { keywords: ["beef", "steak"], co2PerKg: 60, sgdPerKg: 18 },
  { keywords: ["lamb", "mutton"], co2PerKg: 24, sgdPerKg: 20 },
  { keywords: ["pork", "bacon", "ham", "sausage"], co2PerKg: 7, sgdPerKg: 12 },
  { keywords: ["chicken", "poultry", "duck", "turkey"], co2PerKg: 6, sgdPerKg: 8 },
  {
    keywords: ["fish", "salmon", "prawn", "shrimp", "seafood", "squid", "crab"],
    co2PerKg: 5,
    sgdPerKg: 15,
  },
  { keywords: ["egg"], co2PerKg: 4.5, sgdPerKg: 6 },
  { keywords: ["cheese"], co2PerKg: 21, sgdPerKg: 20 },
  {
    keywords: ["milk", "yogurt", "yoghurt", "cream", "butter"],
    co2PerKg: 3,
    sgdPerKg: 4,
  },
  { keywords: ["rice"], co2PerKg: 4, sgdPerKg: 3 },
  {
    keywords: ["bread", "wheat", "flour", "noodle", "pasta"],
    co2PerKg: 1.4,
    sgdPerKg: 5,
  },
  {
    keywords: ["nut", "almond", "peanut", "cashew", "legume", "bean", "lentil", "tofu"],
    co2PerKg: 2,
    sgdPerKg: 8,
  },
  {
    keywords: ["fruit", "apple", "banana", "orange", "berry", "mango", "grape"],
    co2PerKg: 1.1,
    sgdPerKg: 5,
  },
  {
    keywords: [
      "vegetable",
      "veg",
      "spinach",
      "carrot",
      "broccoli",
      "cabbage",
      "tomato",
      "potato",
      "onion",
      "lettuce",
    ],
    co2PerKg: 2,
    sgdPerKg: 4,
  },
];

const DEFAULT_FACTOR = {
  co2PerKg: 2.5,
  sgdPerKg: 6,
};

function findFactor(foodName) {
  const lower = (foodName || "").toLowerCase();

  const match = IMPACT_FACTORS.find((factor) =>
    factor.keywords.some((keyword) => lower.includes(keyword))
  );

  return match ?? DEFAULT_FACTOR;
}

function round2(number) {
  return Math.round(number * 100) / 100;
}

export function calculateImpact(foodName, weightKg) {
  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return {
      co2Kg: 0,
      valueSgd: 0,
    };
  }

  const factor = findFactor(foodName);

  return {
    co2Kg: round2(weightKg * factor.co2PerKg),
    valueSgd: round2(weightKg * factor.sgdPerKg),
  };
}