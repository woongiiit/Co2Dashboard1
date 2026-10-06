import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Windows 원클릭 EXE / portable 배포용 최소 서버 번들 */
  output: "standalone",
};

export default nextConfig;
