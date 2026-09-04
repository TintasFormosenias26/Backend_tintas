import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import ENV from "../config/configEnv";

type UploadKind = "image" | "book";
const TEMP_DIR = path.join(process.cwd(), "uploads");

const policies = {
  image: {
    maxBytes: ENV.UPLOAD_IMAGE_MAX_BYTES,
    extensions: new Set([".jpg", ".jpeg", ".png", ".webp"]),
    mimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]),
  },
  book: {
    maxBytes: ENV.UPLOAD_BOOK_MAX_BYTES,
    extensions: new Set([".pdf", ".mp3", ".m4a", ".mp4"]),
    mimeTypes: new Set(["application/pdf", "audio/mpeg", "audio/mp4", "video/mp4"]),
  },
} as const;

function storage() {
  return multer.diskStorage({
    destination: (_req, _file, callback) => {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      callback(null, TEMP_DIR);
    },
    filename: (_req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

export function declaredFileIsAllowed(file: Pick<Express.Multer.File, "originalname" | "mimetype">, kind: UploadKind) {
  const policy = policies[kind];
  return policy.extensions.has(path.extname(file.originalname).toLowerCase() as never)
    && policy.mimeTypes.has(file.mimetype.toLowerCase() as never);
}

export function fileSizeIsAllowed(size: number, kind: UploadKind): boolean {
  return Number.isSafeInteger(size) && size >= 0 && size <= policies[kind].maxBytes;
}

function rejectDisallowedFile(file: Express.Multer.File, kind: UploadKind, callback: multer.FileFilterCallback) {
  if (declaredFileIsAllowed(file, kind)) return callback(null, true);
  return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
}

export function imageUpload(field: string) {
  return multer({
    storage: storage(),
    limits: { fileSize: policies.image.maxBytes, files: 1, fields: 30 },
    fileFilter: (_req, file, callback) => rejectDisallowedFile(file, "image", callback),
  }).single(field);
}

export function bookUpload() {
  return multer({
    storage: storage(),
    limits: { fileSize: policies.book.maxBytes, files: 2, fields: 40 },
    fileFilter: (_req, file, callback) => {
      const kind: UploadKind = file.fieldname === "img" ? "image" : "book";
      rejectDisallowedFile(file, kind, callback);
    },
  }).fields([{ name: "file", maxCount: 1 }, { name: "img", maxCount: 1 }]);
}

export function signatureMatches(bytes: Buffer, kind: UploadKind, mime: string): boolean {
  const hex = bytes.toString("hex");
  if (kind === "image") {
    if (mime === "image/jpeg") return hex.startsWith("ffd8ff");
    if (mime === "image/png") return hex.startsWith("89504e470d0a1a0a");
    if (mime === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  }
  if (mime === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (mime === "audio/mpeg") return bytes.subarray(0, 3).toString() === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  if (mime === "audio/mp4" || mime === "video/mp4") return bytes.subarray(4, 8).toString() === "ftyp";
  return false;
}

function uploadedFiles(req: Request): Express.Multer.File[] {
  if (req.file) return [req.file];
  return Object.values((req.files ?? {}) as Record<string, Express.Multer.File[]>).flat();
}

export async function cleanupUploadedFiles(req: Request): Promise<void> {
  await Promise.all(uploadedFiles(req).map((file) => fs.promises.unlink(file.path).catch(() => undefined)));
}

export async function validateUploadSignatures(req: Request, res: Response, next: NextFunction) {
  try {
    for (const file of uploadedFiles(req)) {
      const kind: UploadKind = file.fieldname === "img" || file.fieldname === "avatar" || file.fieldname === "photo" || file.fieldname === "avatars" ? "image" : "book";
      if (!fileSizeIsAllowed(file.size, kind)) throw new Error("FILE_TOO_LARGE");
      const handle = await fs.promises.open(file.path, "r");
      const bytes = Buffer.alloc(16);
      await handle.read(bytes, 0, bytes.length, 0);
      await handle.close();
      if (!signatureMatches(bytes, kind, file.mimetype.toLowerCase())) throw new Error("INVALID_FILE_SIGNATURE");
    }
    next();
  } catch {
    await cleanupUploadedFiles(req);
    res.status(400).json({ code: "INVALID_UPLOAD", message: "El archivo no cumple la política de formato o tamaño." });
  }
}
