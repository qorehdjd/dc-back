module.exports = {
  extends: ['airbnb-base', 'plugin:node/recommended', 'prettier'],
  rules: {
    'no-console': 'off',
    'no-return-await': 'off',
  },
  parser: 'babel-parser',
};
