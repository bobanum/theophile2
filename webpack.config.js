const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      // { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      // { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      // { test: /\.scss$/, use: MiniCssExtractPlugin.loader({ fallback: 'style-loader', use: ['css-loader', 'sass-loader']}) },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '.'),
    },
    compress: true,
    port: 9000,
  },
  plugins: [
     new MiniCssExtractPlugin({filename:'[name]-[chunkhash].css'}),
  ],
};
