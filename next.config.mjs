/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
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
    //cacheHandler: require.resolve('./cache-handler.js')
};

export default nextConfig;
