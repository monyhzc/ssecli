const { Command } = require('commander');
const { getNext, getPrev, getCurrent, clearNavigator } = require('../utils/navigator');
const { displayNavItem, displayPostWithComments, getNavStatus, chalk } = require('../utils/display');

const nav = new Command('nav').description('Navigate through items');

function handleNav(item) {
  if (!item) {
    console.log(chalk.red('⚠️ Use ssecli post or ssecli product first.'));
    return;
  }
  const status = getNavStatus();
  status.type === 'post' ? displayPostWithComments(item, status) : displayNavItem(item, status);
}

nav.command('next').alias('n').description('Go to next item').action(async () => {
  handleNav(await getNext());
});

nav.command('prev').alias('p').description('Go to previous item').action(() => {
  handleNav(getPrev());
});

nav.command('curr').alias('c').description('Show current item').action(() => {
  handleNav(getCurrent());
});

nav.command('status').description('Show navigation status').action(() => {
  const status = getNavStatus();
  if (!status.type) {
    console.log(chalk.yellow('⚠️ No navigation in progress.'));
    return;
  }
  console.log(chalk.cyan.bold('Type') + ': ' + status.type + ' | ' + chalk.cyan.bold('Position') + ': ' + status.current + '/' + status.total);
});

nav.command('clear').description('Clear navigation history').action(() => {
  clearNavigator();
  console.log(chalk.green('✅ Navigation cleared!'));
});

module.exports = nav;
