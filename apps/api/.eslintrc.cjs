module.exports = {
  root: true,
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  rules: { "no-unused-vars": "off", "@typescript-eslint/no-unused-vars": "off" },
  env: { es2021: true, node: true },
  ignorePatterns: ["dist/", "node_modules/"],
};