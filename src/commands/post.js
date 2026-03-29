const { Command } = require('commander');
const { postAPI } = require('../api/client');
const { printOutput, chalk } = require('../utils/output');
const { getConfig } = require('../config');
const { startNavigation } = require('../utils/navigator');
const { displayPostWithComments, getNavStatus } = require('../utils/display');

const post = new Command('post').description('Manage posts');

function parseOpts(options) {
  return {
    limit: parseInt(options.limit) || 10,
    offset: parseInt(options.offset) || 0,
    partition: options.partition || '',
    search: options.search || '',
    tag: options.tag || '',
    sort: options.sort || 'home',
    type: options.type || '',
    nav: options.nav || false,
    format: options.format || 'list',
    page: options.page ? (parseInt(options.page) - 1) * (parseInt(options.limit) || 10) : parseInt(options.offset) || 0,
  };
}

function displayPostNav(result, query, config) {
  if (!Array.isArray(result) || result.length === 0) return;
  const item = startNavigation('post', result, { ...query, UserTelephone: config.userPhone || '' });
  displayPostWithComments(item, getNavStatus());
}

post.command('list').description('List posts')
  .option('--format <f>', 'Format', 'list')
  .option('--partition <p>', 'Partition')
  .option('--search <s>', 'Search')
  .option('--tag <t>', 'Tag')
  .option('--sort <x>', 'Sort (home/history/save/rating)', 'home')
  .option('--limit <n>', 'Limit', '10')
  .option('--offset <o>', 'Offset', '0')
  .option('--page <n>', 'Page')
  .option('--type <y>', 'Type')
  .option('--nav', 'Navigation mode')
  .action(async (options) => {
    const cfg = getConfig();
    const opts = parseOpts(options);
    const result = await postAPI('/api/auth/browse', {
      UserTelephone: cfg.userPhone || '',
      Partition: opts.partition,
      Searchinfo: opts.search,
      Tag: opts.tag,
      Searchsort: opts.sort,
      Limit: opts.limit,
      Offset: opts.offset,
      PostType: opts.type,
    });
    if (opts.nav) {
      displayPostNav(result, { Partition: opts.partition, Searchinfo: opts.search, Tag: opts.tag, Searchsort: opts.sort, Limit: opts.limit, PostType: opts.type }, cfg);
    } else {
      printOutput(result, opts.format);
    }
  });

post.command('get <postId>').description('Get post detail')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (postId, options) => {
    printOutput(await postAPI('/api/auth/showDetails', { PostID: parseInt(postId) }), options.format);
  });

post.command('create').description('Create post')
  .option('--title <t>', 'Title').option('--content <c>', 'Content')
  .option('--partition <p>', 'Partition').option('--photos <ps>', 'Photos')
  .option('--tags <gs>', 'Tags').option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    const cfg = getConfig();
    console.log(chalk.yellow('📝 Creating post...'));
    printOutput(await postAPI('/api/auth/post', {
      UserTelephone: cfg.userPhone || '',
      Title: options.title, Content: options.content,
      Partition: options.partition, Photos: options.photos || '',
      TagList: options.tags || '',
    }), options.format);
  });

post.command('delete <postId>').description('Delete post').action(async (postId) => {
  await postAPI('/api/auth/deletePost', { PostID: parseInt(postId) });
  console.log(chalk.green('✅ Post deleted!'));
});

post.command('like <postId>').description('Like/unlike post')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (postId, options) => {
    printOutput(await postAPI('/api/auth/updateLike', { PostID: parseInt(postId) }), options.format);
  });

post.command('save <postId>').description('Save/unsave post')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (postId, options) => {
    printOutput(await postAPI('/api/auth/updateSave', { PostID: parseInt(postId) }), options.format);
  });

post.command('count').description('Get post count')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (options) => {
    printOutput(await postAPI('/api/auth/getPostNum', {}), options.format);
  });

post.command('comments <postId>').description('Get post comments')
  .option('--format <f>', 'Format', 'list')
  .action(async (postId, options) => {
    const cfg = getConfig();
    printOutput(await postAPI('/api/auth/showPcomments', {
      userTelephone: cfg.userPhone || '',
      postID: parseInt(postId),
      postType: 'post',
    }), options.format);
  });

post.command('comment <postId> <content>').description('Comment on post')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (postId, content, options) => {
    const cfg = getConfig();
    console.log(chalk.yellow('💬 Commenting...'));
    printOutput(await postAPI('/api/auth/postPcomment', {
      UserTelephone: cfg.userPhone || '',
      PostID: parseInt(postId),
      Content: content,
    }), options.format);
  });

post.command('delete-comment <commentId>').description('Delete a comment')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (commentId, options) => {
    console.log(chalk.yellow('🗑️ Deleting comment...'));
    printOutput(await postAPI('/api/auth/deletePcomment', {
      PcommentID: parseInt(commentId),
    }), options.format);
  });

post.command('subcomment <commentId> <content>').description('Reply to a comment')
  .option('--format <f>', 'Format', 'pretty')
  .action(async (commentId, content, options) => {
    const cfg = getConfig();
    console.log(chalk.yellow('💬 Replying to comment...'));
    printOutput(await postAPI('/api/auth/postCcomment', {
      UserTelephone: cfg.userPhone || '',
      PcommentID: parseInt(commentId),
      Content: content,
    }), options.format);
  });

post.command('types').description('Get post types')
  .option('--format <f>', 'Format', 'list')
  .action(async (options) => {
    printOutput(await postAPI('/api/auth/getPostTypes', {}), options.format);
  });

post.command('+hot').description('Hot posts (nav)').action(async () => {
  const cfg = getConfig();
  const result = await postAPI('/api/auth/browse', { UserTelephone: cfg.userPhone || '', Searchsort: 'home', Limit: 10, Offset: 0 });
  if (Array.isArray(result) && result.length > 0) {
    const item = startNavigation('post', result, { UserTelephone: cfg.userPhone || '', Searchsort: 'home', Limit: 10, PostType: '' });
    displayPostWithComments(item, getNavStatus());
  }
});

post.command('+save').description('Saved posts (nav)').action(async () => {
  const cfg = getConfig();
  const result = await postAPI('/api/auth/browse', { UserTelephone: cfg.userPhone || '', Searchsort: 'save', Limit: 10, Offset: 0 });
  if (Array.isArray(result) && result.length > 0) {
    const item = startNavigation('post', result, { UserTelephone: cfg.userPhone || '', Searchsort: 'save', Limit: 10, PostType: '' });
    displayPostWithComments(item, getNavStatus());
  }
});

post.command('+rating').description('Top rated posts (nav)').action(async () => {
  const cfg = getConfig();
  const result = await postAPI('/api/auth/browse', { UserTelephone: cfg.userPhone || '', Searchsort: 'rating', Limit: 10, Offset: 0 });
  if (Array.isArray(result) && result.length > 0) {
    const item = startNavigation('post', result, { UserTelephone: cfg.userPhone || '', Searchsort: 'rating', Limit: 10, PostType: '' });
    displayPostWithComments(item, getNavStatus());
  }
});

module.exports = post;
