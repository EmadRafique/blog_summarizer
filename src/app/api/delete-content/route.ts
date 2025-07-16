import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function DELETE(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ message: "Missing URL" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection("summaries");

    const result = await collection.deleteOne({ url });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No document found to delete" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted from MongoDB successfully" });
  } catch (error) {
    console.error("Error in /api/delete-content:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
