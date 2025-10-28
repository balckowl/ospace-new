import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    domains: [
      "www.google.com",
      "images.pexels.com",
      "openweathermap.org",
      "api.microlink.io",
      "lh3.googleusercontent.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        port: "",
        pathname: "/s2/favicons/**",
      },
    ],
  },
};

export default nextConfig;
