import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (supabaseUrl) {
  const { protocol, hostname } = new URL(supabaseUrl);
  remotePatterns.push({
    protocol: protocol === "http:" ? "http" : "https",
    hostname,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      { source: "/catalogo", destination: "/tienda", permanent: true },
      { source: "/producto/:slug", destination: "/productos/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
