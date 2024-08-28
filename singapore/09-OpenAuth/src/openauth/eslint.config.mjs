import unocss from '@unocss/eslint-config/flat'
import { defineConfig } from 'eslint-config-hyoban'

export default defineConfig(
  {
    react: 'vite',
    restrictedSyntax: ['jsx', 'tsx'],
    strict: true,
  },
  {
    ...unocss,
  },
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@eslint-react/naming-convention/filename-extension': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-node-protocol': 'off',

      'func-names': 'off',
      'max-params': 'off',
      'require-await': 'off',

      'no-await-in-loop': 'off',
      'no-console': 'warn',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': 'off',
      'react-compiler/react-compiler': 'off',
    },
  },
  {
    ignores: ['**/*.d.ts', 'node_modules/', '**/dist', 'coverage/', '**/test/'],
  },
)
