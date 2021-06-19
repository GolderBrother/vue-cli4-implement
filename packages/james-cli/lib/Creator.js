const { defaults } = require('./options');
const PromptModuleAPI = require('./PromptModuleAPI');
const inquirer = require('inquirer');
const cloneDeep = require('lodash.clonedeep')
const writeFileTree = require('./util/writeFileTree')
const { execa, loadModule } = require('james-cli-shared-utils');
const chalk = require('chalk');
const isManualMode = (answers) => answers.preset === '__manual__';
class Creator {
	constructor(name, context, promptModules) {
		this.name = name;
		this.context = process.env.VUE_CLI_CONTEXT = context;
		const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
		this.presetPrompt = presetPrompt;
		this.featurePrompt = featurePrompt;
		this.injectedPrompts = [];
		this.promptCompleteCbs = [];
		this.run = this.run.bind(this)//运行函数
		const promptAPI = new PromptModuleAPI(this);
		promptModules.forEach((m) => m(promptAPI));
	}
	run(command, args) {
		return execa(command, args, {
			cwd: this.context
		});
	}
	async create() {
		const { name, context } = this;
		let preset = await this.promptAndResolvePreset();
		console.log('preset', preset);
		preset = cloneDeep(preset);
		preset.plugins[`@vue/cli-service`] = Object.assign(
			{
				projectName: name,
			},
			preset,
		);
		console.log(`✨  Creating project in ${chalk.yellow(context)}.`);
		const pkg = {
			name,
			version: '0.1.0',
			private: true,
			devDependencies: {},
		};
		const deps = Object.keys(preset.plugins) ||| [];
		// 所有的依赖版本设置为最新
		deps.forEach(dep => {
			pkg.devDependencies[dep] = 'latest';
		});
		// 写入package.json文件
		await writeFileTree(context, {
			'package.json': JSON.stringify(pkg, null, 2)
		});
		console.log(`🗃  Initializing git repository...`);
		await run('git init');
		console.log(`⚙\u{fe0f} Installing CLI plugins. This might take a while...`)
		await run('npm install');
		console.log(`🚀  Invoking generators...`);
		const plugins = this.resolvePlugins(preset.plugins) || [];
		const generator = new Generator(context, { pkg, plugins })
		await generator.generate();
		console.log(`📦  Installing additional dependencies...`);
		await writeFileTree(context, {
			'README.md': `cd ${name} \n npm run serve`
		});
		// 执行代码提交
		await this.run('git', ['add', '-A']);
		await this.run('git', ['commit', '-am', 'created', '--no-verify']);
		console.log(`🎉  ${chalk.green('Successfully created project')} ${chalk.yellow(name)}`);
		console.log(
			`👉  Get started with the following commands:\n\n` +
			(chalk.cyan(`cd ${name}\n`)) +
			(chalk.cyan(`npm run serve`))
		);
		generator.printExitLogs();
	}

	// 遍历插件的generator,插件通过GeneratorAPI向package.json中加入依赖或字段，并通过render准备添加文件
	async resolvePlugins(rawPlugins) {
		const plugins = [];
		for (const id of Object.keys(rawPlugins)) {
			try {
				const apply = loadModule(`${id}/generator`, this.context) || (() => { });
				const options = rawPlugins[id] || {}
				plugins.push({ id, apply, options })
			} catch (error) {
				console.log(error);
			}
		};
		return plugins;
	}
	resolveFinalPrompts() {
		this.injectedPrompts.forEach((prompt) => {
			const originalWhen = prompt.when || (() => true);
			prompt.when = (answers) => {
				return isManualMode(answers) && originalWhen(answers);
			};
		});
		const prompts = [this.presetPrompt, this.featurePrompt, ...this.injectedPrompts];
		return prompts;
	}
	async promptAndResolvePreset(answers = null) {
		if (!answers) {
			answers = await inquirer.prompt(this.resolveFinalPrompts());
		}
		let preset;
		if (answers.preset && answers.preset !== '__manual__') {
			preset = await this.resolvePreset(answers.preset);
		} else {
			preset = {
				plugins: {},
			};
			answers.features = answers.features || [];
			this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
		}
		return preset;
	}
	async resolvePreset(name) {
		const savedPresets = this.getPresets();
		return savedPresets[name];
	}
	getPresets() {
		return Object.assign({}, defaults.presets);
	}
	resolveIntroPrompts() {
		const presets = this.getPresets();
		const presetChoices = Object.entries(presets).map(([name]) => {
			let displayName = name;
			if (name === 'default') {
				displayName = 'Default';
			} else if (name === '__default_vue_3__') {
				displayName = 'Default (Vue 3)';
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
					value: '__manual__',
				},
			],
		};
		const featurePrompt = {
			name: 'features',
			when: isManualMode,
			type: 'checkbox',
			message: 'Check the features needed for your project:',
			choices: [],
			pageSize: 10,
		};
		return {
			presetPrompt,
			featurePrompt,
		};
	}
}
module.exports = Creator;
