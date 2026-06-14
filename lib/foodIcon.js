import * as emoji from "node-emoji";

export function getFoodEmoji(name) {
  const results = emoji.search(name.toLowerCase());
  return results.length > 0 ? results[0].emoji : "🍽️";
}
