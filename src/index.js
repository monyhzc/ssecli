const chalk = require('chalk');

function showSplash() {
  console.log(chalk.cyan(`
   ███████╗███████╗███████╗ ██████╗██╗     ██╗
   ██╔════╝██╔════╝██╔════╝██╔════╝██║     ██║
   ███████╗███████╗█████╗  ██║     ██║     ██║
   ╚════██║╚════██║██╔══╝  ██║     ██║     ██║
   ███████║███████║███████╗╚██████╗███████╗██║
   ╚══════╝╚══════╝╚══════╝ ╚═════╝╚══════╝╚═╝

       https://github.com/monyhzc/ssecli
  `));
}

const { program } = require('commander');
const { postAPI } = require('./api/client');
const { getConfig } = require('./config');
const { startNavigation, getNavStatus, getNext, getPrev, getCurrent } = require('./utils/navigator');
const { displayNavItem, displayPostWithComments } = require('./utils/display');

program.name('ssecli').description('Command-line tool for SSE Market').version('1.0.0');

program.addCommand(require('./commands/config'));
program.addCommand(require('./commands/auth'));
program.addCommand(require('./commands/product'));
program.addCommand(require('./commands/post'));
program.addCommand(require('./commands/user'));
program.addCommand(require('./commands/api'));
program.addCommand(require('./commands/nav'));

const args = process.argv.slice(2);

const shouldShowSplash = args.length === 0 || 
  args.includes('--help') || 
  args.includes('-h') || 
  (args.length === 1 && args[0] === 'help');

if (shouldShowSplash) {
  showSplash();
}

function handleNav(item) {
  if (!item) { console.log('Use `ssecli post` or `ssecli product` first.'); return; }
  const status = getNavStatus();
  status.type === 'post' ? displayPostWithComments(item, status) : displayNavItem(item, status);
}

function startNav(type, query) {
  return async () => {
    const result = await postAPI(query.api, query.params);
    if (Array.isArray(result) && result.length > 0) {
      const item = startNavigation(type, result, query.filter);
      handleNav(item);
    } else {
      console.log(`No ${type}s found.`);
    }
  };
}

if (args.length === 0) {
  program.help();
} else if (args[0] === 'post' && args.length === 1) {
  const cfg = getConfig();
  startNav('post', {
    api: '/api/auth/browse',
    params: { UserTelephone: cfg.userPhone || '', Partition: '', Searchinfo: '', Tag: '', Searchsort: 'home', Limit: 10, Offset: 0, PostType: '' },
    filter: { UserTelephone: cfg.userPhone || '', Searchsort: 'home', Limit: 10, PostType: '' }
  })();
} else if (args[0] === 'product' && args.length === 1) {
  startNav('product', {
    api: '/api/auth/getProducts',
    params: { Searchinfo: '', Searchsort: 'home', Limit: 10, Offset: 0 },
    filter: { Searchsort: 'home', Limit: 10 }
  })();
} else if (args[0] === 'next' && args.length === 1) {
  (async () => { try { handleNav(await getNext()); } catch (e) { console.error('Error:', e.message); } })();
} else if (args[0] === 'prev' && args.length === 1) {
  handleNav(getPrev());
} else if (args[0] === 'curr' && args.length === 1) {
  handleNav(getCurrent());
} else {
  program.parse();
}
