import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { url, content } = await req.json();

    if (!url || !content) {
      return NextResponse.json(
        { message: "Missing url or content" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection("summaries");

    const result = await collection.insertOne({ url, content, createdAt: new Date() });

    if (!result.insertedId) {
      return NextResponse.json(
        { message: "Failed to save content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Content saved successfully" });
  } catch (error) {
    console.error("Error in /api/save-content:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
