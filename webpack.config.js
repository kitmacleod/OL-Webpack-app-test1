const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports  = (env) => {
  const isProduction = env === 'production';
  

  return {
      entry:'./src/main.js',
      //entry: './src/playground/arrow-functionReact.js',
      output: {
        path: path.join(__dirname, 'public'),
        filename: 'bundle.js'
      },
      devtool: isProduction ? 'source-map':'cheap-module-eval-source-map',
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
  };



