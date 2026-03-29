const { Command } = require('commander');
const { postAPI, getAPI } = require('../api/client');
const { printOutput } = require('../utils/output');

const orderCommand = new Command('order').description('Manage orders');

orderCommand.command('list').description('List orders')
  .option('--limit <n>', 'Limit', '10')
  .option('--offset <n>', 'Offset', '0')
  .option('--status <s>', 'Status filter')
  .option('--format <f>', 'Format', 'list')
  .action(async (options) => {
    const params = { limit: parseInt(options.limit), offset: parseInt(options.offset) };
    if (options.status) params.status = options.status;
    printOutput(await getAPI('/api/orders', params), options.format);
  });

orderCommand.command('get <id>').description('Get order by ID')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (id, options) => {
    printOutput(await getAPI(`/api/orders/${id}`), options.format);
  });

module.exports = orderCommand;
