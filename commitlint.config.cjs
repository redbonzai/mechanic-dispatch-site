module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow longer lines for dependency update commit bodies
    'body-max-line-length': [2, 'always', 200],
  },
};




