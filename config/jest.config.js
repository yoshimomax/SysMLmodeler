/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/../src/client/$1',
    '^@shared/(.*)$': '<rootDir>/../src/shared/$1',
    '^@model/(.*)$': '<rootDir>/../src/model/$1',
    '^@store/(.*)$': '<rootDir>/../src/store/$1',
    '^@components/(.*)$': '<rootDir>/../src/components/$1',
    '^@services/(.*)$': '<rootDir>/../src/services/$1',
    '^@validators/(.*)$': '<rootDir>/../src/validators/$1',
    '^@adapters/(.*)$': '<rootDir>/../src/adapters/$1',
    '^@assets/(.*)$': '<rootDir>/../public/assets/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  roots: ['<rootDir>/../src/__tests__'],
};