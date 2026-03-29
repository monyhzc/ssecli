const { Command } = require('commander');
const { postAPI } = require('../api/client');
const { printOutput, chalk } = require('../utils/output');
const { getConfig } = require('../config');
const { startNavigation, getNavStatus } = require('../utils/navigator');
const { displayNavItem } = require('../utils/display');

const product = new Command('product').description('Manage products');

product.command('list').description('List products')
  .option('--format <f>', 'Format', 'list')
  .option('--search <s>', 'Search')
  .option('--sort <x>', 'Sort (home/my)', 'home')
  .option('--limit <n>', 'Limit', '10')
  .option('--offset <o>', 'Offset', '0')
  .option('--page <n>', 'Page')
  .option('--nav', 'Navigation mode')
  .action(async (options) => {
    const cfg = getConfig();
    const limit = parseInt(options.limit) || 10;
    const offset = options.page ? (parseInt(options.page) - 1) * limit : parseInt(options.offset) || 0;
    const result = await postAPI('/api/auth/getProducts', {
      Searchinfo: options.search || '',
      Searchsort: options.sort,
      Limit: limit,
      Offset: offset,
    });
    if (options.nav && Array.isArray(result) && result.length > 0) {
      const item = startNavigation('product', result, { Searchinfo: options.search || '', Searchsort: options.sort, Limit: limit });
      displayNavItem(item, getNavStatus());
    } else {
      printOutput(result, options.format);
    }
  });

product.command('get <productId>').description('Get product detail')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (productId, options) => {
    printOutput(await postAPI('/api/auth/getProductDetail', { ProductID: parseInt(productId) }), options.format);
  });

product.command('create').description('Create product')
  .option('--title <t>', 'Title').option('--content <c>', 'Content')
  .option('--price <p>', 'Price').option('--photos <ps>', 'Photos')
  .option('--anonymous', 'Anonymous').option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    console.log(chalk.yellow('📦 Creating product...'));
    printOutput(await postAPI('/api/auth/postProduct', {
      Title: options.title, Content: options.content,
      Price: parseInt(options.price),
      Photos: options.photos ? options.photos.split(',') : [],
      ISAnonymous: options.anonymous || false,
      UserTelephone: cfg.userPhone || '',
    }), options.format);
  });

product.command('delete <productId>').description('Delete product').action(async (productId) => {
  await postAPI('/api/auth/deleteProduct', { ProductID: parseInt(productId) });
  console.log(chalk.green('✅ Product deleted!'));
});

product.command('sale <productId>').description('Mark as sold')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (productId, options) => {
    printOutput(await postAPI('/api/auth/saleProduct', { ProductID: parseInt(productId) }), options.format);
  });

product.command('count').description('Get product count')
  .option('--search <s>', 'Search').option('--sort <x>', 'Sort', 'home')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    printOutput(await postAPI('/api/auth/getProductNum', {
      Searchinfo: options.search || '',
      Searchsort: options.sort,
    }), options.format);
  });

product.command('carousel').description('Get carousel images')
  .option('--format <f>', 'Format', 'list')
  .action(async (options) => {
    printOutput(await postAPI('/api/auth/getCarouselImg', {}), options.format);
  });

product.command('+list').description('List products (nav)').action(async () => {
  const cfg = getConfig();
  const result = await postAPI('/api/auth/getProducts', { Searchsort: 'home', Limit: 10, Offset: 0 });
  if (Array.isArray(result) && result.length > 0) {
    const item = startNavigation('product', result, { Searchsort: 'home', Limit: 10 });
    displayNavItem(item, getNavStatus());
  }
});

module.exports = product;
