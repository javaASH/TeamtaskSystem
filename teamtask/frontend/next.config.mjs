/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://teamtasksystem.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
