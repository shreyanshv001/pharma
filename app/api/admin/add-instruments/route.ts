import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { Category } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function POST(req: Request) {
  try {
    // ✅ 1. Auth check
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // ✅ 2. Supabase setup
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // ✅ 3. Parse form data
    const formData = await req.formData();
    const files = formData.getAll("images").filter((f): f is File => f instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    // ✅ 4. Upload function (with buffer conversion)
    async function uploadToSupabase(bucket: string, file: File, index: number) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `images/${Date.now()}-${index}-${safeName}`;

      const { data, error } = await sb.storage
        .from(bucket)
        .upload(filePath, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType:
            typeof file.type === "string" && file.type.length > 0
              ? file.type
              : "application/octet-stream",
        });

      if (error) throw new Error(error.message);

      const { data: publicUrl } = sb.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl.publicUrl;
    }

    // ✅ 5. Local fallback (development only)
    const localFallback = process.env.NODE_ENV !== "production";
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (localFallback) await mkdir(uploadsDir, { recursive: true });

    async function saveLocally(file: File, i: number): Promise<string> {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}-${i}-${safeName}`;
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      return `/uploads/${filename}`;
    }

    // ✅ 6. Upload all images sequentially
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadToSupabase("instruments", file, i);
        imageUrls.push(url);
      } catch (err) {
        console.error("Supabase upload failed:", err);
        if (localFallback) {
          const localUrl = await saveLocally(file, i);
          console.warn("Saved locally:", localUrl);
          imageUrls.push(localUrl);
        } else {
          throw new Error("Image upload failed in production.");
        }
      }
    }

    // ✅ 7. Get other fields
    const name = formData.get("name") as string;
    const categoryStr = formData.get("category") as string;
    const validCategories = Object.values(Category);
    if (!validCategories.includes(categoryStr as Category))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });

    const category = categoryStr as Category;
    const principle = formData.get("principle") as string;
    const discription = formData.get("discription") as string;
    const procedure = formData.get("procedure") as string;
    const sop = formData.get("sop") as string;
    const ichGuideline = formData.get("ichGuideline") as string;
    const advantages = formData.get("advantages") as string;
    const limitations = formData.get("limitations") as string;
    const specifications = formData.get("specifications") as string;
    const videoUrl = formData.get("videoUrl") as string;

    // ✅ 8. Save in database
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
        imageUrls,
        videoUrl,
      },
    });

    return NextResponse.json(instrument, { status: 201 });
  } catch (err) {
    console.error("❌ Error in instrument upload:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
