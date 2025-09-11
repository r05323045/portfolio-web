// ESLint 9+ Flat Config for Next.js + TS + Prettier
import path from "node:path";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";

// Convert legacy "extends" (like next/core-web-vitals, prettier) into flat configs
const compat = new FlatCompat({ baseDirectory: path.resolve() });

export default [
  // Ignores
  {
    ignores: ["**/.next/**", "node_modules/**", "dist/**", "out/**", ".vercel/**", ".turbo/**"],
  },

  // Next.js recommended + Core Web Vitals, and disable stylistic rules (Prettier handles formatting)
  ...compat.extends("next/core-web-vitals", "prettier"),

  // Base JS/TS rules
  js.configs.recommended,
  ...tseslint.configs.recommended, // or recommendedTypeChecked + parserOptions.project if你要型別感知規則

  // TypeScript & JavaScript files
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      // 若要型別感知規則，打開以下設定（要有 tsconfig.json）
      // parser: tseslint.parser,
      // parserOptions: { projectService: true, tsconfigRootDir: path.resolve() },
    },
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // 一般建議
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 未使用清理
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // 匯入排序
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
];
