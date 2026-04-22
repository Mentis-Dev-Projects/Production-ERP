/** @type {import('next').NextConfig} */
function normalizeOriginEntry(origin) {
  const value = origin.trim()
  if (!value) return null

  if (value.includes("://")) {
    try {
      return new URL(value).host
    } catch {
      return value.replace(/^https?:\/\//, "")
    }
  }

  return value
}

const configuredOrigins = process.env.MENTIS_ALLOWED_DEV_ORIGINS
  ? process.env.MENTIS_ALLOWED_DEV_ORIGINS.split(",").map(normalizeOriginEntry).filter(Boolean)
  : []

const allowedDevOrigins = Array.from(
  new Set(["localhost", "127.0.0.1", "192.0.0.154", ...configuredOrigins]),
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
