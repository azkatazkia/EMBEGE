'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from "@/components/Sidebar";

const EXPIRY_RECIPES = [
  {
    id: 'e1',
    title: 'Spinach & Egg Shakshuka',
    time: '20 min',
    servings: 2,
    urgency: { label: '3 days left', type: 'urge' },
    diet: 'Vegetarian',
    matchCount: 4,
    totalCount: 6,
    ingredients: [
      { name: 'Spinach',        qty: '2 cups',   status: 'in-stock', badge: '3 days left'  },
      { name: 'Eggs',           qty: '4 pcs',    status: 'in-stock', badge: '5 days left'  },
      { name: 'Canned tomatoes',qty: '400g',     status: 'in-stock', badge: 'In pantry'    },
      { name: 'Garlic',         qty: '3 cloves', status: 'in-stock', badge: 'In pantry'    },
      { name: 'Cumin',          qty: '1 tsp',    status: 'low',      badge: 'Almost out'   },
      { name: 'Feta cheese',    qty: '50g',      status: 'missing',  badge: 'Not in stock' },
    ],
    steps: [
      'Heat oil, sauté garlic and cumin.',
      'Add tomatoes, simmer 5 min.',
      'Stir in spinach until wilted.',
      'Create wells, crack in eggs. Cover 5–7 min.',
      'Season and serve.',
    ],
  },
  {
    id: 'e2',
    title: 'Carrot & Lentil Soup',
    time: '35 min',
    servings: 4,
    urgency: { label: '4 days left', type: 'warn' },
    diet: 'Vegan',
    matchCount: 5,
    totalCount: 6,
    ingredients: [
      { name: 'Carrots',      qty: '3 large', status: 'in-stock', badge: '4 days left'  },
      { name: 'Red lentils',  qty: '200g',    status: 'in-stock', badge: 'In pantry'    },
      { name: 'Onion',        qty: '1 large', status: 'in-stock', badge: 'In fridge'    },
      { name: 'Veg stock',    qty: '800ml',   status: 'in-stock', badge: 'In pantry'    },
      { name: 'Cumin',        qty: '1 tsp',   status: 'low',      badge: 'Almost out'   },
      { name: 'Coconut cream',qty: '100ml',   status: 'missing',  badge: 'Not in stock' },
    ],
    steps: [
      'Sauté onion, add spices.',
      'Add carrots, stir 2 min.',
      'Add lentils and stock, bring to boil.',
      'Simmer 20 min until soft.',
      'Blend smooth.',
    ],
  },
  {
    id: 'e3',
    title: 'Banana Oat Pancakes',
    time: '15 min',
    servings: 2,
    urgency: { label: '2 days left', type: 'urge' },
    diet: 'Vegetarian',
    matchCount: 3,
    totalCount: 4,
    ingredients: [
      { name: 'Bananas',       qty: '2 ripe', status: 'in-stock', badge: '2 days left'  },
      { name: 'Oats',          qty: '1 cup',  status: 'in-stock', badge: 'In pantry'    },
      { name: 'Eggs',          qty: '2 pcs',  status: 'in-stock', badge: '5 days left'  },
      { name: 'Baking powder', qty: '½ tsp',  status: 'missing',  badge: 'Not in stock' },
    ],
    steps: [
      'Mash bananas in a bowl.',
      'Mix in oats, eggs, baking powder.',
      'Cook spoonfuls on non-stick pan, 2 min each side.',
      'Serve with honey or fruit.',
    ],
  },
];

