import foodkeeper from "/lib/foodkeeper.json";

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