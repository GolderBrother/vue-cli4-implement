async function create(projectName, options) {
    const cwd = process.cwd();
    const name = projectName;
    const targetDir = path.resolve(cwd, projectName);
    console.log(name);
    console.log(targetDir);
}

module.exports = (...args) => {
    return create(...args).catch(err => console.log(err));
}