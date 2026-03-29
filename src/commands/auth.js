const { Command } = require('commander');
const { postAPI, getAPI } = require('../api/client');
const { setConfig, getConfig } = require('../config');
const { printOutput, chalk } = require('../utils/output');
const { encryptPassword } = require('../utils/crypto');

const auth = new Command('auth').description('Authentication commands');

auth.command('login <email> <password>').description('Login to SSE Market')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (email, password, options) => {
    console.log(chalk.yellow('🔐 Logging in...'));
    const result = await postAPI('/api/auth/login', { email, password: encryptPassword(password) });
    const data = result.data || result;
    if (data.token) {
      setConfig('token', data.token);
      if (data.refresh_token) setConfig('refreshToken', data.refresh_token);
      console.log(chalk.green('✅ Login successful!'));
      try {
        const user = await getAPI('/api/auth/info');
        const u = user.data?.user || user.data;
        if (u?.phone) setConfig('userPhone', u.phone);
        if (u?.userID) setConfig('userID', u.userID);
      } catch (e) { /* ignore */ }
    }
    printOutput(result, options.format);
  });

auth.command('register <email> <password> <username>').description('Register new user')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (email, password, username, options) => {
    console.log(chalk.yellow('📝 Registering...'));
    printOutput(await postAPI('/api/auth/register', { email, password, username }), options.format);
  });

auth.command('refresh').description('Refresh access token')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    if (!cfg.refreshToken) {
      console.error(chalk.red('❌ No refresh token. Please login first.'));
      process.exit(1);
    }
    const result = await postAPI('/api/auth/refresh', { refresh_token: cfg.refreshToken });
    const data = result.data || result;
    if (data.token) {
      setConfig('token', data.token);
      if (data.refresh_token) setConfig('refreshToken', data.refresh_token);
      console.log(chalk.green('✅ Token refreshed!'));
    }
    printOutput(result, options.format);
  });

auth.command('info').description('Get current user info')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    printOutput(await getAPI('/api/auth/info'), options.format);
  });

auth.command('me').description('Get detailed user profile')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    printOutput(await postAPI('/api/auth/getInfo', { phone: cfg.userPhone || '' }), options.format);
  });

auth.command('update-profile').description('Update user profile')
  .option('--username <u>', 'Username')
  .option('--bio <b>', 'Bio')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    const data = { userID: cfg.userID };
    if (options.username) data.name = options.username;
    if (options.bio) data.intro = options.bio;
    console.log(chalk.yellow('📝 Updating profile...'));
    printOutput(await postAPI('/api/auth/updateUserInfo', data), options.format);
  });

auth.command('logout').description('Logout and clear tokens').action(() => {
  setConfig('token', '');
  setConfig('userPhone', '');
  setConfig('userID', '');
  console.log(chalk.green('✅ Logged out. Bye!'));
});

auth.command('status').description('Check authentication status').action(() => {
  const cfg = getConfig();
  if (cfg.token) {
    console.log(chalk.green('✅ Logged in'));
    if (cfg.userPhone) console.log(chalk.cyan('📱 Phone: ') + chalk.dim(cfg.userPhone));
  } else {
    console.log(chalk.red('❌ Not logged in'));
  }
});

module.exports = auth;
