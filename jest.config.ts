import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['**/src/**/*.spec.ts', '**/test/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/web/'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        diagnostics: {
          // Ignore TS2307 "cannot find module" for packages not installed locally.
          // The moduleNameMapper below provides mock implementations at test time.
          ignoreCodes: ['TS2307'],
        },
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^nodemailer$': '<rootDir>/src/__mocks__/nodemailer.ts',
    '^@nestjs/axios$': '<rootDir>/src/__mocks__/nestjs-axios.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
};

export default config;
