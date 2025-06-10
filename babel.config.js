module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [
        ['@babel/plugin-transform-runtime', { regenerator: true }],
        ['module-resolver', {
            root: ['./src'],
            alias: {
                '@': './src',
                '@components': './src/components',
                '@utils': './src/utils',
                '@services': './src/services',
                '@types': './src/types',
                '@hooks': './src/hooks',
                '@tests': './src/__tests__'
            }
        }]
    ],
}; 