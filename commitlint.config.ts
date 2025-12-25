// Copyright (c) 2017-2025 Booz Allen Hamilton Inc. All Rights Reserved.
import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  defaultIgnores: true,
  ignores: [
    (message) => message.includes('Co-authored-by'),
  ],
  rules: {
    // Enforce conventional commit types used by semantic-release
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    // Allow slightly longer headers to accommodate descriptive fixes
    'header-max-length': [2, 'always', 120],

    // Overrides / relaxations
    'subject-case': [0], // disable case checking for subject
    'body-max-line-length': [0], // allow commit body to be as long as needed
  },
};

export default config;
