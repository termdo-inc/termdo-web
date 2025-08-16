import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  globalIgnores(["out"]),
  {
    files: ["source/**/*.ts", "source/**/*,tsx", "vite.config.ts"],
    extends: [
      eslint.configs.all,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "always",
        },
      ],
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "class-methods-use-this": "off",
      "consistent-return": "off",
      "id-length": "off",
      "max-classes-per-file": "off",
      "max-params": "off",
      "max-statements": "off",
      "new-cap": "off",
      "no-console": "off",
      "no-magic-numbers": "off",
      "no-plusplus": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-void": "off",
      "one-var": "off",
      "prefer-destructuring": "off",
      "sort-imports": "off",
      "sort-keys": "off",
    },
  },
]);
