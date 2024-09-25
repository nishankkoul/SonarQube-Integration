// eslint.config.js
module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        // Add any other configurations you want to extend
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        // Customize your rules here
        'no-console': 'off', // Example rule
    },
};
