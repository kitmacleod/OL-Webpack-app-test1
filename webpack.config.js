const path = require('path');

module.exports = {
  entry:'./src/main.js',
  devServer:{
    contentBase: path.join(__dirname, 'public'),
    historyApiFallback: true
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  devtool: 'cheap-module-eval-source-map',
};