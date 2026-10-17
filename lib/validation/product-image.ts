const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

function readAscii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCodePoint(...bytes.slice(start, end));
}

function matchesSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return readAscii(bytes, 0, 8) === "\x89PNG\r\n\x1a\n";
  if (mimeType === "image/webp") return readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 12) === "WEBP";
  if (mimeType === "image/avif") {
    return readAscii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(readAscii(bytes, 8, 12));
  }
  return false;
}

export function getProductImageExtension(mimeType: string, size: number, signature: Uint8Array) {
  if (size <= 0 || size > MAX_PRODUCT_IMAGE_SIZE) return null;
  const extension = IMAGE_EXTENSIONS[mimeType as keyof typeof IMAGE_EXTENSIONS];
  if (!extension || !matchesSignature(mimeType, signature)) return null;
  return extension;
}
