import eslintPluginImport from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

// If the import is not a function or iterable, try spreading its default export or .configs property if present

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'no-console': 'warn',
      'import/no-unresolved': 'off',
    },
  },
  {
    rules: { ...eslintConfigPrettier.rules },
  },
];
