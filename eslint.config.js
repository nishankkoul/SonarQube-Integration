// eslint.config.js
import globals from "globals";

export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                myCustomGlobal: "readonly", // Replace with your custom globals if any
            },
        },
        // Add your rules and other configurations here
        rules: {
            // Example rule
            "no-unused-vars": "warn",
        },
    },
];
