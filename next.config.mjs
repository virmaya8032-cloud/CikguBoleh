/** @type {import('next').NextConfig} */

// Versi auto: guna SHA commit Vercel (berubah setiap deploy) atau cap tarikh bila membina tempatan.
const sha = process.env.VERCEL_GIT_COMMIT_SHA;
const stamp = new Date();
const pad = (n) => String(n).padStart(2, "0");
const dateStr = `${stamp.getFullYear()}.${pad(stamp.getMonth() + 1)}.${pad(stamp.getDate())}`;
const BUILD_VERSION = sha ? `${dateStr}-${sha.slice(0, 7)}` : dateStr;

const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  env: {
    NEXT_PUBLIC_BUILD_VERSION: BUILD_VERSION,
  },
};
export default nextConfig;
