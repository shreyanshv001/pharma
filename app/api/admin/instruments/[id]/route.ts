import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { Prisma, Category } from '@prisma/client';
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

async function verifyAuth(req: NextRequest) {
  try {
    const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
    if (!token) {
      return { error: "Unauthorized", status: 401 };
    }

    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
      return null; // valid
    } catch {
      return { error: "Invalid token", status: 403 };
    }
  } catch {
    return { error: "Auth check failed", status: 500 };
  }
}

// GET instrument by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await verifyAuth(req);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const instrument = await db.instrument.findUnique({ where: { id } });
    if (!instrument) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(instrument);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch instrument" }, { status: 500 });
  }
}

// UPDATE instrument
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  // ✅ Verify auth
  const auth = await verifyAuth(req);
  if (auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await req.formData();

    // ✅ Supabase setup
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    // Extract fields
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const discription = formData.get("discription") as string;
    const principle = formData.get("principle") as string;
    const sop = formData.get("sop") as string;
    const ichGuideline = formData.get("ichGuideline") as string;
    const procedure = formData.get("procedure") as string;
    const advantages = formData.get("advantages") as string;
    const limitations = formData.get("limitations") as string;
    const specifications = formData.get("specifications") as string;
    const videoUrl = formData.get("videoUrl") as string;

    // ✅ Upload to Supabase Storage
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

    // ✅ Local fallback (development only)
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

    // Handle new image uploads (from "newImages")
    const newFiles = formData.getAll("newImages").filter((f): f is File => f instanceof File);
    const uploadedImages: string[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const url = await uploadToSupabase("instruments", file, i);
        uploadedImages.push(url);
      } catch (err) {
        console.error("Supabase upload failed:", err);
        if (localFallback) {
          const localUrl = await saveLocally(file, i);
          console.warn("Saved locally:", localUrl);
          uploadedImages.push(localUrl);
        } else {
          throw new Error("Image upload failed in production.");
        }
      }
    }

    // Get existing images from formData
    let existingImages: string[] = [];
    const existingImagesRaw = formData.get("existingImages");
    if (typeof existingImagesRaw === "string") {
      try {
        existingImages = JSON.parse(existingImagesRaw);
      } catch {
        existingImages = [];
      }
    }

    // Merge existing and new images
    const allImages = [...existingImages, ...uploadedImages];

    // Convert category string to enum
    const categoryEnum = Category[category as keyof typeof Category];

    // Update record in Prisma
    const updated = await db.instrument.update({
      where: { id },
      data: {
        name,
        category: categoryEnum,
        discription,
        principle,
        sop,
        ichGuideline,
        procedure,
        advantages,
        limitations,
        specifications,
        videoUrl,
        imageUrls: allImages,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Update error [${error.name}]: ${error.message}\n${error.stack}`);
    } else {
      console.error("Update error (unknown):", error);
    }
    return NextResponse.json(
      { error: "Failed to update instrument" },
      { status: 500 }
    );
  }
}

// DELETE instrument
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await verifyAuth(req);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // First check if the instrument exists
    const instrument = await db.instrument.findUnique({
      where: { id },
      include: {
        experiments: true
      }
    });

    if (!instrument) {
      return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
    }

    // Delete in a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // First delete all experiment-instrument relationships
      await tx.experimentOnInstrument.deleteMany({
        where: {
          instrumentId: id
        }
      });

      // Then delete the instrument
      await tx.instrument.delete({
        where: { id }
      });
    });

    return NextResponse.json({ message: "Instrument deleted successfully" });
  } catch (error) {
    console.error("Delete instrument error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json({ 
          error: "Cannot delete instrument because it is being used by one or more experiments. Please remove the instrument from all experiments first.",
          details: error.message 
        }, { status: 409 });
      }
    }
    
    return NextResponse.json(
      { error: "Failed to delete instrument" }, 
      { status: 500 }
    );
  }
}
