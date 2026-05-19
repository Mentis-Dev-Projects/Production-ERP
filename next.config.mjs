/** @type {import('next').NextConfig} */
function normalizeOriginEntry(origin) {
  const value = origin.trim()
  if (!value) return null

  if (value.includes("://")) {
    try {
      return new URL(value).hostname
    } catch {
      return value.replace(/^https?:\/\//, "").split("/")[0].split(":")[0]
    }
  }

  return value.split("/")[0].split(":")[0]
}

const configuredOrigins = process.env.MENTIS_ALLOWED_DEV_ORIGINS
  ? process.env.MENTIS_ALLOWED_DEV_ORIGINS.split(",").map(normalizeOriginEntry).filter(Boolean)
  : []

const allowedDevOrigins = Array.from(
  new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "192.0.0.154",
    "*.trycloudflare.com",
    "*.cfargotunnel.com",
    ...configuredOrigins,
  ]),
)

const nextConfig = {
  allowedDevOrigins,
  experimental: {
    serverActions: {
      allowedOrigins: allowedDevOrigins,
    },
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
