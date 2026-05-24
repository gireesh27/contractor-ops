import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

function cloudinaryReady() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

export async function uploadFile(file: File, folder: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (file.type.startsWith("image/") && !imageTypes.includes(file.type)) throw new Error("Unsupported image format. Use JPG, PNG, or WEBP.");
  const maxSize = file.type.startsWith("image/") ? 5 * 1024 * 1024 : 12 * 1024 * 1024;
  if (bytes.length > maxSize) throw new Error(file.type.startsWith("image/") ? "Image exceeds 5MB limit." : "File exceeds 12MB limit.");

  if (cloudinaryReady()) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret
    });

    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `contractorops/${folder}`,
      resource_type: "auto"
    });

    return {
      url: result.secure_url,
      storageKey: result.public_id,
      provider: "cloudinary",
      mimeType: file.type,
      size: file.size
    };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  await writeFile(path.join(uploadDir, safeName), bytes);

  return {
    url: `/uploads/${folder}/${safeName}`,
    storageKey: safeName,
    provider: "local-dev",
    mimeType: file.type,
    size: file.size
  };
}
