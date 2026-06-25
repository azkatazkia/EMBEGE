import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { data: member, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'No household found' }, { status: 404 })
    }

    const householdId = member.household_id

    const { data: allItems, error: itemsError } = await supabase
      .from('food_items')
      .select('id, name, quantity, expiry_date, storage_location')
      .eq('household_id', householdId)
      .order('expiry_date', { ascending: true })

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    if (!allItems || allItems.length === 0) {
      return NextResponse.json({
        expiringRecipes: [],
        allRecipes: [],
        dietaryRestrictions: [],
        expiringIngredients: [],
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiringItems = allItems.filter(item => {
      if (!item.expiry_date) return false
      const exp = new Date(item.expiry_date)
      exp.setHours(0, 0, 0, 0)
      return Math.round((exp - today) / 86400000) <= 5
    })

    const allIngredientNames     = allItems.map(i => i.name)
    const expiringIngredientNames = expiringItems.map(i => i.name)

    const { data: householdMembers } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdId)

    const memberIds = (householdMembers ?? []).map(m => m.user_id)

    let dietaryRestrictions = []
    if (memberIds.length > 0) {
      const { data: profiles } = await supabase
        .from('dietary_profiles')
        .select('restrictions')
        .in('user_id', memberIds)

      const allRestrictions = (profiles ?? []).flatMap(p => p.restrictions ?? [])
      dietaryRestrictions = [...new Set(allRestrictions)]
    }

    const spoonacularKey = process.env.SPOONACULAR_API_KEY
    if (!spoonacularKey) {
      return NextResponse.json({ error: 'SPOONACULAR_API_KEY is not set' }, { status: 500 })
    }

    const claudeKey = process.env.CLAUDE_API_KEY
    if (!claudeKey) {
      return NextResponse.json({ error: 'CLAUDE_API_KEY is not set' }, { status: 500 })
    }

    async function findByIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return []

      const params = new URLSearchParams({
        ingredients: ingredients.join(','),
        number: '6',
        ranking: '1',       
        ignorePantry: 'true',
        apiKey: spoonacularKey,
      })

      const res = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?${params}`
      )

      if (!res.ok) {
        console.error('Spoonacular error:', res.status)
        return []
      }

      return res.json()
    }

    async function generateStepsWithClaude(recipe, pantryItems, restrictions) {
      const usedNames   = (recipe.usedIngredients  ?? []).map(i => i.name)
      const missedNames = (recipe.missedIngredients ?? []).map(i => i.name)

      const dietaryNote = restrictions.length > 0
        ? `The household has the following dietary restrictions: ${restrictions.join(', ')}. Make sure all steps respect these restrictions.`
        : ''

      const prompt = `You are a home cooking assistant. Generate clear, practical step-by-step cooking instructions for the following recipe.

Recipe name: ${recipe.title}

Ingredients available in the household pantry: ${usedNames.join(', ')}
Ingredients not in pantry (user needs to buy or substitute): ${missedNames.join(', ')}
Full household pantry for context: ${pantryItems.join(', ')}

${dietaryNote}

Return ONLY a JSON object in this exact format, with no extra text before or after:
{
  "readyInMinutes": <estimated cooking time as a number>,
  "servings": <number of servings as a number>,
  "steps": [
    "Step 1 description",
    "Step 2 description",
    "Step 3 description"
  ]
}

Write 5 to 8 clear steps. Each step should be one sentence. Use only the available ingredients where possible. Do not include markdown, code fences, or any text outside the JSON object.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        console.error('Claude API error:', res.status)
        return { steps: [], readyInMinutes: null, servings: null }
      }

      const data = await res.json()
      const text = data.content?.[0]?.text ?? ''

      try {
        const clean = text.replace(/```json|```/g, '').trim()
        return JSON.parse(clean)
      } catch (e) {
        console.error('Failed to parse Claude response:', text)
        return { steps: [], readyInMinutes: null, servings: null }
      }
    }

    const [rawExpiring, rawAll] = await Promise.all([
      findByIngredients(expiringIngredientNames),
      findByIngredients(allIngredientNames),
    ])

    const expiringIds    = new Set(rawExpiring.map(r => r.id))
    const uniqueRawAll   = rawAll.filter(r => !expiringIds.has(r.id))

    async function enrichList(recipes) {
      return Promise.all(
        recipes.map(async (recipe) => {
          const claude = await generateStepsWithClaude(
            recipe,
            allIngredientNames,
            dietaryRestrictions
          )
          return {
            ...recipe,
            steps:          claude.steps          ?? [],
            readyInMinutes: claude.readyInMinutes ?? null,
            servings:       claude.servings       ?? recipe.servings ?? 2,
            diets:          [],   
          }
        })
      )
    }

    const [expiringRecipes, allRecipes] = await Promise.all([
      enrichList(rawExpiring),
      enrichList(uniqueRawAll),
    ])

    return NextResponse.json({
      expiringRecipes,
      allRecipes,
      dietaryRestrictions,
      expiringIngredients: expiringIngredientNames,
    })

  } catch (err) {
    console.error('Unexpected error in /api/recipes:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}