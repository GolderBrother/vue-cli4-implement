const fs = require('fs-extra');
const path = require('path');
async function writeFileTree(dir, files) {
  Object.entries(files).forEach(([filename, value]) => {
    const filePath = path.join(dir, filename);
    // 确保目录的存在。如果目录结构不存在,就创建一个
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, value);
  });
}
module.exports = writeFileTree;
