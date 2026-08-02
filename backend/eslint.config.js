const { defineConfig, globalIgnores } = require('eslint/config');
const eslint = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  globalIgnores(['coverage/*', 'dist/*']),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
