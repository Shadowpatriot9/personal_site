/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  async redirects() {
    // Legacy v1 routes used mixed-case paths; canonical routes are lowercase.
    return [
      { source: '/projects/NFI', destination: '/projects/nfi', permanent: true },
      { source: '/projects/EL', destination: '/projects/el', permanent: true },
      { source: '/projects/Naton', destination: '/projects/naton', permanent: true },
    ];
  },
};

export default nextConfig;
