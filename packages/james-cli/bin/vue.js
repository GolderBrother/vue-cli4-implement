#!/usr/bin/env node
const program = require("commander");
const inquirer = require("inquirer");
const execa = require("execa");
const chalk = require("chalk");
const ora = require("ora");
const isManualMode = (answers) => answers.preset === "__manual__";
const spinner = ora();
const defaultPreset = {
  useConfigFiles: false,
  cssPreprocessor: undefined,
  plugins: {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      config: "base",
      lintOn: ["save"],
    },
  },
};
const presets = {
  default: Object.assign({ vueVersion: "2" }, defaultPreset),
  __default_vue_3__: Object.assign({ vueVersion: "3" }, defaultPreset),
};
const presetChoices = Object.entries(presets).map(([name, preset]) => {
  let displayName = name;
  if (name === "default") {
    displayName = "Default";
  } else if (name === "__default_vue_3__") {
    displayName = "Default (Vue 3)";
  }
  return {
    name: `${displayName}`,
    value: name,
  };
});
const presetPrompt = {
	name: 'preset',
	type: 'list',
	message: `Please pick a preset:`,
	choices: [
			...presetChoices,
			{
					name: 'Manually select features',
					value: '__manual__'
			}
	]
}
const features = [
	'vueVersion',
	'babel',
	'typescript',
	'pwa',
	'router',
	'vuex',
	'cssPreprocessors',
	'linter',
	'unit',
	'e2e'
];
const featurePrompt = {
	name: 'features',
	when: isManualMode,
	type: 'checkbox',
	message: 'Check the features need for your project:',
	choices: features,
	pageSize: 10
};
const prompts = [
	presetPrompt,
	featurePrompt
];

;(async function(){
	const result = await inquirer.prompt(prompts);
	console.log(chalk.green(result));
 })();

 ;(async () => {
	const {stdout} = await execa('echo', ['hello']);
	console.log(chalk.blue(stdout));
})();

const logWithSpinner = msg => {
	spinner.text = msg;
	spinner.start();
}

const stopSpinner = () => {
	spinner.stop();
};

logWithSpinner('npm install');

setTimeout(() => {
	stopSpinner();
}, 2000);

program.version(`james-cli 0.0.0}`).usage("<command> [options]");

program
  .command("create <app-name>")
  .description("create a new project powered by vue-cli-service")
  .action((name) => {
    console.log(name);
  });

program.parse(process.argv);
