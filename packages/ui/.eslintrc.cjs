module.exports = {
  root: true,
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  env: { es2021: true, browser: true, node: true, jest: true },
  ignorePatterns: ["node_modules/", "dist/"],
};