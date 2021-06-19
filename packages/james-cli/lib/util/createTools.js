const getPromptModules = () => {
  const files = ['vueVersion'];
  return files.map((file) => require(`../promptModules/${file}`));
};
module.exports = {
  getPromptModules,
};
