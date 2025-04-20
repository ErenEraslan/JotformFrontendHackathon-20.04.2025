/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', 
      'placehold.co',
      'www.jotform.com',
      'cdn.jotfor.ms',
      'www.placehold.co',
      'images.pexels.com',
      'assets.jotform.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig; 