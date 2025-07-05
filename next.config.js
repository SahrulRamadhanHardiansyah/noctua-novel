/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Konfigurasi yang sudah ada untuk gambar novel
      {
        protocol: "https",
        hostname: "bacalightnovel.co",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      // Konfigurasi untuk gambar dari Clerk
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
