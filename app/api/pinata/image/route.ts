import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const body = new FormData();
    body.append("file", file, file.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata image upload error:", res.status, text);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ ipfsHash: data.IpfsHash });
  } catch (err) {
    console.error("Pinata image upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
