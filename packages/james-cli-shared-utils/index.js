['pluginResolution', 'module'].forEach((module) => {
  Object.assign(exports, require(`./lib/${module}`));
});
exports.chalk = require('chalk');
exports.execa = require('execa');
console.log('james-cli-shared-utils');
