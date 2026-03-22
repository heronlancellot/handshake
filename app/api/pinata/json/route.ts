import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY ?? "gateway.pinata.cloud",
});

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();
    const result = await pinata.upload.public.json(metadata);
    return NextResponse.json({ ipfsHash: result.cid });
  } catch (err) {
    console.error("Pinata JSON upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
