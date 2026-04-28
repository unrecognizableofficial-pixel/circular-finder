const rawBackendOrigin = process.env.BACKEND_ORIGIN?.trim() || "127.0.0.1:8000";
const backendOrigin = rawBackendOrigin.startsWith("http://") || rawBackendOrigin.startsWith("https://") ? rawBackendOrigin : `http://${rawBackendOrigin}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`
      },
      {
        source: "/static/:path*",
        destination: `${backendOrigin}/static/:path*`
      }
    ];
  }
};

export default nextConfig;
