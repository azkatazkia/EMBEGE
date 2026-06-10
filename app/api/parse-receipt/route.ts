import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function POST(request: Request) {
    const { text } = await request.json();
    const result = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: `Extract food items from this receipt. Return ONLY a JSON array like this exact format: [{"name":"item","quantity":"1","expiry_date":"","storage_location":"Fridge"}]. Storage location must be one of: Fridge, Freezer, Pantry. Expiry date should be an empty string. Use title case for items name. No markdown, no backticks, no explanation. Receipt: ${text}`}]
    });
    const jsonResult = (result.content[0] as Anthropic.TextBlock).text;
    return Response.json({ items: jsonResult });
}