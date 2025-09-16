import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { Prisma, Category } from '@prisma/client';
import path from "path/win32";
import { writeFile } from "fs/promises";

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
  const { id } =await params;

  // ✅ Verify auth
  const auth = await verifyAuth(req);
  if (auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await req.formData();

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

    // Handle new image uploads (from "newImages")
    const newFiles = formData.getAll("newImages") as File[];
    const uploadedImages: string[] = [];

    if (newFiles.length > 0) {
      for (const file of newFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), "public/uploads", filename);
        await writeFile(filePath, buffer);
        uploadedImages.push(`/uploads/${filename}`);
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
    console.error("Update error:", error);
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
