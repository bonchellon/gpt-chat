const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src')
  }),
  (config) => {
    if (config.devServer) {
      config.devServer.allowedHosts = 'all';
    }
    return config;
  }
);
