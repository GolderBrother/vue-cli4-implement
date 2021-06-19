function mergeDeps(sourceDeps, depsToInject = {}) {
  const result = Object.assign({}, sourceDeps);
  Object.entries(depsToInject).forEach((depName, dep) => {
    result[depName] = dep;
  });
  return result;
}

module.exports = mergeDeps;