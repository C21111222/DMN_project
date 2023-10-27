const path = require('path');
module.exports = {
    devtool: 'source-map',
    entry: './ts/feelin.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/i, use: ["style-loader", "css-loader"]
            },
            {
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ],
    },
    optimization: {
        minimize: true
    },
    output: {
        filename: 'feelin.js',
        path: path.resolve(__dirname, 'js'),
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};

