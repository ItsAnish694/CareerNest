import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // "/api/v1": "http://127.0.0.1:8000",
      "/api/v1": "https://careernest-backend-plwn.onrender.com",
    },
  },
});
