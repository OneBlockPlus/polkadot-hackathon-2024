const path = require('path');

module.exports = {
  // Entry point of your application
  entry: './src/index.js', // Update this path to point to your actual main JavaScript file

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'), // The output directory for all build assets
    filename: 'bundle.js', // The filename of the bundled output
    publicPath: '/' // Public URL of the output directory when referenced in the browser
  },

  // Modules and rules for processing different types of files
  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|gif)$/i, // Matches image files
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]', // Maintains the original name and extension
              outputPath: 'images/', // Puts the images in 'dist/images/'
              publicPath: 'images/', // URL path in browsers to access images
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // Processes CSS files
      },
      // Add more rules if you need to handle other types like TypeScript or JSX
    ],
  },

  // Optional: Configure the webpack dev server
  devServer: {
    contentBase: './dist', // Where to serve content from
    hot: true, // Hot module replacement
    open: true, // Automatically open the page in the browser
    port: 3000, // Port to run the server on
  },

  // Optional: Add plugins here if needed, such as HtmlWebpackPlugin or others
};
