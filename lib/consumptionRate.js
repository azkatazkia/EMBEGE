import foodkeeper from "./foodkeeper.json";

function getNumberOfDays(value, metric) {
    if (!value || !metric) return null;
    return metric == "Months" ? value * 30 : metric == "Weeks" ? value * 7 : value;
}

export function getSuggestedExpiry(itemName, storageLocation) {
    const match = foodkeeper.find(item => item.keywords?.toLowerCase().includes(itemName.toLowerCase()));

    if (!match) return null;

    let max, metric;

    if (storageLocation === "Fridge") {
        max = match.refrigerate_max;
        metric = match.refrigerate_metric;
    } else if (storageLocation === "Freezer") {
        max = match.freeze_max;
        metric = match.freeze_metric;
    } else {
        max = match.pantry_max;
        metric = match.pantry_metric;
    }

    const days = getNumberOfDays(max, metric) ?? 0;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

export function buildRateMap(logs) {
    const groups = {};
    for (const log of logs) {
        if (!log.consumed_at || !log.item_added_at) { continue; } 
        const key = log.food_item_name;
        const value = (new Date(log.consumed_at) - new Date(log.item_added_at)) / 86400000;
        if (!groups[key]) groups[key] = [];
        groups[key].push(value);
    }

    const map = new Map();
    for (const [name, durations] of Object.entries(groups)) {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        map.set(name.toLowerCase(), avg);
    }
    return map;
}

const DEFAULT_ALERT_DAYS = 5;

export function getAlertThreshold(itemName, rateMap) {
    const avgDays = rateMap.get(itemName.toLowerCase());
    if (!avgDays) return DEFAULT_ALERT_DAYS;
    return Math.max(Math.ceil(avgDays * 1.2), DEFAULT_ALERT_DAYS);
}

export function isAlertItem(item, rateMap) {
    if (!item.expiry_date) return { shouldAlert: false, isEarlyAlert: false };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiry = new Date(item.expiry_date); expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((expiry - today) / 86400000);
    const threshold = getAlertThreshold(item.name, rateMap);
    const shouldAlert = daysLeft <= threshold;
    const isEarlyAlert = shouldAlert && threshold > DEFAULT_ALERT_DAYS && daysLeft > DEFAULT_ALERT_DAYS;
    return { shouldAlert, isEarlyAlert };
}