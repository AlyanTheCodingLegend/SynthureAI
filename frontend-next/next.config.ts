import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'nmugqsldvxpcaouhynau.supabase.co',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
