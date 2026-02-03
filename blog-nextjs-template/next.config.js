/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nlewrgmcawzcdazhfiyy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect trailing slashes
      {
        source: '/:slug+/',
        destination: '/:slug+',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
