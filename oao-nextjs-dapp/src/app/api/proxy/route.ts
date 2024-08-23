// app/api/proxy/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ipfsUrl = searchParams.get("ipfsUrl");

  if (!ipfsUrl) {
    return NextResponse.json(
      { error: "IPFS URL is required." },
      { status: 400 },
    );
  }

  try {
    // Fetch the image from the IPFS URL
    const response = await axios.get(ipfsUrl, { responseType: "arraybuffer" });

    // Set the correct headers for an image response
    const contentType = response.headers["content-type"] || "image/jpeg";
    return new NextResponse(response.data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch image." },
      { status: 500 },
    );
  }
}
