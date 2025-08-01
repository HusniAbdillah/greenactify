import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'greenactify-app/1.0 (contact@greenactify.com)'
      }
    });
    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: "Nominatim error", detail: text }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Reverse Geocode Error:", error);
    return NextResponse.json({ error: "Failed to fetch location", detail: error.message }, { status: 500 });
  }
}