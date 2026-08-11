/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fonts are loaded via a runtime <link> in app/layout.tsx, so we skip
  // Next's build-time font inlining (which would try to fetch Google Fonts
  // during the build). This keeps builds clean in restricted networks.
  optimizeFonts: false,
};
export default nextConfig;
