const { Command } = require('commander');
const { postAPI, getAPI } = require('../api/client');
const { printOutput } = require('../utils/output');

const apiCommand = new Command('api').description('Raw API calls');

function parseJSON(str) {
  if (!str) return {};
  try { return JSON.parse(str); } catch { return {}; }
}

apiCommand.command('get <endpoint>').description('GET request')
  .option('--params <params>', 'JSON query parameters')
  .option('--format <format>', 'Output format', 'json')
  .action(async (endpoint, options) => {
    printOutput(await getAPI(endpoint, parseJSON(options.params)), options.format);
  });

apiCommand.command('post <endpoint>').description('POST request')
  .option('--body <body>', 'JSON request body')
  .option('--format <format>', 'Output format', 'json')
  .action(async (endpoint, options) => {
    printOutput(await postAPI(endpoint, parseJSON(options.body)), options.format);
  });

module.exports = apiCommand;
