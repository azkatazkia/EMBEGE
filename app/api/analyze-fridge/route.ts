import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mediaType } = body;

    if (!imageBase64 || !mediaType) {
      return NextResponse.json(
        { error: "imageBase64 and mediaType are required" },
        { status: 400 }
      );
    }

    // Validate media type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: `Unsupported media type. Must be one of: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are a food inventory assistant. Analyze this fridge or pantry image and identify all visible food items.

Return ONLY a JSON array of objects with no extra text or explanation. Each object must have:
- "name": the food item name (string)
- "quantity": estimated quantity (string, e.g. "1 bottle", "3 eggs", "500g", "half a bag")
- "storage_location": one of "fridge", "freezer", or "pantry"

Example output:
[
  { "name": "Milk", "quantity": "1 bottle", "storage_location": "fridge" },
  { "name": "Eggs", "quantity": "6 pieces", "storage_location": "fridge" }
]

If you cannot identify any food items, return an empty array: []`,
            },
          ],
        },
      ],
    });

    // Extract text from the response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 }
      );
    }

    // Parse the JSON array Claude returned
    let detectedItems;
    try {
      // Strip markdown code fences if Claude wrapped the JSON
      const cleaned = textBlock.text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      detectedItems = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse Claude response as JSON",
          raw: textBlock.text,
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(detectedItems)) {
      return NextResponse.json(
        {
          error: "Claude response was not a JSON array",
          raw: textBlock.text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: detectedItems });
  } catch (error) {
    console.error("analyze-fridge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
