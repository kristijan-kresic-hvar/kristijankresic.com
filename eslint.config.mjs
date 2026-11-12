import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { configs as tsConfigs } from 'typescript-eslint';
import { createSlopConfig } from 'eslint-plugin-slop';

const config = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tsConfigs.strictTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      // Numbers in template strings and one-line arrow handlers are idiomatic React; keep the rest strict.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  ...createSlopConfig({ cwd: import.meta.dirname }),
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', '.gauntlet/**', '.impeccable/**', '.playwright-cli/**'],
  },
]);

export default config;
