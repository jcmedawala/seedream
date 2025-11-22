/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'srydywfjnmlmatmtafpq.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'd1q70pf5vjeyhc.cloudfront.net',
            },
        ],
    },
};

module.exports = nextConfig;
