/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // If you later want type-aware rules, add:
    // project: ['./tsconfig.json'],
    // tsconfigRootDir: __dirname,
  },
  settings: {
    react: { version: 'detect' },
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    // Uncomment if you want accessibility checks:
    // 'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    // 'jsx-a11y', // uncomment if you turn on the a11y extends above
  ],
  rules: {
    // your originals (kept)
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // deprecated a11y rule; keep off if you don’t use it
    'jsx-a11y/accessible-emoji': 'off',
    'jsx-a11y/anchor-is-valid': 'off',

    // prefer TS-aware unused vars rule; ignore args starting with underscore
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // optional: if you don’t want to enforce explicit return types
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  overrides: [
    {
      files: ['*.js', '*.cjs'],
      parser: undefined,
      plugins: ['react', 'react-hooks'],
    },
  ],
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    '.vite/',
    '*.d.ts',
  ],
}
