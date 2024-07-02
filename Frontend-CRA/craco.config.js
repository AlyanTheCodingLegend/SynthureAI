import path from "path"

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        "crypto": require.resolve("crypto-browserify")
      };
      return webpackConfig;
    },
  },
};
