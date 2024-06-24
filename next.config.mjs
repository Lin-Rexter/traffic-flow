/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {},
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.githubusercontent.com',
                port: '',
            },
        ],
    },
};

export default nextConfig;