const ALL_RECIPES = [
  {
    id: 'a1',
    title: 'Garlic Chicken Rice Bowl',
    time: '30 min',
    servings: 2,
    urgency: { label: 'All ingredients', type: '' },
    diet: 'High protein',
    matchCount: 6,
    totalCount: 6,
    ingredients: [
      { name: 'Chicken breast', qty: '300g',    status: 'in-stock', badge: 'In fridge'  },
      { name: 'Rice',           qty: '1 cup',   status: 'in-stock', badge: 'In pantry'  },
      { name: 'Garlic',         qty: '4 cloves',status: 'in-stock', badge: 'In pantry'  },
      { name: 'Soy sauce',      qty: '2 tbsp',  status: 'in-stock', badge: 'In pantry'  },
      { name: 'Spring onion',   qty: '2 stalks',status: 'in-stock', badge: 'In fridge'  },
      { name: 'Sesame oil',     qty: '1 tsp',   status: 'in-stock', badge: 'In pantry'  },
    ],
    steps: [
      'Cook rice.',
      'Marinate chicken in soy sauce + garlic 10 min.',
      'Pan-fry until golden.',
      'Slice and serve over rice.',
      'Top with spring onion and sesame oil.',
    ],
  },
  {
    id: 'a2',
    title: 'Veggie Fried Rice',
    time: '20 min',
    servings: 2,
    urgency: { label: 'All ingredients', type: '' },
    diet: 'Vegetarian',
    matchCount: 6,
    totalCount: 6,
    ingredients: [
      { name: 'Leftover rice', qty: '2 cups',   status: 'in-stock', badge: 'In fridge'  },
      { name: 'Eggs',          qty: '3 pcs',    status: 'in-stock', badge: 'In fridge'  },
      { name: 'Garlic',        qty: '2 cloves', status: 'in-stock', badge: 'In pantry'  },
      { name: 'Soy sauce',     qty: '2 tbsp',   status: 'in-stock', badge: 'In pantry'  },
      { name: 'Carrots',       qty: '1 diced',  status: 'in-stock', badge: 'In fridge'  },
      { name: 'Spring onion',  qty: '2 stalks', status: 'in-stock', badge: 'In fridge'  },
    ],
    steps: [
      'Scramble eggs, set aside.',
      'Fry garlic and carrots.',
      'Add rice, stir-fry on high heat.',
      'Fold in eggs and soy sauce.',
      'Top with spring onion.',
    ],
  },
  {
    id: 'a3',
    title: 'Tomato & Egg Stir-Fry',
    time: '15 min',
    servings: 2,
    urgency: { label: 'All ingredients', type: '' },
    diet: 'Vegetarian',
    matchCount: 5,
    totalCount: 5,
    ingredients: [
      { name: 'Eggs',        qty: '3 pcs',    status: 'in-stock', badge: 'In fridge'  },
      { name: 'Tomatoes',    qty: '2 large',  status: 'in-stock', badge: 'In fridge'  },
      { name: 'Garlic',      qty: '2 cloves', status: 'in-stock', badge: 'In pantry'  },
      { name: 'Sugar',       qty: '1 tsp',    status: 'in-stock', badge: 'In pantry'  },
      { name: 'Spring onion',qty: '1 stalk',  status: 'in-stock', badge: 'In fridge'  },
    ],
    steps: [
      'Scramble eggs, set aside.',
      'Fry garlic, add tomatoes and sugar.',
      'Simmer until softened.',
      'Fold in eggs.',
      'Serve over rice.',
    ],
  },
];

const MOCK_DIETARY_PROFILES = [
  { user_id: 'u1', display_name: 'Azka',   restrictions: ['halal'],          color: 'a' },
  { user_id: 'u2', display_name: 'Sabrina',restrictions: ['lactose-free'],   color: 's' },
];

const TIME_CHIPS   = ['Any', 'Under 15 min', 'Under 30 min', 'Under 1 hr'];
const INGR_CHIPS   = ['Include partial matches', 'All ingredients only'];
const DIET_EXTRA   = ['Vegetarian', 'Vegan', 'High protein', 'Gluten-free'];

function ingredientStatusColor(status) {
  if (status === 'in-stock') return 'var(--color-accent)';
  if (status === 'low')      return 'var(--color-warn)';
  return 'var(--color-danger)';
}

function urgencyBg(type) {
  if (type === 'urge') return 'rgba(196,69,54,0.70)';
  if (type === 'warn') return 'rgba(217,142,60,0.70)';
  return 'rgba(26,26,26,0.32)';
}

