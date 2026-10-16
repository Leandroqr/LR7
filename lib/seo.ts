export function serializeJsonLd(value: unknown) {
  return (JSON.stringify(value) ?? "null").replaceAll("<", String.raw`\u003c`);
}