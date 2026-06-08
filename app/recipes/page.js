"use client";

import { useState } from "react";
import { AppShell } from "@/components/Sidebar";

const mealTypes = ["Any", "Breakfast", "Lunch", "Dinner", "Snack"];
const cookingTimes = ["15 minutes", "30 minutes", "45 minutes", "1 hour"];

export default function RecipePage() {
    const [ingredients, setIngredients] = useState("");
    const [mealType, setMealType] = useState("Any");
    const [cookingTime, setCookingTime] = useState("30 minutes");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState("");

    function generateRecipes() {
        if (ingredients.trim() === "") {
            setError("Add at least one ingredient first.");
            return;
        }

        setError("");
        setRecipes([]);
        setIsLoading(true);
        setLoadingStep("Gibrain is thinking...");

        const ingredientList = ingredients
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");

        const mainIngredients = ingredientList.join(", ");

        setTimeout(() => {
            setLoadingStep("Finding recipe ideas...");
        }, 700);

        setTimeout(() => {
            const suggestedRecipes = [
                {
                    title: "Garlic Chicken Rice Bowl",
                    reason: `A simple comfort meal that uses ${mainIngredients} without making cooking feel complicated.`,
                    time: cookingTime,
                    servings: "2 servings",
                    tag: mealType === "Any" ? "Flexible meal" : mealType,
                    ingredients: [
                        "Chicken or available protein",
                        "Rice",
                        "Garlic",
                        "Egg",
                        "Vegetables",
                    ],
                    steps: [
                        "Cook the garlic until fragrant.",
                        "Add the protein and cook until done.",
                        "Add rice and mix everything together.",
                        "Season with salt, pepper, or soy sauce.",
                        "Top with egg and serve warm.",
                    ],
                },
                {
                    title: "Quick Home Stir-Fry",
                    reason: `This is a fast option when you want to turn leftover ingredients into something warm and filling.`,
                    time: cookingTime,
                    servings: "1-2 servings",
                    tag: "Low effort",
                    ingredients: [
                        "Available vegetables",
                        "Garlic or onion",
                        "Egg or chicken",
                        "Simple sauce",
                        "Rice or noodles",
                    ],
                    steps: [
                        "Cut all ingredients into small pieces.",
                        "Heat a pan with a little oil.",
                        "Cook the protein first.",
                        "Add vegetables and sauce.",
                        "Serve with rice or noodles.",
                    ],
                },
                {
                    title: "Cozy Egg & Veggie Plate",
                    reason: `A lighter dish that still feels satisfying, especially when you want to use simple ingredients neatly.`,
                    time: cookingTime,
                    servings: "1 serving",
                    tag: "Light meal",
                    ingredients: [
                        "Egg",
                        "Spinach or other greens",
                        "Garlic",
                        "Rice or toast",
                        "Basic seasoning",
                    ],
                    steps: [
                        "Saute garlic and vegetables.",
                        "Cook the egg based on your preference.",
                        "Prepare rice or toast as the base.",
                        "Arrange everything on one plate.",
                        "Add seasoning and serve.",
                    ],
                },
            ];

            setRecipes(suggestedRecipes);
            setIsLoading(false);
            setLoadingStep("");
        }, 1400);
    }

    return (
        <AppShell userInitial="?" userName="You">
            <div
                className="min-h-screen px-8 py-8"
                style={{ backgroundColor: "#F5EEDC" }}
            >
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <p
                            className="mb-2 text-sm font-semibold tracking-wide"
                            style={{ color: "#6E8551" }}
                        >
                            ✦ Gibrain Kitchen
                        </p>

                        <h1
                            className="font-bold"
                            style={{
                                color: "#1F1F1B",
                                fontSize: "28px",
                                lineHeight: "36px",
                            }}
                        >
                            AI Recipe Suggestions
                        </h1>

                        <p
                            className="mt-2 max-w-2xl text-sm"
                            style={{ color: "#5C594F", lineHeight: "22px" }}
                        >
                            Tell Gibrain what ingredients you have. It will suggest simple meals
                            that feel doable, warm, and not stressful.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                        <div
                            className="rounded-[20px] p-6"
                            style={{
                                backgroundColor: "#EAE2CE",
                                border: "1px solid rgba(26, 26, 26, 0.08)",
                                boxShadow: "0 4px 14px rgba(26, 26, 26, 0.04)",
                            }}
                        >
                            <div
                                className="mb-6 rounded-[18px] p-5"
                                style={{ backgroundColor: "#DDD4BD" }}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <span>✨</span>
                                    <p
                                        className="text-xs font-bold uppercase tracking-[0.18em]"
                                        style={{ color: "#6E8551" }}
                                    >
                                        Gibrain
                                    </p>
                                </div>

                                <p
                                    className="font-semibold"
                                    style={{
                                        color: "#1F1F1B",
                                        fontSize: "18px",
                                        lineHeight: "26px",
                                    }}
                                >
                                    Start with what you already have.
                                </p>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "#5C594F", lineHeight: "22px" }}
                                >
                                    No need for perfect ingredients. Gibrain will help you turn
                                    them into realistic recipe ideas.
                                </p>
                            </div>

                            <div className="mb-5">
                                <label
                                    className="mb-2 block text-sm font-semibold"
                                    style={{ color: "#1F1F1B" }}
                                >
                                    Ingredients
                                </label>

                                <textarea
                                    value={ingredients}
                                    onChange={(event) => setIngredients(event.target.value)}
                                    placeholder="Example: chicken, egg, rice, garlic, spinach"
                                    className="min-h-[120px] w-full resize-y rounded-xl px-4 py-3 text-sm outline-none"
                                    style={{
                                        backgroundColor: "#F5EEDC",
                                        border: "1px solid rgba(26, 26, 26, 0.14)",
                                        color: "#1F1F1B",
                                        lineHeight: "22px",
                                    }}
                                />

                                <p className="mt-2 text-xs" style={{ color: "#8A8275" }}>
                                    Separate each ingredient with a comma.
                                </p>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        className="mb-2 block text-sm font-semibold"
                                        style={{ color: "#1F1F1B" }}
                                    >
                                        Meal type
                                    </label>

                                    <select
                                        value={mealType}
                                        onChange={(event) => setMealType(event.target.value)}
                                        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                        style={{
                                            backgroundColor: "#F5EEDC",
                                            border: "1px solid rgba(26, 26, 26, 0.14)",
                                            color: "#1F1F1B",
                                        }}
                                    >
                                        {mealTypes.map((type) => (
                                            <option key={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className="mb-2 block text-sm font-semibold"
                                        style={{ color: "#1F1F1B" }}
                                    >
                                        Max cooking time
                                    </label>

                                    <select
                                        value={cookingTime}
                                        onChange={(event) => setCookingTime(event.target.value)}
                                        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                        style={{
                                            backgroundColor: "#F5EEDC",
                                            border: "1px solid rgba(26, 26, 26, 0.14)",
                                            color: "#1F1F1B",
                                        }}
                                    >
                                        {cookingTimes.map((time) => (
                                            <option key={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div
                                    className="mb-5 rounded-xl px-4 py-3 text-sm"
                                    style={{
                                        backgroundColor: "rgba(196, 69, 54, 0.1)",
                                        color: "#9A342A",
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={generateRecipes}
                                disabled={isLoading}
                                className="rounded-xl px-5 py-3 text-sm font-semibold transition"
                                style={{
                                    backgroundColor: isLoading ? "#9DB07A" : "#6E8551",
                                    color: "#F5EEDC",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                }}
                            >
                                {isLoading ? loadingStep : "✨ Suggest recipes"}
                            </button>
                        </div>

                        <div
                            className="rounded-[20px] p-6"
                            style={{
                                backgroundColor: "#EAE2CE",
                                border: "1px solid rgba(26, 26, 26, 0.08)",
                            }}
                        >
                            <p
                                className="mb-3 text-sm font-bold"
                                style={{ color: "#1F1F1B" }}
                            >
                                How it works
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <span
                                        className="rounded-md px-2 py-1 text-xs font-semibold"
                                        style={{
                                            backgroundColor: "#DDD4BD",
                                            color: "#6E8551",
                                        }}
                                    >
                                        Step 1
                                    </span>
                                    <p
                                        className="mt-2 text-sm"
                                        style={{ color: "#5C594F", lineHeight: "22px" }}
                                    >
                                        Gibrain reads your ingredients and chooses meal ideas that
                                        make sense.
                                    </p>
                                </div>

                                <div>
                                    <span
                                        className="rounded-md px-2 py-1 text-xs font-semibold"
                                        style={{
                                            backgroundColor: "#DDD4BD",
                                            color: "#6E8551",
                                        }}
                                    >
                                        Step 2
                                    </span>
                                    <p
                                        className="mt-2 text-sm"
                                        style={{ color: "#5C594F", lineHeight: "22px" }}
                                    >
                                        The app shows recipe cards with ingredients, time, servings,
                                        and cooking steps.
                                    </p>
                                </div>

                                <div>
                                    <span
                                        className="rounded-md px-2 py-1 text-xs font-semibold"
                                        style={{
                                            backgroundColor: "#DDD4BD",
                                            color: "#6E8551",
                                        }}
                                    >
                                        Prototype
                                    </span>
                                    <p
                                        className="mt-2 text-sm"
                                        style={{ color: "#5C594F", lineHeight: "22px" }}
                                    >
                                        This version is frontend-only. Real Claude and Spoonacular
                                        integration can be added later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {recipes.length > 0 && (
                        <div className="mt-8">
                            <div
                                className="mb-5 rounded-[20px] p-5"
                                style={{
                                    backgroundColor: "#EAE2CE",
                                    border: "1px solid rgba(26, 26, 26, 0.08)",
                                }}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <span>✨</span>
                                    <p
                                        className="text-xs font-bold uppercase tracking-[0.18em]"
                                        style={{ color: "#6E8551" }}
                                    >
                                        Gibrain
                                    </p>
                                </div>

                                <p
                                    className="font-semibold"
                                    style={{
                                        color: "#1F1F1B",
                                        fontSize: "18px",
                                        lineHeight: "26px",
                                    }}
                                >
                                    Here are 3 meals you can try.
                                </p>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "#5C594F", lineHeight: "22px" }}
                                >
                                    Pick the one that matches your energy, time, and appetite today.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                {recipes.map((recipe, index) => (
                                    <div
                                        key={index}
                                        className="rounded-[20px] p-6"
                                        style={{
                                            backgroundColor: "#EAE2CE",
                                            border: "1px solid rgba(26, 26, 26, 0.08)",
                                            boxShadow: "0 4px 14px rgba(26, 26, 26, 0.04)",
                                        }}
                                    >
                                        <div
                                            className="mb-4 flex h-36 items-center justify-center rounded-[16px]"
                                            style={{ backgroundColor: "#DDD4BD" }}
                                        >
                                            <span style={{ fontSize: "42px" }}>🍽️</span>
                                        </div>

                                        <div
                                            className="mb-4 rounded-xl p-3"
                                            style={{ backgroundColor: "#DDD4BD" }}
                                        >
                                            <p
                                                className="text-sm"
                                                style={{ color: "#4A5C35", lineHeight: "20px" }}
                                            >
                                                ✨ {recipe.reason}
                                            </p>
                                        </div>

                                        <h3
                                            className="mb-3 font-bold"
                                            style={{
                                                color: "#1F1F1B",
                                                fontSize: "18px",
                                                lineHeight: "26px",
                                            }}
                                        >
                                            {recipe.title}
                                        </h3>

                                        <div className="mb-5 flex flex-wrap gap-2">
                                            <span
                                                className="rounded-md px-3 py-1 text-xs font-medium"
                                                style={{
                                                    backgroundColor: "#DDD4BD",
                                                    color: "#5C594F",
                                                }}
                                            >
                                                {recipe.time}
                                            </span>

                                            <span
                                                className="rounded-md px-3 py-1 text-xs font-medium"
                                                style={{
                                                    backgroundColor: "#DDD4BD",
                                                    color: "#5C594F",
                                                }}
                                            >
                                                {recipe.servings}
                                            </span>

                                            <span
                                                className="rounded-md px-3 py-1 text-xs font-medium"
                                                style={{
                                                    backgroundColor: "#6E8551",
                                                    color: "#F5EEDC",
                                                }}
                                            >
                                                {recipe.tag}
                                            </span>
                                        </div>

                                        <div className="mb-5">
                                            <p
                                                className="mb-2 text-sm font-semibold"
                                                style={{ color: "#1F1F1B" }}
                                            >
                                                Ingredients
                                            </p>

                                            <ul className="space-y-1">
                                                {recipe.ingredients.map((ingredient, ingredientIndex) => (
                                                    <li
                                                        key={ingredientIndex}
                                                        className="text-sm"
                                                        style={{ color: "#5C594F", lineHeight: "22px" }}
                                                    >
                                                        • {ingredient}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <p
                                                className="mb-2 text-sm font-semibold"
                                                style={{ color: "#1F1F1B" }}
                                            >
                                                Steps
                                            </p>

                                            <ol className="space-y-2">
                                                {recipe.steps.map((step, stepIndex) => (
                                                    <li
                                                        key={stepIndex}
                                                        className="flex gap-3 text-sm"
                                                        style={{ color: "#5C594F", lineHeight: "20px" }}
                                                    >
                                                        <span
                                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                                            style={{
                                                                backgroundColor: "#6E8551",
                                                                color: "#F5EEDC",
                                                            }}
                                                        >
                                                            {stepIndex + 1}
                                                        </span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}