import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
            return Response.json({ error: 'No text provided' }, { status: 400 });
        }

        const result = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `You will be given raw OCR text extracted from a photo. The photo is SUPPOSED to be a grocery receipt, but the OCR text may be garbled, incomplete, or come from a photo that isn't actually a receipt at all (for example a selfie, a random object, or a blank surface).

First, decide whether this text plausibly came from a grocery/supermarket receipt — look for things like a store name, item lines, prices, or a total.

If it does NOT look like a receipt, or you cannot confidently identify any real food item names in it, respond with ONLY this exact JSON object and nothing else:
{"error": "no_items_found"}

If it DOES look like a receipt, extract the food items and return ONLY a JSON array in this exact format:
[{"name":"item","quantity":"1","expiry_date":"","storage_location":"Fridge"}]

Rules for the array format:
- Storage location must be one of: Fridge, Freezer, Pantry
- Expiry date should be an empty string
- Use title case for item names
- Only include actual food/grocery items, skip non-food line items like bags, discounts, or service charges

Respond with ONLY the JSON (either the error object or the array). No markdown, no backticks, no explanation, no extra text.

OCR text: ${body.text}`
            }]
        });

        const rawText = (result.content[0] as Anthropic.TextBlock).text.trim();

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch {
            return Response.json({ error: 'no_items_found' }, { status: 200 });
        }

        if (parsed && parsed.error) {
            return Response.json({ error: 'no_items_found' }, { status: 200 });
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            return Response.json({ error: 'no_items_found' }, { status: 200 });
        }

        return Response.json({ items: JSON.stringify(parsed) });

    } catch (error) {
        console.error('Receipt parsing error:', error);
        return Response.json(
            { error: 'server_error' },
            { status: 500 }
        );
    }
}