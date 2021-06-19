const pluginRE = /^@vue\/cli-plugin-/;
// 解析插件名称 @vue/cli-plugin-babel => babel
const toShortPluginId = (id = '') => id.replace(pluginRE, '');
const isPlugin = (id = '') => pluginRE.test(id);
const matchesPluginId = (input, full) => input === full;
module.exports = {
  toShortPluginId,
  isPlugin,
  matchesPluginId,
};
