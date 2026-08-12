import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { imageBase64, mediaType } = body;

    if (!imageBase64 || !mediaType) {
        return NextResponse.json(
            { error: "imageBase64 and mediaType are required"},
            { status: 400 }
        )
    }

    try {
        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mediaType,
                                data: imageBase64,
                            }
                        },
                        {
                            type: "text",
                            text: `Identify all food items visible in this image. Return ONLY a JSON array, no explanation. Each object must have:
                            - "name": food item name (string)
                            - "quantity": estimated quantity e.g. "2 bottles", "500g" (string)
                            - "storage_location": must be exactly one of "Fridge", "Freezer", or "Pantry" with the same capitalization.
                            
                            Example: [{ "name": "Milk", "quantity": "1 bottle", "storage_location": "Fridge" }]
                            
                            If no food items are visible, return [].`,
                        }
                    ]
                }
            ]
        })

        const rawText = (message.content[0] as Anthropic.TextBlock).text;

        let items;
        try {
            const cleaned = rawText
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, "")
                .trim();
            items = JSON.parse(cleaned);
        } catch {
            return NextResponse.json(
                { error: "Claude returned invalid JSON" },
                { status: 500 }
            );
        }

        return NextResponse.json({ items });

    } catch (err) {
        console.error("Fridge analysis error:", err);
        return NextResponse.json(
            { error: "Failed to analyze fridge photo" },
            { status: 500 }
        );
    }
}