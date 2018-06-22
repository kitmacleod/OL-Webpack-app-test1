const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry:'./src/main.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  devtool: 'cheap-module-eval-source-map',
  devServer:{
    contentBase: path.join(__dirname, 'public'),
     historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }]
  },
  plugins: [
    new CopyPlugin([{from: 'data', to: 'data'}])
  ]
};

