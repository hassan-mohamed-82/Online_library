// utils/handleImages.ts
import path from "path";
import fs from "fs/promises";
import { Request } from "express";

const ALLOWED_TYPES = ["png", "jpeg", "jpg", "webp", "gif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function saveBase64Image(
  base64: string,
  userId: string,
  req: Request,
  folder: string
): Promise<string> {
  if (!base64.startsWith("data:image/")) {
    throw new Error("Invalid Base64 format: must start with 'data:image/'");
  }

  base64 = base64.replace(/\s/g, "");
  const [header, data] = base64.split(",");
  if (!header || !data) throw new Error("Invalid Base64 format");

  const typeMatch = header.match(/data:image\/([a-zA-Z0-9+]+);base64/);
  if (!typeMatch) throw new Error("Unsupported image type");

  const ext = typeMatch[1].toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) {
    throw new Error(`Unsupported format. Use: ${ALLOWED_TYPES.join(", ")}`);
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch {
    throw new Error("Invalid Base64 encoding");
  }

  if (buffer.length > MAX_SIZE) {
    throw new Error("Image too large. Max 2MB");
  }

  const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`;
  const rootDir = path.resolve(__dirname, "../../");
  const uploadPath = path.join(rootDir, "uploads", folder, fileName);

  await fs.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.writeFile(uploadPath, buffer);

  const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
  const host = req.get("host") || "localhost:3000";

  return `${protocol}://${host}/uploads/${folder}/${fileName}`;
}