import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.RECRAFT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Recraft API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://external.api.recraft.ai/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          style: "digital_illustration",
          substyle: "hand_drawn",
          size: "1024x1024",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Recraft API error:", error);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Recraft returns { data: [{ url: "..." }] }
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL in response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
