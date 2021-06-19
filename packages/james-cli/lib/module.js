const Module = require('module');
const path = require('path');
function loadModule(request, context) {
  // 加载 CommonJS 模块
  return Module.createRequire(path.resolve(context, 'package.json'))(request);
}
module.exports = {
  loadModule,
};
