module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  env: { es2021: true, browser: true, node: true },
  ignorePatterns: ["node_modules/", ".expo/", "dist/"],
};