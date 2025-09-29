// app/api/admin/instruments/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { Category } from "@prisma/client"; // Import enum
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

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
    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File);

    // ✅ Create a server-only Supabase client (service role if available)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase env vars missing: SUPABASE_URL or SUPABASE_*_KEY");
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }
    const sb: SupabaseClient = createClient(supabaseUrl, supabaseKey);

    // Helper: upload with retry/backoff to reduce timeout errors
    async function uploadWithRetry(bucket: string, path: string, file: File, retries = 2): Promise<string> {
      let lastErr: unknown = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        const { data, error } = await sb.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: typeof file.type === "string" && file.type.length > 0 ? file.type : "application/octet-stream",
          });
        if (!error && data) {
          const { data: publicUrl } = sb.storage.from(bucket).getPublicUrl(data.path);
          return publicUrl.publicUrl;
        }
        lastErr = error;
        if (attempt < retries) {
          // exponential backoff: 800ms, 1600ms, ...
          const delay = 800 * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
      const message = typeof (lastErr as { message?: string })?.message === "string"
        ? (lastErr as { message: string }).message
        : "Upload failed";
      console.error("Upload error:", message);
      throw new Error("Image upload failed: " + message);
    }

    // Ensure local uploads dir exists (for fallback)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Helper: local fallback save
    async function saveLocally(file: File, i: number): Promise<string> {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}-${i}-${safeName}`;
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      return `/uploads/${filename}`;
    }

    // Upload sequentially to avoid parallel connection spikes/timeouts
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadPath = `images/${Date.now()}-${i}-${file.name}`;
      try {
        const url = await uploadWithRetry("instruments", uploadPath, file);
        imageUrls.push(url);
      } catch {
        // Fallback to local storage
        const localUrl = await saveLocally(file, i);
        console.warn("Supabase upload failed, saved locally:", localUrl);
        imageUrls.push(localUrl);
      }
    }

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
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
