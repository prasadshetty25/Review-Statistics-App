module.exports = {
  displayName: 'reviews-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/reviews-service',
  testMatch: [
    '**/__tests__/**/*.(spec|test).+(ts|js)?(x)',
    '**/+(*.)+(spec|test).+(ts|js)?(x)',
  ],
  moduleNameMapper: {
    '^@reviews-monorepo/auth$': '<rootDir>/../../libs/auth/index.ts',
    '^@reviews-monorepo/common$': '<rootDir>/../../libs/common/index.ts',
    '^@reviews-monorepo/config$': '<rootDir>/../../libs/config/index.ts',
    '^@reviews-monorepo/database$': '<rootDir>/../../libs/database/index.ts',
    '^@reviews-monorepo/logging$': '<rootDir>/../../libs/logging/index.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/__tests__/**',
    '!src/**/*.dto.{ts,js}',
    '!src/**/*.module.{ts,js}',
    '!src/main.ts',
  ],
};

