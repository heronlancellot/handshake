import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY ?? "gateway.pinata.cloud",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const result = await pinata.upload.public.file(file);
    return NextResponse.json({ ipfsHash: result.cid });
  } catch (err) {
    console.error("Pinata image upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
