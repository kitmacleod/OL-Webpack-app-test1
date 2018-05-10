const path = require('path');

module.exports = {
  entry:'./main.js',
  devServer:{
    contentBase: './dist',
    open:true,
    overlay:true
  },
  output: {
    path: path.resolve(__dirname, './dist'),
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
  }
};