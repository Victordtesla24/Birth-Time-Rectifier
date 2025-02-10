module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js'
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    transformIgnorePatterns: [
        '/node_modules/(?!(@modelcontextprotocol)/)'
    ],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node']
};
