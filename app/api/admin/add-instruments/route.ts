// app/api/admin/instruments/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { Category } from "@prisma/client"; // Import enum

export async function POST(req: Request) {
  try {
    // 🔑 Check token from cookie
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 📂 Parse form data
    const formData = await req.formData();

    // Multiple files (order preserved)
    const files = formData.getAll("images") as File[];

    // Upload images in parallel but keep order
    const imageUrls: string[] = await Promise.all(
      files.map(async (file, index) => {
        if (!(file instanceof File)) return "";

        const { data, error } = await supabase.storage
          .from("instruments")
          .upload(`images/${Date.now()}-${index}-${file.name}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error.message);
          throw new Error("Image upload failed: " + error.message);
        }

        const { data: publicUrl } = supabase.storage
          .from("instruments")
          .getPublicUrl(data.path);

        return publicUrl.publicUrl;
      })
    );

    // Other fields
    const name = formData.get("name") as string;
    const categoryStr = formData.get("category") as string;

    // Validate category against enum values
    const validCategories = Object.values(Category);
    if (!validCategories.includes(categoryStr as Category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const category = categoryStr as Category;

    const principle = formData.get("principle") as string;
    const discription = formData.get("discription") as string; // spelling as per your schema
    const procedure = formData.get("procedure") as string;
    const sop = formData.get("sop") as string;
    const ichGuideline = formData.get("ichGuideline") as string;
    const advantages = formData.get("advantages") as string;
    const limitations = formData.get("limitations") as string;
    const specifications = formData.get("specifications") as string;
    const videoUrl = formData.get("videoUrl") as string;

    // Save in DB
    const instrument = await db.instrument.create({
      data: {
        name,
        category,
        principle,
        discription,
        procedure,
        sop,
        ichGuideline,
        advantages,
        limitations,
        specifications,
        imageUrls, // ✅ already in correct order
        videoUrl,
      },
    });

    return NextResponse.json(instrument, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
