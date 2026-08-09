/** Server-side image upload validation (MIME allowlist + magic bytes). */

export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

const MAX_UPLOAD_BYTES = 5_000_000;

export type ValidatedImageUpload =
  | {
      ok: true;
      mime: AllowedImageMime;
      ext: "jpg" | "png" | "webp";
      buffer: Buffer;
      size: number;
    }
  | { ok: false; error: string };

function detectImageMime(buffer: Buffer): AllowedImageMime | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

function extForMime(mime: AllowedImageMime): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/**
 * Validate base64 upload bytes. Trusts magic bytes over the client MIME string.
 * Client MIME must still be in the allowlist and match the detected type.
 */
export function validateImageUploadBase64(opts: {
  dataBase64: string;
  claimedMime: string;
  claimedSize?: number;
}): ValidatedImageUpload {
  const claimedMime = opts.claimedMime.trim().toLowerCase();
  if (!ALLOWED_IMAGE_MIMES.includes(claimedMime as AllowedImageMime)) {
    return { ok: false, error: "Only JPG, PNG, or WebP allowed." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(opts.dataBase64, "base64");
  } catch {
    return { ok: false, error: "Invalid file data." };
  }

  if (!buffer.length) {
    return { ok: false, error: "Empty file." };
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File too large (max 5MB)." };
  }
  if (
    typeof opts.claimedSize === "number" &&
    opts.claimedSize > 0 &&
    Math.abs(opts.claimedSize - buffer.length) > 512
  ) {
    return { ok: false, error: "File size mismatch." };
  }

  const detected = detectImageMime(buffer);
  if (!detected) {
    return { ok: false, error: "File content is not a valid JPG, PNG, or WebP image." };
  }
  if (detected !== claimedMime) {
    return { ok: false, error: "File type does not match the uploaded content." };
  }

  return {
    ok: true,
    mime: detected,
    ext: extForMime(detected),
    buffer,
    size: buffer.length,
  };
}

export function safeUploadBasename(name: string, ext: "jpg" | "png" | "webp") {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  return `${Date.now()}-${base}.${ext}`.replace(/\.(jpg|png|webp)\.(jpg|png|webp)$/i, ".$2");
}
