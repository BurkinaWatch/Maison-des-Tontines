module.exports = {
  extends: ['./base.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
  },
  plugins: ['react-native'],
  rules: {
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
  },
};
