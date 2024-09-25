// .eslintrc.cjs
const { defineConfig } = require('eslint');

module.exports = defineConfig({
  languageOptions: {
    globals: {
      window: 'readonly', // Example global
      document: 'readonly', // Example global
    },
    parserOptions: {
      ecmaVersion: 2021, // Specify ECMAScript version
    },
  },
  rules: {
    // Define your custom rules here
    'no-unused-vars': 'warn', // Example rule
    'eqeqeq': 'error', // Example rule
  },
});
