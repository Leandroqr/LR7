export function isRemoteProductImagePath(storagePath: string) {
  try {
    const protocol = new URL(storagePath).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveProductImageUrl(storagePath: string, getStorageUrl: (path: string) => string) {
  return isRemoteProductImagePath(storagePath) ? storagePath : getStorageUrl(storagePath);
}
