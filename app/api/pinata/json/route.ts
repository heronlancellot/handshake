import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinataContent: metadata }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata JSON upload error:", res.status, text);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ ipfsHash: data.IpfsHash });
  } catch (err) {
    console.error("Pinata JSON upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
