import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { Organization, User } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),

  image: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("/uploads/profiles/") ||
        /^https?:\/\//.test(value),
      "Invalid profile image URL.",
    )
    .optional()
    .or(z.literal("")),

  designation: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(240).optional().or(z.literal("")),

  organizationName: z.string().trim().min(2).optional().or(z.literal("")),
  gstNumber: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),

  notificationPreferences: z.string().optional(),
  userPreferences: z.string().optional(),
});

function isLocalProfileImage(imageUrl: string | undefined | null) {
  return Boolean(imageUrl && imageUrl.startsWith("/uploads/profiles/"));
}

async function deleteOldLocalProfileImage(imageUrl: string | undefined | null) {
  if (!isLocalProfileImage(imageUrl)) return;

  try {
    const fileName = path.basename(imageUrl || "");
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles",
      fileName,
    );

    await unlink(filePath);
  } catch {
    // Ignore cleanup failure. Profile update should not fail because old image deletion failed.
  }
}

async function saveProfileImage(file: File, oldImageUrl?: string) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size must be below 5 MB.");
  }

  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    throw new Error("Invalid image type.");
  }

  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "profiles",
  );

  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  await deleteOldLocalProfileImage(oldImageUrl);

  return `/uploads/profiles/${fileName}`;
}

function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const tenant = await getTenantContext({ required: true });

    if (!tenant) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("imageFile");

    const body = Object.fromEntries(
      Array.from(formData.entries()).filter(([key]) => key !== "imageFile"),
    );

    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          details: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    const user = await User.findOne({
      _id: objectId(tenant.userId),
      deletedAt: null,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    const updates = parsed.data;

    if (updates.name !== undefined) {
      user.name = updates.name;
    }

    if (updates.phone !== undefined) {
      user.phone = updates.phone;
    }

    if (updates.designation !== undefined) {
      user.designation = updates.designation;
    }

    if (updates.location !== undefined) {
      user.location = updates.location;
    }

    if (updates.bio !== undefined) {
      user.bio = updates.bio;
    }

    if (updates.notificationPreferences !== undefined) {
      user.notificationPreferences = parseJsonField(
        updates.notificationPreferences,
        {},
      );
    }

    if (updates.userPreferences !== undefined) {
      user.preferences = parseJsonField(updates.userPreferences, {});
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      user.image = await saveProfileImage(imageFile, user.image);
    } else if (updates.image !== undefined) {
      if (!updates.image) {
        await deleteOldLocalProfileImage(user.image);
        user.image = undefined;
      } else {
        user.image = updates.image;
      }
    }

    await user.save();

    const canManageOrganization = [
      "Super Admin",
      "Organization Owner",
      "Owner",
      "Admin",
    ].includes(tenant.role);

    if (canManageOrganization) {
      const organizationUpdates: Record<string, string> = {};

      if (updates.organizationName) {
        organizationUpdates.name = updates.organizationName;
      }

      if (updates.gstNumber !== undefined) {
        organizationUpdates.gstNumber = updates.gstNumber;
      }

      if (updates.city !== undefined) {
        organizationUpdates.city = updates.city;
      }

      if (updates.state !== undefined) {
        organizationUpdates.state = updates.state;
      }

      if (Object.keys(organizationUpdates).length > 0) {
        await Organization.updateOne(
          {
            _id: objectId(tenant.organizationId),
            deletedAt: null,
          },
          {
            $set: organizationUpdates,
          },
        );
      }
    }

    return NextResponse.json({
      data: {
        ok: true,
        image: user.image || "",
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to update profile.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}