// Copyright (c) 2017-2025 Booz Allen Hamilton Inc. All Rights Reserved.
import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],

  // Keep default ignore behavior (e.g., merge commits)
  defaultIgnores: true,

  // Ignore specific commit patterns/messages
  ignores: [
    // Ignore co-author footer lines (common in PR merges / GitHub UI)
    (message) => message.includes('Co-authored-by'),

    // Ignore semantic-release version bump commits
    // Example: "chore(release): 1.8.0 [skip ci]"
    (message) => message.startsWith('chore(release):'),
  ],

  rules: {
    // Enforce conventional commit types used by semantic-release
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],

    // Allow slightly longer headers to accommodate descriptive fixes
    'header-max-length': [2, 'always', 120],

    // Overrides / relaxations
    'subject-case': [0], // disable case checking for subject
    'body-max-line-length': [0], // allow commit body to be as long as needed
  },
};

export default config;
