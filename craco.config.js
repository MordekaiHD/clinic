module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Игнорировать source map для react-datepicker
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules\/react-datepicker/,
      });

      // Подавить предупреждения
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/react-datepicker/,
        },
      ];

      return webpackConfig;
    },
  },
};