import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = Object.fromEntries(
    ["/auth", "/medicines", "/uploads", "/users", "/prescriptions"].map(
      (path) => [
        path,
        {
          target:
            process.env.API_PROXY_TARGET ||
            env.API_PROXY_TARGET ||
            "http://localhost:3000",
          changeOrigin: true,
        },
      ],
    ),
  );
  return {
    plugins: [react()],
    server: { host: "0.0.0.0", proxy },
    preview: { host: "0.0.0.0", proxy },
  };
});
