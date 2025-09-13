// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Work around mismatched type definitions between eslint and typescript-eslint for the prettier recommended config
// by casting the imported flat config to "any". This is safe at runtime because it's already a valid flat config object.
const prettierRecommended = /** @type {any} */ (eslintPluginPrettierRecommended);

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
  'src/Space_EngineERS/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierRecommended,
  {
  languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/require-await': 'warn',
      'no-var': 'error',
      'no-case-declarations': 'warn'
    },
  },
);