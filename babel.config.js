module.exports = function (api) {
    api.cache(true);

    return {
        presets: ['babel-preset-expo'],
        env: {
            production: {
                plugins: ['react-native-paper/babel'],
            },
        },
        plugins: [["inline-import", { "extensions": [".sql"] }]],
    };
};
