import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx", ".json", ".css"],
  },
  server: {
    port: 5173,
    host: true,
  },
});