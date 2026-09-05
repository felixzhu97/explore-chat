/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    pool: "threads",
    reporters: process.env.CI ? ["verbose"] : ["default", "verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "__test__/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        ".next/**",
        "app/**",
        "src/shared/locales/**",
        "src/shared/i18n.ts",
        "src/layout/providers/**",
        "src/shared/types/**",
        "emotion-registry.tsx",
        "src/chat/messagesSlice.ts",
        "src/chat/contactsSlice.ts",
        "src/calls/calls.service.ts",
        "src/layout/notificationsSlice.ts",
        "src/auth/storage.ts",
        "src/chat/websocket.ts",
        "src/calls/web-rtc-config.ts",
        "src/chat/mock-data.ts",
        "src/profile/users.service.ts",
      ],
      thresholds: {
        global: {
          statements: 43,
          branches: 80,
          functions: 55,
          lines: 43,
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@\/layout\/(.*)/,
        replacement: path.resolve(__dirname, "./src/layout/$1"),
      },
      {
        find: /^@\/auth\/(.*)/,
        replacement: path.resolve(__dirname, "./src/auth/$1"),
      },
      {
        find: /^@\/feed\/(.*)/,
        replacement: path.resolve(__dirname, "./src/feed/$1"),
      },
      {
        find: /^@\/chat\/(.*)/,
        replacement: path.resolve(__dirname, "./src/chat/$1"),
      },
      {
        find: /^@\/explore\/(.*)/,
        replacement: path.resolve(__dirname, "./src/explore/$1"),
      },
      {
        find: /^@\/reels\/(.*)/,
        replacement: path.resolve(__dirname, "./src/reels/$1"),
      },
      {
        find: /^@\/search\/(.*)/,
        replacement: path.resolve(__dirname, "./src/search/$1"),
      },
      {
        find: /^@\/profile\/(.*)/,
        replacement: path.resolve(__dirname, "./src/profile/$1"),
      },
      {
        find: /^@\/calls\/(.*)/,
        replacement: path.resolve(__dirname, "./src/calls/$1"),
      },
      {
        find: /^@\/ai\/(.*)/,
        replacement: path.resolve(__dirname, "./src/ai/$1"),
      },
      {
        find: /^@\/secondary\/(.*)/,
        replacement: path.resolve(__dirname, "./src/secondary/$1"),
      },
      {
        find: /^@\/shared\/(.*)/,
        replacement: path.resolve(__dirname, "./src/shared/$1"),
      },
      { find: /^@\//, replacement: path.resolve(__dirname, "./") + "/" },
    ],
  },
});
