import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'lib/generated/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Product images are arbitrary URLs from the database and the project runs
      // with images.unoptimized, so next/image buys nothing here.
      '@next/next/no-img-element': 'off',
    },
  },
]
