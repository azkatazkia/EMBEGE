"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase";
import { I } from "@/components/Icons";

const TIME_CHIPS = ["Any", "Under 15 min", "Under 30 min", "Under 1 hr"];
const INGR_CHIPS = ["All ingredients only", "Include partial matches"];
const DIET_EXTRA = ["Vegetarian", "Vegan", "High protein", "Gluten-free"];

const TIME_LIMITS = {
  "Any":           null,
  "Under 15 min":  15,
  "Under 30 min":  30,
  "Under 1 hr":    60,
};

function applyFilters(recipes, { searchQuery, timeActive, ingrActive, dietActive }) {
  return recipes.filter(recipe => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!recipe.title.toLowerCase().includes(q)) return false;
    }

    const timeLimit = TIME_LIMITS[timeActive] ?? null;
    if (timeLimit !== null) {
      if (recipe.readyInMinutes && recipe.readyInMinutes > timeLimit) return false;
    }

    if (ingrActive === "All ingredients only") {
      if (recipe.missedIngredientCount > 0) return false;
    }
    
    if (dietActive.size > 0) {
      const recipeDiets = (recipe.diets ?? []).map(d => d.toLowerCase());
      const anyMatch = [...dietActive].some(selected =>
        recipeDiets.includes(selected.toLowerCase())
      );
      if (!anyMatch) return false;
    }

    return true;
  });
}

function daysUntilExpiry(dateStr) {
  if (!dateStr) return 999;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr); expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / 86400000);
}

function mapSpoonacularRecipe(r) {
  const usedIngs = (r.usedIngredients ?? []).map(i => ({
    name: i.name,
    qty: i.amount ? `${i.amount} ${i.unit}`.trim() : '',
    status: 'in-stock',
    badge: 'In pantry',
    image: i.image,
  }))
  const missedIngs = (r.missedIngredients ?? []).map(i => ({
    name: i.name,
    qty: i.amount ? `${i.amount} ${i.unit}`.trim() : '',
    status: 'missing',
    badge: 'Not in stock',
    image: i.image,
  }))

  return {
    id: r.id,
    title: r.title,
    image: r.image,
    matchCount: r.usedIngredientCount ?? usedIngs.length,
    totalCount: (r.usedIngredientCount ?? usedIngs.length) + (r.missedIngredientCount ?? missedIngs.length),
    missedIngredientCount: r.missedIngredientCount ?? missedIngs.length,
    ingredients: [...usedIngs, ...missedIngs],
    servings: r.servings ?? 2,
    readyInMinutes: r.readyInMinutes ?? null,
    time: r.readyInMinutes ? `${r.readyInMinutes} min` : '—',
    diets: r.diets ?? [],
    steps: Array.isArray(r.steps) ? r.steps : [],  
  }
}

function ingStatusColor(status) {
  if (status === 'in-stock') return 'var(--leaf-600)';
  if (status === 'low')      return 'var(--status-warning)';
  return 'var(--status-urgent)';
}

