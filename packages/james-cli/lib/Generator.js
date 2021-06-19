const { isPlugin, matchesPluginId } = require('james-cli-shared-utils');
const ejs = require('ejs');
const GeneratorAPI = require('./GeneratorAPI');
const writeFileTree = require('./util/writeFileTree');
class Generator {
  constructor(context, { pkg = {}, plugins = [] } = {}) {
    this.context = context;
    this.plugins = plugins;
    this.pkg = pkg;
    this.files = {};
    this.fileMiddleWares = [];
    const allPluginIds = [
      ...Object.keys(this.pkg.dependencies || {}),
      ...Object.keys(this.pkg.devDependencies || {}),
    ].filter(isPlugin);
    this.allPluginIds = allPluginIds;
    const cliService = plugins.find((p) => p.id === '@vue/cli-service');
    this.rootOptions = cliService.options;
  }
  async generate() {
    await this.initPlugins();
    // 将一些配置信息从 package.json 中提取到单独的文件中，比如 postcss.config.js babel.config.js
    this.extractConfigFiles();
    // 遍历 fileMiddleware，向 files 里写入文件，并插入 import 和 rootOptions
    await this.resolveFiles();
    // console.log(this.files);
    this.sortPkg();
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n';
    //把内存中的文件写入硬盘
    await writeFileTree(this.context, this.files);
  }
  sortPkg() {
    console.log('ensure package.json keys has readable order');
  }
  extractConfigFiles() {
    console.log('extractConfigFiles');
  }
  async initPlugins() {
    const { rootOptions, plugins = [] } = this;
    for (const plugin of plugins) {
      const { id, apply, options } = plugin;
      const api = new GeneratorAPI(id, apply, options, rootOptions);
      await apply(api, options, rootOptions);
    }
  }
  // 解析文件
  async resolveFiles() {
    const files = this.files;
    for (const fileMiddleWare of this.fileMiddleWares) {
      await fileMiddleWare(files, ejs.render);
    }
    normalizeFilePaths(files);
  }
  hasPlugin(id) {
    const pluginIds = [...this.plugins.map((plugin) => plugin.id), ...this.allPluginIds];
    return pluginIds.some((_id) => matchesPluginId(id, _id));
  }
  printExitLogs() {
    console.log('printExitLogs');
  }
}
module.exports = Generator;