function urgencyDtagClass(type) {
  if (type === 'urge' || type === 'warn') return 'dtag-warn';
  return 'dtag-green';
}

function RecipeCard({ recipe, onClick }) {
  const full = recipe.matchCount === recipe.totalCount;

  return (
    <button
      onClick={onClick}
      className="recipe-card"
      aria-label={`View recipe: ${recipe.title}`}
    >
      {/* Photo placeholder */}
      <div className="card-photo">
        <span className="card-photo-label">Recipe photo</span>
        <div className="card-photo-tags">
          {recipe.urgency.type && (
            <span
              className="photo-tag"
              style={{ background: urgencyBg(recipe.urgency.type) }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {recipe.urgency.label}
            </span>
          )}
          {!recipe.urgency.type && (
            <span className="photo-tag">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {recipe.urgency.label}
            </span>
          )}
          <span className="photo-tag">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {recipe.time}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="card-body">
        <p className="card-title">{recipe.title}</p>
        <p className={`card-match ${full ? 'full' : 'part'}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            {full
              ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
              : <circle cx="12" cy="12" r="10"/>
            }
          </svg>
          {recipe.matchCount}/{recipe.totalCount} in stock
          <span className="tag-inline">{recipe.diet}</span>
        </p>
      </div>
    </button>
  );
}

function DetailView({ recipe, dietaryProfiles, onBack, onCookLogged }) {
  const [portions, setPortions] = useState(recipe.servings);
  const [confirmed, setConfirmed] = useState(false);

  const inStock  = recipe.ingredients.filter(i => i.status === 'in-stock').length;
  const low      = recipe.ingredients.filter(i => i.status === 'low').length;
  const missing  = recipe.ingredients.filter(i => i.status === 'missing').length;
  const usable   = inStock + low; // ingredients we can deduct

  function handleCook() {

    setConfirmed(true);
    onCookLogged?.(recipe, portions);
  }

  if (confirmed) {
    return (
      <div className="confirm-screen">
        <div className="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p className="confirm-heading">Cooked! Logged to tracker.</p>
        <p className="confirm-sub">
          {usable} ingredient{usable !== 1 ? 's' : ''} deducted from inventory for {portions} {portions === 1 ? 'person' : 'people'}.
        </p>
        <button className="cook-btn" style={{ maxWidth: 200, margin: '0 auto' }} onClick={onBack}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="detail-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to recipes
      </button>

      <div className="detail-layout">
        {/* Left: recipe info */}
        <div>
          <div className="detail-photo">
            <span className="card-photo-label">Recipe photo</span>
          </div>

          <h1 className="detail-title">{recipe.title}</h1>

          <div className="detail-tags">
            <span className={`dtag ${urgencyDtagClass(recipe.urgency.type)}`}>
              {recipe.urgency.label}
            </span>
            <span className="dtag dtag-muted">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {recipe.time}
            </span>
            <span className="dtag dtag-green">{recipe.diet}</span>
          </div>

          <p className="slabel">Ingredients</p>
          <div>
            {recipe.ingredients.map(ing => (
              <div key={ing.name} className={`ingredient-row ${ing.status}`}>
                <span className="ing-name">{ing.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)', marginRight: 6 }}>{ing.qty}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: ingredientStatusColor(ing.status) }}>
                  {ing.badge}
                </span>
              </div>
            ))}
          </div>

          <p className="slabel" style={{ marginTop: 14 }}>Steps</p>
          <div>
            {recipe.steps.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{i + 1}</div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: side panel */}
        <div>
          <div className="panel">
            <p className="slabel">Household dietary profiles</p>
            <div className="diet-pills">
              {dietaryProfiles.map(profile => (
                <span key={profile.user_id} className={`dpill dpill-${profile.color}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {profile.display_name} · {profile.restrictions.join(', ')}
                </span>
              ))}
              {dietaryProfiles.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>No profiles set</span>
              )}
            </div>

            <p className="slabel">Portions</p>
            <div className="portions-row">
              <span style={{ fontSize: 13, color: 'var(--color-sub)' }}>How many people?</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="pct-btn"
                  onClick={() => setPortions(p => Math.max(1, p - 1))}
                  aria-label="Decrease portions"
                >
                  −
                </button>
                <span className="pct-val">{portions}</span>
                <button
                  className="pct-btn"
                  onClick={() => setPortions(p => Math.min(10, p + 1))}
                  aria-label="Increase portions"
                >
                  +
                </button>
              </div>
            </div>

            <p className="slabel">Inventory impact</p>
            <div>
              <div className="inv-row">
                <span>In stock</span>
                <strong style={{ color: 'var(--color-accent)' }}>{inStock} items</strong>
              </div>
              <div className="inv-row">
                <span>Running low</span>
                <strong style={{ color: 'var(--color-warn)' }}>{low} items</strong>
              </div>
              <div className="inv-row">
                <span>Not in stock</span>
                <strong style={{ color: 'var(--color-danger)' }}>{missing} items</strong>
              </div>
            </div>

            <button className="cook-btn" onClick={handleCook}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              Cook this recipe
            </button>
            <p className="note-row">Ingredients logged to consumption tracker.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ open, dietaryProfiles }) {
  const [timeActive,  setTimeActive ] = useState(new Set(['Any']));
  const [ingrActive,  setIngrActive ] = useState(new Set(['Include partial matches']));
  const [dietActive,  setDietActive ] = useState(new Set());

  function toggle(set, setter, value) {
    setter(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }

  return (
    <div className={`filter-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <p className="fsection">Cooking time</p>
      <div className="fchips">
        {TIME_CHIPS.map(chip => (
          <button
            key={chip}
            className={`fchip ${timeActive.has(chip) ? 'on' : ''}`}
            onClick={() => toggle(timeActive, setTimeActive, chip)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {chip}
          </button>
        ))}
      </div>

      <p className="fsection">Ingredients</p>
      <div className="fchips">
        {INGR_CHIPS.map(chip => (
          <button
            key={chip}
            className={`fchip ${ingrActive.has(chip) ? 'on' : ''}`}
            onClick={() => toggle(ingrActive, setIngrActive, chip)}
          >
            {chip === 'Include partial matches'
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            }
            {chip}
          </button>
        ))}
      </div>

      <p className="fsection">Dietary — household profiles</p>
      <div className="fchips">
        {/* Dynamic household members */}
        {dietaryProfiles.map((profile, idx) => (
          <button
            key={profile.user_id}
            className={`fchip ${dietActive.has(profile.user_id) ? 'on' : ''}`}
            onClick={() => toggle(dietActive, setDietActive, profile.user_id)}
          >
            <span
              className="mdot"
              style={{
                background: idx === 0 ? 'var(--color-danger)' : 'var(--color-info)',
              }}
            />
            {profile.display_name} · {profile.restrictions.join(', ')}
          </button>
        ))}
        {/* Static diet chips */}
        {DIET_EXTRA.map(chip => (
          <button
            key={chip}
            className={`fchip ${dietActive.has(chip) ? 'on' : ''}`}
            onClick={() => toggle(dietActive, setDietActive, chip)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2z"/></svg>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const [filterOpen,      setFilterOpen     ] = useState(false);
  const [searchQuery,     setSearchQuery    ] = useState('');
  const [selectedRecipe,  setSelectedRecipe ] = useState(null);
  const [dietaryProfiles, setDietaryProfiles] = useState(MOCK_DIETARY_PROFILES);

  function filterBySearch(recipes) {
    if (!searchQuery.trim()) return recipes;
    const q = searchQuery.toLowerCase();
    return recipes.filter(r => r.title.toLowerCase().includes(q));
  }

  const visibleExpiry = filterBySearch(EXPIRY_RECIPES);
  const visibleAll    = filterBySearch(ALL_RECIPES);

  const showingDetail = selectedRecipe !== null;

  return (
  <AppShell userInitial="J" userName="You">
    <>
      {/* ── Inline styles (mirrors prototype CSS variables exactly) ── */}
      <style>{`
        :root {
          --color-bg:          #F5EEDC;
          --color-surface:     #EAE2CE;
          --color-card:        #F5EEDC;
          --color-input:       #DDD4BD;
          --color-border:      rgba(26,26,26,0.10);
          --color-accent:      #6E8551;
          --color-accent-dark: #4A5C35;
          --color-accent-pale: #C9D4AF;
          --color-warn:        #D98E3C;
          --color-warn-pale:   #F5DFB8;
          --color-danger:      #C44536;
          --color-info:        #5B7C8F;
          --color-text:        #1F1F1B;
          --color-sub:         #5C594F;
          --color-muted:       #8A8275;
          --photo-gradient:    linear-gradient(155deg,#8FA46A 0%,#5C7040 55%,#3E5229 100%);
        }

        /* Reset */
        .recipes-root *, .recipes-root *::before, .recipes-root *::after {
          box-sizing: border-box;
        }
        .recipes-root {
          background: var(--color-surface);
          border-radius: 24px;
          padding: 22px;
          min-height: 100%;
          color: var(--color-text);
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Search row */
        .top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .search-wrap { flex: 1; position: relative; }
        .search-wrap svg.search-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: var(--color-muted); pointer-events: none;
        }
        .search-pill {
          width: 100%; height: 44px; border-radius: 9999px;
          background: var(--color-input); border: none;
          padding: 0 18px 0 46px; font-size: 14px; color: var(--color-text);
          outline: none; font-family: inherit;
        }
        .search-pill::placeholder { color: var(--color-muted); }
        .search-pill:focus { box-shadow: inset 0 0 0 2px var(--color-accent); }

        .filter-btn {
          height: 44px; padding: 0 18px; border-radius: 9999px;
          background: var(--color-input); border: none;
          font-size: 14px; font-weight: 500; color: var(--color-sub);
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          font-family: inherit; white-space: nowrap; transition: background 150ms, color 150ms;
        }
        .filter-btn.open { background: var(--color-accent-dark); color: var(--color-bg); }
        .filter-chevron { font-size: 13px; transition: transform 200ms; display: flex; }
        .filter-chevron.open { transform: rotate(180deg); }

        /* Filter panel */
        .filter-panel {
          background: var(--color-bg); border-radius: 14px;
          border: 1px solid var(--color-border); padding: 16px;
          margin-bottom: 14px;
          display: none;
        }
        .filter-panel.open { display: block; }
        .fsection {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--color-muted); margin-bottom: 8px;
        }
        .fchips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .fchip {
          display: inline-flex; align-items: center; gap: 5px;
          height: 28px; padding: 0 10px; border-radius: 7px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          border: 1.5px solid var(--color-border);
          background: transparent; color: var(--color-sub); font-family: inherit;
          transition: background 150ms, border-color 150ms, color 150ms;
        }
        .fchip.on { background: var(--color-accent-dark); border-color: var(--color-accent-dark); color: white; }
        .mdot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

        /* Breadcrumb */
        .breadcrumb {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: var(--color-muted); margin-bottom: 12px;
        }
        .breadcrumb .current { color: var(--color-text); font-weight: 600; }

        /* Page heading */
        .page-heading { margin-bottom: 22px; }
        .page-heading h1 {
          font-size: 28px; font-weight: 700; letter-spacing: -0.02em;
          color: var(--color-text); margin-bottom: 3px;
        }
        .page-heading p { font-size: 14px; color: var(--color-muted); }

        /* Section */
        .section-block { margin-bottom: 22px; }
        .section-head { margin-bottom: 12px; }
        .section-head h2 {
          font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: var(--color-text);
        }

        /* Card grid */
        .cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

        /* Recipe card */
        .recipe-card {
          background: var(--color-card); border-radius: 16px; cursor: pointer;
          border: 1.5px solid transparent;
          transition: border-color 150ms, transform 150ms;
          overflow: hidden; text-align: left;
          padding: 0;
        }
        .recipe-card:hover { border-color: #9DB07A; transform: translateY(-2px); }
        .card-photo {
          background: var(--photo-gradient); height: 128px;
          display: flex; flex-direction: column; justify-content: space-between; padding: 10px;
        }
        .card-photo-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
        }
        .card-photo-tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .photo-tag {
          height: 22px; padding: 0 8px; border-radius: 999px;
          background: rgba(26,26,26,0.32); color: rgba(255,255,255,0.92);
          font-size: 11px; font-weight: 500;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .card-body { padding: 10px 12px 12px; }
        .card-title {
          font-size: 15px; font-weight: 700; color: var(--color-text);
          line-height: 1.25; margin-bottom: 5px; letter-spacing: -0.01em;
        }
        .card-match {
          font-size: 11px; font-weight: 500;
          display: flex; align-items: center; gap: 4px;
        }
        .card-match.full { color: var(--color-accent); }
        .card-match.part { color: var(--color-warn); }
        .tag-inline {
          display: inline-flex; align-items: center; height: 18px; padding: 0 6px;
          border-radius: 5px; font-size: 11px; font-weight: 500;
          background: var(--color-accent-pale); color: var(--color-accent-dark); margin-left: 2px;
        }

        /* Detail view */
        .detail-back {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--color-sub); cursor: pointer;
          margin-bottom: 14px; background: none; border: none; font-family: inherit;
          padding: 0;
        }
        .detail-back:hover { color: var(--color-text); }
        .detail-layout { display: grid; grid-template-columns: 1fr 256px; gap: 14px; }
        .detail-photo {
          height: 148px; background: var(--photo-gradient); border-radius: 16px;
          display: flex; flex-direction: column; justify-content: space-between; padding: 12px;
          margin-bottom: 14px;
        }
        .detail-title {
          font-size: 20px; font-weight: 700; color: var(--color-text);
          letter-spacing: -0.01em; margin-bottom: 6px;
        }
        .detail-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 14px; }
        .dtag {
          display: inline-flex; align-items: center; gap: 4px;
          height: 22px; padding: 0 8px; border-radius: 6px;
          font-size: 12px; font-weight: 500;
        }
        .dtag-green { background: var(--color-accent-pale); color: var(--color-accent-dark); }
        .dtag-muted { background: var(--color-input); color: var(--color-sub); }
        .dtag-warn  { background: var(--color-warn-pale); color: #7A5010; }
        .slabel {
          font-size: 11px; font-weight: 600; color: var(--color-muted);
          text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px;
        }
        .ingredient-row {
          display: flex; align-items: center; gap: 10px; padding: 7px 10px;
          border-radius: 10px; background: var(--color-bg); margin-bottom: 5px;
        }
        .ingredient-row.in-stock { border-left: 3px solid var(--color-accent); }
        .ingredient-row.low      { border-left: 3px solid var(--color-warn); }
        .ingredient-row.missing  { border-left: 3px solid var(--color-danger); opacity: 0.6; }
        .ing-name { flex: 1; font-size: 13px; color: var(--color-text); font-weight: 500; }

        .step-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 9px; }
        .step-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--color-accent); color: white;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .step-text { font-size: 13px; color: var(--color-sub); line-height: 1.5; }

        /* Side panel */
        .panel { background: var(--color-bg); border-radius: 14px; padding: 14px; }
        .portions-row {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
        }
        .pct-btn {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--color-input); color: var(--color-text);
          font-size: 16px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; font-family: inherit;
          transition: background 150ms, color 150ms;
        }
        .pct-btn:hover { background: var(--color-accent-pale); color: var(--color-accent-dark); }
        .pct-val {
          font-size: 18px; font-weight: 700; color: var(--color-text);
          min-width: 22px; text-align: center;
        }
        .inv-row {
          display: flex; justify-content: space-between;
          font-size: 12px; color: var(--color-sub); padding: 4px 0;
          border-bottom: 1px solid rgba(26,26,26,0.06);
        }
        .inv-row:last-child { border-bottom: none; }

        .diet-pills { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
        .dpill {
          height: 22px; padding: 0 8px; border-radius: 6px;
          font-size: 11px; font-weight: 500;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .dpill-a { background: #F5C5BE; color: #7A2519; }
        .dpill-s { background: #C8D8E0; color: #2A4C5A; }

        .cook-btn {
          width: 100%; height: 42px; border-radius: 11px;
          background: var(--color-accent); color: white;
          font-size: 14px; font-weight: 600; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 12px; font-family: inherit;
          transition: background 150ms;
        }
        .cook-btn:hover { background: var(--color-accent-dark); }
        .note-row {
          font-size: 11px; color: var(--color-muted);
          text-align: center; margin-top: 7px; line-height: 1.4;
        }

        /* Confirm screen */
        .confirm-screen {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; text-align: center; padding: 48px 32px; min-height: 400px;
        }
        .confirm-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--color-accent-pale);
          display: flex; align-items: center; justify-content: center;
        }
        .confirm-heading { font-size: 19px; font-weight: 700; color: var(--color-text); }
        .confirm-sub {
          font-size: 13px; color: var(--color-sub); line-height: 1.5; max-width: 260px;
        }

        /* Empty state */
        .empty-state {
          font-size: 13px; color: var(--color-muted);
          padding: 16px 0; text-align: center;
        }

        /* Responsive: collapse to 2 cols on narrow screens */
        @media (max-width: 700px) {
          .cards-row { grid-template-columns: repeat(2, 1fr); }
          .detail-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .cards-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="recipes-root">
        {/* Search + filter bar (always visible) */}
        <div className="top-row">
          <div className="search-wrap">
            <svg
              className="search-icon"
              width="17" height="17" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-pill"
              type="text"
              placeholder="Search recipes…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search recipes"
            />
          </div>

          {!showingDetail && (
            <button
              className={`filter-btn ${filterOpen ? 'open' : ''}`}
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
              aria-controls="filter-panel"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
              </svg>
              Filter
              <span className={`filter-chevron ${filterOpen ? 'open' : ''}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </button>
          )}
        </div>

        {/* Filter panel */}
        {!showingDetail && (
          <div id="filter-panel">
            <FilterPanel open={filterOpen} dietaryProfiles={dietaryProfiles} />
          </div>
        )}

        {/* ── List view ── */}
        {!showingDetail && (
          <>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/dashboard" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
                Dashboard
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="current">Recipes</span>
            </nav>

            <div className="page-heading">
              <h1>Recipe suggestions</h1>
              <p>Based on your household&apos;s inventory, powered by Spoonacular.</p>
            </div>

            {/* Section 1: expiring */}
            <div className="section-block">
              <div className="section-head">
                <h2>Use before they expire</h2>
              </div>
              {visibleExpiry.length > 0 ? (
                <div className="cards-row">
                  {visibleExpiry.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No expiring-ingredient recipes match your search.</p>
              )}
            </div>

            {/* Section 2: all */}
            <div className="section-block">
              <div className="section-head">
                <h2>All household ingredients</h2>
              </div>
              {visibleAll.length > 0 ? (
                <div className="cards-row">
                  {visibleAll.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No recipes match your search.</p>
              )}
            </div>
          </>
        )}

        {/* ── Detail view ── */}
        {showingDetail && (
          <DetailView
            recipe={selectedRecipe}
            dietaryProfiles={dietaryProfiles}
            onBack={() => setSelectedRecipe(null)}
            onCookLogged={(recipe, portions) => {
              console.log('Logged cook:', recipe.title, 'for', portions, 'people');
            }}
          />
        )}
      </div>
        </>
  </AppShell>
);
}