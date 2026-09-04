import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "src/prisma/generated/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      // Existing typing debt stays visible in CI while security-critical checks and
      // TypeScript compilation remain blocking.
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "no-useless-catch": "warn",
    },
  },
);
