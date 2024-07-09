/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'uddenmrxulkqkllfwxlp.supabase.co',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
