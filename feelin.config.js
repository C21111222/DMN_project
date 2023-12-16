const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './ts/main.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i, use: ["style-loader", "css-loader"]
      },
      {
        test: /\.json$/i,
        type: 'json'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ],
  },
  optimization: {
    minimize: true
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'js'),
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};