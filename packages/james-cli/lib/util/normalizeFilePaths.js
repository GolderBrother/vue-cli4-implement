const slash = require('slash');
// 将Windows反斜杠路径转换为斜杠路径，如foo\\bar➔ foo/bar
function normalizeFilePaths(files = {}) {
  Object.entries(files).forEach(([filePath, file]) => {
    const normalized = slash(filePath);
    // 说明反斜杠路径转换为斜杠路径了
    if (filePath !== normalized) {
      files[normalized] = file;
      delete files[filePath];
    }
  });
  return files;
}

module.exports = normalizeFilePaths;
