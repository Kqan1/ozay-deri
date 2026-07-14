import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    allowedDevOrigins: ["192.168.0.22"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            {
                protocol: "https",
                hostname: "utfs.io",
            },
        ],
    },
    logging: {
        browserToTerminal: true,
    },
};

export default nextConfig;
