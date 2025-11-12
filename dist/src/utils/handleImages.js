"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBase64Image = saveBase64Image;
// utils/handleImages.ts
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const ALLOWED_TYPES = ["png", "jpeg", "jpg", "webp", "gif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
async function saveBase64Image(base64, userId, req, folder) {
    if (!base64.startsWith("data:image/")) {
        throw new Error("Invalid Base64 format: must start with 'data:image/'");
    }
    base64 = base64.replace(/\s/g, "");
    const [header, data] = base64.split(",");
    if (!header || !data)
        throw new Error("Invalid Base64 format");
    const typeMatch = header.match(/data:image\/([a-zA-Z0-9+]+);base64/);
    if (!typeMatch)
        throw new Error("Unsupported image type");
    const ext = typeMatch[1].toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
        throw new Error(`Unsupported format. Use: ${ALLOWED_TYPES.join(", ")}`);
    }
    let buffer;
    try {
        buffer = Buffer.from(data, "base64");
    }
    catch {
        throw new Error("Invalid Base64 encoding");
    }
    if (buffer.length > MAX_SIZE) {
        throw new Error("Image too large. Max 2MB");
    }
    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`;
    const rootDir = path_1.default.resolve(__dirname, "../../");
    const uploadPath = path_1.default.join(rootDir, "uploads", folder, fileName);
    await promises_1.default.mkdir(path_1.default.dirname(uploadPath), { recursive: true });
    await promises_1.default.writeFile(uploadPath, buffer);
    const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
    const host = req.get("host") || "localhost:3000";
    return `${protocol}://${host}/uploads/${folder}/${fileName}`;
}
