import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/main.tsx"
    }
  },
  html: {
    title: "Bellspire"
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    historyApiFallback: true
  },
  tools: {
    postcss: {
      postcssOptions: {
        config: false,
        plugins: []
      }
    }
  }
});
