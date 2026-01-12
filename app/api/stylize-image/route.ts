import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const apiKey = process.env.RECRAFT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Recraft API key not configured" },
        { status: 500 }
      );
    }

    // Use Recraft's image-to-image / vectorize / restyle endpoint
    const response = await fetch(
      "https://external.api.recraft.ai/v1/images/imageToImage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: `${prompt}, artistic interpretation, atmospheric, cinematic mood`,
          style: "realistic_image",
          strength: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Recraft API error:", error);
      return NextResponse.json(
        { error: "Failed to stylize image" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const newImageUrl = data.data?.[0]?.url;

    if (!newImageUrl) {
      return NextResponse.json(
        { error: "No image URL in response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl: newImageUrl });
  } catch (error) {
    console.error("Error stylizing image:", error);
    return NextResponse.json(
      { error: "Failed to stylize image" },
      { status: 500 }
    );
  }
}
