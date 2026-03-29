const { Command } = require('commander');
const { postAPI, getAPI } = require('../api/client');
const { printOutput, chalk } = require('../utils/output');
const { getConfig } = require('../config');

const user = new Command('user').description('Manage users');

function getData(result) {
  return result?.data ?? result;
}

user.command('info').description('Get current user info')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => { printOutput(getData(await getAPI('/api/auth/info')), options.format); });

user.command('profile').description('Get detailed user profile')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    printOutput(await postAPI('/api/auth/getInfo', { phone: cfg.userPhone || '' }), options.format);
  });

user.command('update').description('Update profile')
  .option('--username <u>', 'Username')
  .option('--bio <b>', 'Bio')
  .option('--avatar <a>', 'Avatar URL')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    const data = { userID: cfg.userID };
    if (options.username) data.name = options.username;
    if (options.bio) data.intro = options.bio;
    if (options.avatar) data.avatarURL = options.avatar;
    console.log(chalk.yellow('📝 Updating profile...'));
    printOutput(await postAPI('/api/auth/updateUserInfo', data), options.format);
  });

user.command('tags').description('Get all tags')
  .option('--format <f>', 'Format', 'list')
  .action(async (options) => { printOutput(getData(await getAPI('/api/auth/getTags')), options.format); });

user.command('notices').description('Get notices')
  .option('--format <f>', 'Format', 'list')
  .action(async (options) => { printOutput(getData(await getAPI('/api/auth/getNotice')), options.format); });

user.command('notices-count').description('Get notice count')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => { printOutput(getData(await getAPI('/api/auth/getNoticeNum')), options.format); });

user.command('read-notice <id>').description('Mark notice as read')
  .action(async (id) => {
    await postAPI(`/api/auth/readNotice/${id}`, {});
    console.log(chalk.green('✅ Notice marked as read!'));
  });

user.command('statistics').description('Get user statistics')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => { printOutput(getData(await postAPI('/api/auth/statistics', {})), options.format); });

user.command('feedback <content>').description('Submit feedback')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (content, options) => {
    console.log(chalk.yellow('📨 Sending feedback...'));
    printOutput(await postAPI('/api/auth/submitFeedback', { content }), options.format);
  });

user.command('+me').description('Get detailed user info')
  .action(async () => {
    const cfg = getConfig();
    printOutput(await postAPI('/api/auth/getInfo', { phone: cfg.userPhone || '' }), 'pretty');
  });

module.exports = user;
