const { Command } = require('commander');
const { setConfig, getConfig, clearConfig, saveConfig } = require('../config');
const { printOutput, chalk } = require('../utils/output');

const config = new Command('config').description('Configure settings');

config.command('init').description('Initialize config')
  .option('--api-url <url>', 'API URL', 'https://ssemarket.cn')
  .option('--token <t>', 'Token')
  .action((options) => {
    saveConfig({ apiBaseUrl: options.apiUrl, token: options.token || '' });
    console.log(chalk.green('✅ Config saved. API: ') + chalk.cyan(options.apiUrl));
  });

config.command('show').description('Show current config')
  .option('--format <f>', 'Format', 'pretty')
  .action((options) => {
    console.log(chalk.yellow('═══════ Configuration ═══════'));
    printOutput(getConfig(), options.format);
  });

config.command('set <key> <value>').description('Set config value').action((key, value) => {
  setConfig(key, value);
  console.log(chalk.green('✅ ') + chalk.cyan(key) + chalk.green(' = ') + chalk.magenta(value));
});

config.command('clear').description('Clear all config').action(() => {
  clearConfig();
  console.log(chalk.green('✅ Configuration cleared.'));
});

module.exports = config;