function FilterPanel({
  open,
  timeActive, setTimeActive,
  ingrActive, setIngrActive,
  dietActive, setDietActive,
  dietaryRestrictions,
}) {
  function setTime(chip) { setTimeActive(chip); }
  function setIngr(chip) { setIngrActive(chip); }
  function toggleDiet(value) {
    setDietActive(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }

  if (!open) return null;

  const chipStyle = (active) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    height: 28, padding: "0 10px", borderRadius: "var(--r-sm)",
    fontSize: 12, fontWeight: 500, cursor: "pointer",
    border: `1.5px solid ${active ? "var(--leaf-800)" : "var(--stroke-default)"}`,
    background: active ? "var(--leaf-800)" : "transparent",
    color: active ? "var(--text-inverse)" : "var(--text-secondary)",
    transition: "all var(--m-fast)",
  });

  return (
    <div style={{
      background: "var(--surface-canvas)",
      border: "1px solid var(--stroke-subtle)",
      borderRadius: "var(--r-xl)",
      padding: "16px 20px",
      marginBottom: 14,
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
        Cooking time
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {TIME_CHIPS.map(chip => (
          <button key={chip} onClick={() => setTime(chip)} style={chipStyle(timeActive === chip)}>
            <I.clock size={12} />{chip}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
        Ingredients
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {INGR_CHIPS.map(chip => (
          <button key={chip} onClick={() => setIngr(chip)} style={chipStyle(ingrActive === chip)}>
            {chip}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
        Dietary — household profiles
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {dietaryRestrictions.map(restriction => (
          <button key={restriction} onClick={() => toggleDiet(restriction)} style={chipStyle(dietActive.has(restriction))}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--status-info)", flexShrink: 0 }} />
            {restriction}
          </button>
        ))}
        {DIET_EXTRA.map(chip => (
          <button key={chip} onClick={() => toggleDiet(chip)} style={chipStyle(dietActive.has(chip))}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ recipe, isExpiring, onClick }) {
  const [hovered, setHovered] = useState(false);
  const full = recipe.matchCount === recipe.totalCount;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`View recipe: ${recipe.title}`}
      style={{
        background: "var(--surface-canvas)",
        border: `1.5px solid ${hovered ? "var(--leaf-400)" : "transparent"}`,
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        textAlign: "left",
        padding: 0,
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "var(--e-2)" : "none",
        transition: "all var(--m-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{
        height: 128,
        background: recipe.image
          ? `linear-gradient(180deg, transparent 40%, rgba(26,26,26,0.5) 100%), url(${recipe.image}) center/cover no-repeat`
          : "linear-gradient(155deg, #8FA46A 0%, #5C7040 55%, #3E5229 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "10px 12px",
      }}>
        {!recipe.image && (
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
            Recipe photo
          </span>
        )}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: "auto" }}>
          {isExpiring && (
            <span style={{
              height: 22, padding: "0 8px", borderRadius: 9999,
              background: "rgba(196,69,54,0.72)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 11, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <I.clock size={11} stroke="rgba(255,255,255,0.92)" />
              Use soon
            </span>
          )}
          {!isExpiring && recipe.matchCount === recipe.totalCount && (
            <span style={{
              height: 22, padding: "0 8px", borderRadius: 9999,
              background: "rgba(26,26,26,0.32)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 11, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <I.check size={11} stroke="rgba(255,255,255,0.92)" />
              All ingredients
            </span>
          )}
          {recipe.time !== '—' && (
            <span style={{
              height: 22, padding: "0 8px", borderRadius: 9999,
              background: "rgba(26,26,26,0.32)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 11, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <I.clock size={11} stroke="rgba(255,255,255,0.92)" />
              {recipe.time}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "10px 12px 14px" }}>
        <p style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", lineHeight: 1.25 }}>
          {recipe.title}
        </p>
        <p style={{
          margin: 0, fontSize: 11, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 4,
          color: full ? "var(--leaf-600)" : "var(--status-warning)",
        }}>
          {full
            ? <I.check size={12} stroke="var(--leaf-600)" strokeWidth={2.5} />
            : <I.clock size={12} stroke="var(--status-warning)" strokeWidth={2.5} />
          }
          {recipe.matchCount}/{recipe.totalCount} in stock
          {recipe.missedIngredientCount > 0 && (
            <span style={{
              marginLeft: 4,
              display: "inline-flex", alignItems: "center",
              height: 18, padding: "0 6px", borderRadius: "var(--r-sm)",
              fontSize: 11, fontWeight: 500,
              background: "rgba(217,142,60,0.15)", color: "var(--status-warning)",
            }}>
              need {recipe.missedIngredientCount} more
            </span>
          )}
        </p>
      </div>
    </button>
  );
}

function DetailView({ recipe, dietaryRestrictions, onBack }) {
  const [portions, setPortions] = useState(recipe.servings ?? 2);
  const [confirmed, setConfirmed] = useState(false);

  const inStock = recipe.ingredients.filter(i => i.status === 'in-stock').length;
  const low     = recipe.ingredients.filter(i => i.status === 'low').length;
  const missing = recipe.ingredients.filter(i => i.status === 'missing').length;
  const usable  = inStock + low;

  function handleCook() {
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 14, textAlign: "center", padding: "60px 32px", minHeight: 420,
      }}>
        <span style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--leaf-200)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <I.check size={28} stroke="var(--leaf-800)" strokeWidth={2.5} />
        </span>
        <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Cooked! Logged to tracker.
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 260 }}>
          {usable} ingredient{usable !== 1 ? "s" : ""} deducted from inventory for {portions} {portions === 1 ? "person" : "people"}.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 8, minWidth: 160 }} onClick={onBack}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13, color: "var(--text-secondary)", cursor: "pointer",
        marginBottom: 16, background: "none", border: "none", padding: 0,
      }}>
        <I.arrowLeft size={16} strokeWidth={2.5} />
        Back to recipes
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 256px", gap: 16 }} className="detail-layout">
        <div>
          <div style={{
            height: 200,
            background: recipe.image
              ? `url(${recipe.image}) center/cover no-repeat`
              : "linear-gradient(155deg, #8FA46A 0%, #5C7040 55%, #3E5229 100%)",
            borderRadius: "var(--r-xl)",
            marginBottom: 16,
            position: "relative",
          }}>
            {!recipe.image && (
              <span style={{
                position: "absolute", bottom: 12, left: 14,
                fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
              }}>
                Recipe photo
              </span>
            )}
          </div>

          <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
            {recipe.title}
          </h1>

          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}>
            {recipe.time !== '—' && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                height: 22, padding: "0 8px", borderRadius: "var(--r-sm)",
                fontSize: 12, fontWeight: 500,
                background: "var(--surface-sunken)", color: "var(--text-secondary)",
              }}>
                <I.clock size={11} />{recipe.time}
              </span>
            )}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              height: 22, padding: "0 8px", borderRadius: "var(--r-sm)",
              fontSize: 12, fontWeight: 500,
              background: "var(--leaf-200)", color: "var(--leaf-800)",
            }}>
              {recipe.matchCount}/{recipe.totalCount} ingredients matched
            </span>
          </div>

          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
            Ingredients
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
            {recipe.ingredients.map(ing => (
              <div key={ing.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: "var(--r-md)",
                background: "var(--surface-canvas)",
                borderLeft: `3px solid ${ingStatusColor(ing.status)}`,
                opacity: ing.status === "missing" ? 0.6 : 1,
              }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{ing.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginRight: 6 }}>{ing.qty}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: ingStatusColor(ing.status) }}>{ing.badge}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
            Steps
          </p>

          {recipe.steps && recipe.steps.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {recipe.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "var(--leaf-600)", color: "white",
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <a
              href={recipe.sourceUrl ?? `https://spoonacular.com/recipes/${recipe.title.toLowerCase().replace(/\s+/g, "-")}-${recipe.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "var(--surface-canvas)",
                border: "1px solid var(--stroke-subtle)",
                borderRadius: "var(--r-md)",
                padding: "14px 16px",
                textDecoration: "none",
                marginBottom: 20,
                transition: "background var(--m-fast)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-sunken)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--surface-canvas)"}
            >
              <I.arrowOut size={16} stroke="var(--leaf-600)" />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  View full recipe on Spoonacular
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>
                  Opens in a new tab
                </p>
              </div>
            </a>
          )}
        </div>

        <div>
          <div style={{
            background: "var(--surface-canvas)",
            borderRadius: "var(--r-xl)",
            padding: 16,
            position: "sticky",
            top: 20,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
              Household dietary profiles
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
              {dietaryRestrictions.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No profiles set</span>
              ) : (
                dietaryRestrictions.map(r => (
                  <span key={r} style={{
                    height: 22, padding: "0 8px", borderRadius: "var(--r-sm)",
                    fontSize: 11, fontWeight: 500,
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "var(--leaf-50)", color: "var(--leaf-800)",
                  }}>
                    {r}
                  </span>
                ))
              )}
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
              Portions
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>How many people?</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setPortions(p => Math.max(1, p - 1))} aria-label="Decrease" style={{
                  width: 30, height: 30, borderRadius: "var(--r-sm)",
                  background: "var(--surface-sunken)", border: "none",
                  fontSize: 16, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-primary)", transition: "background var(--m-fast)",
                }}>−</button>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", minWidth: 22, textAlign: "center" }}>
                  {portions}
                </span>
                <button onClick={() => setPortions(p => Math.min(10, p + 1))} aria-label="Increase" style={{
                  width: 30, height: 30, borderRadius: "var(--r-sm)",
                  background: "var(--surface-sunken)", border: "none",
                  fontSize: 16, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-primary)", transition: "background var(--m-fast)",
                }}>+</button>
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
              Inventory impact
            </p>
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 14 }}>
              {[
                { label: "In stock",     count: inStock,  color: "var(--leaf-600)"      },
                { label: "Running low",  count: low,      color: "var(--status-warning)" },
                { label: "Not in stock", count: missing,  color: "var(--status-urgent)"  },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 12, color: "var(--text-secondary)",
                  padding: "5px 0",
                  borderBottom: "1px solid var(--stroke-subtle)",
                }}>
                  <span>{row.label}</span>
                  <strong style={{ color: row.color }}>{row.count} items</strong>
                </div>
              ))}
            </div>

            <button onClick={handleCook} className="btn btn-primary btn-lg" style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <I.utensils size={15} stroke="#fff" />
              Cook this recipe
            </button>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", marginTop: 7, lineHeight: 1.4 }}>
              Ingredients logged to consumption tracker.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .detail-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

export default function RecipesPage() {
  const supabase = createClient();

  const [filterOpen,          setFilterOpen         ] = useState(false);
  const [searchQuery,         setSearchQuery        ] = useState("");
  const [selectedRecipe,      setSelectedRecipe     ] = useState(null);
  const [displayName,         setDisplayName        ] = useState("You");
  const [userInitial,         setUserInitial        ] = useState("?");

  const [timeActive,  setTimeActive ] = useState("Any");                          
  const [ingrActive,  setIngrActive ] = useState("Include partial matches");      
  const [dietActive,  setDietActive ] = useState(new Set());                     

  const [expiringRecipes,     setExpiringRecipes    ] = useState([]);
  const [allRecipes,          setAllRecipes         ] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [loading,             setLoading            ] = useState(true);
  const [error,               setError              ] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from("household_members")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      if (member?.display_name) {
        setDisplayName(member.display_name);
        setUserInitial(member.display_name[0]?.toUpperCase() ?? "?");
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recipes");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed: ${res.status}`);
        }
        const data = await res.json();

        setExpiringRecipes((data.expiringRecipes ?? []).map(mapSpoonacularRecipe));
        setAllRecipes((data.allRecipes ?? []).map(mapSpoonacularRecipe));
        setDietaryRestrictions(data.dietaryRestrictions ?? []);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  const filterArgs = { searchQuery, timeActive, ingrActive, dietActive };
  const visibleExpiring = applyFilters(expiringRecipes, filterArgs);
  const visibleAll      = applyFilters(allRecipes,      filterArgs);
  const showingDetail   = selectedRecipe !== null;

  return (
    <AppShell userInitial={userInitial} userName={displayName}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              color: "var(--text-tertiary)", pointerEvents: "none",
            }}>
              <I.search size={17} />
            </span>
            <input
              className="input-pill"
              style={{ paddingLeft: 46 }}
              type="text"
              placeholder="Search recipes…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.preventDefault()}
              aria-label="Search recipes"
            />
          </div>
          {!showingDetail && (
            <button
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
              style={{
                height: 44, padding: "0 18px", borderRadius: 9999,
                background: filterOpen ? "var(--leaf-800)" : "var(--surface-sunken)",
                border: "none", fontSize: 14, fontWeight: 500,
                color: filterOpen ? "var(--text-inverse)" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "all var(--m-fast)", whiteSpace: "nowrap",
              }}
            >
              <I.filter size={15} />
              Filter
              <span style={{ display: "inline-flex", transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform var(--m-base)" }}>
                <I.chevronDown size={13} />
              </span>
            </button>
          )}
        </div>

        {!showingDetail && (
          <FilterPanel
            open={filterOpen}
            timeActive={timeActive} setTimeActive={setTimeActive}
            ingrActive={ingrActive} setIngrActive={setIngrActive}
            dietActive={dietActive} setDietActive={setDietActive}
            dietaryRestrictions={dietaryRestrictions}
          />
        )}

        {!showingDetail && (
          <>
            <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-tertiary)", marginBottom: 14 }}>
              <Link href="/dashboard" style={{ color: "var(--text-tertiary)" }}>Dashboard</Link>
              <I.chevronRight size={12} stroke="var(--text-tertiary)" />
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Recipes</span>
            </nav>

            <div style={{ marginBottom: 24 }}>
              <h1 className="t-heading-xl" style={{ margin: "0 0 3px" }}>Recipe suggestions</h1>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-tertiary)" }}>
                Based on your household&apos;s inventory, powered by Spoonacular.
              </p>
            </div>

            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--surface-canvas)",
                  border: "1px solid var(--stroke-subtle)",
                  borderRadius: "var(--r-xl)",
                  padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      Finding recipes from your inventory…
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>
                      Spoonacular is matching ingredients, Claude is generating cooking steps.
                    </p>
                  </div>
                </div>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} style={{ height: 180, borderRadius: "var(--r-xl)", background: "var(--surface-sunken)", opacity: 0.5 }} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div style={{
                background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)",
                padding: "16px 20px", borderRadius: "var(--r-xl)", fontSize: 14,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <I.x size={18} stroke="var(--status-urgent)" />
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>Couldn't load recipes</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13 }}>{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {visibleExpiring.length > 0 && (
                  <section style={{ marginBottom: 24 }}>
                    <h2 className="t-heading-md" style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      Use before they expire
                      <span style={{
                        height: 20, padding: "0 8px", borderRadius: "var(--r-sm)",
                        background: "rgba(196,69,54,0.12)", color: "var(--status-urgent)",
                        fontSize: 11, fontWeight: 600,
                        display: "inline-flex", alignItems: "center",
                      }}>
                        {visibleExpiring.length} recipes
                      </span>
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="cards-row">
                      {visibleExpiring.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} isExpiring onClick={() => setSelectedRecipe(recipe)} />
                      ))}
                    </div>
                  </section>
                )}

                {visibleAll.length > 0 && (
                  <section>
                    <h2 className="t-heading-md" style={{ margin: "0 0 12px" }}>All household ingredients</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="cards-row">
                      {visibleAll.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} isExpiring={false} onClick={() => setSelectedRecipe(recipe)} />
                      ))}
                    </div>
                  </section>
                )}

                {visibleExpiring.length === 0 && visibleAll.length === 0 && (
                  <div style={{ maxWidth: 340, margin: "40px auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 52 }}>🫙</span>
                    <h3 className="t-heading-md" style={{ margin: 0 }}>
                      {searchQuery ? "No recipes match your search" : "Your pantry looks empty"}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
                      {searchQuery
                        ? "Try a different search term."
                        : "Add items to your inventory and Spoonacular will suggest what to cook."}
                    </p>
                    {!searchQuery && (
                      <Link href="/inventory" className="btn btn-primary">Add inventory items</Link>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {showingDetail && (
          <DetailView
            recipe={selectedRecipe}
            dietaryRestrictions={dietaryRestrictions}
            onBack={() => setSelectedRecipe(null)}
          />
        )}

        <style>{`
          @media (max-width: 860px) { .cards-row { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 520px) { .cards-row { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </AppShell>
  );
}