import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'build/**',
      // Next.js generates and overwrites this; never hand-edited or linted.
      'next-env.d.ts',
      // iCloud/sync "conflict copy" artifacts (e.g. "Foo 2.tsx").
      '**/* [0-9].*',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Pragmatic `any` in server/data-normalization code — keep it visible
      // as a warning rather than failing the build.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
