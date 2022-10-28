module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['./node_modules/'],
    errorOnDeprecated: true,
    moduleFileExtensions: ['js', 'ts'],
    resetMocks: false,
    testLocationInResults: true,
    testTimeout: 600000,
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    testPathIgnorePatterns: ['./node_modules/'],
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/$1'
    },
};
