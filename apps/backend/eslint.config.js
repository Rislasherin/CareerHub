const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  Buffer: "readonly",
  require: "readonly",
  module: "readonly",
  exports: "readonly",
  Promise: "readonly",
  Map: "readonly",
  Set: "readonly",
  NodeJS: "readonly",
  Express: "readonly",
};

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: nodeGlobals
    }
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      globals: nodeGlobals
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "no-useless-escape": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-empty": "off",
      "no-undef": "off",
    },
  },
];
