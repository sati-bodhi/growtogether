module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-unused-vars": "warn",
    "max-len": ["warn", { "code": 100 }]
  },
};
