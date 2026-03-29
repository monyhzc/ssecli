const { getConfig } = require('../config');
const { getNavStatus } = require('./navigator');
const { printOutput, chalk } = require('./output');

const BORDER_WIDTH = 75;

function createBorderLine(left, middle, right) {
  return left + middle.repeat(BORDER_WIDTH - 2) + right;
}

function createCenteredText(text) {
  const maxTextLength = BORDER_WIDTH - 4;
  let displayText = text;
  
  if (displayText.length > maxTextLength) {
    displayText = displayText.substring(0, maxTextLength - 3) + '...';
  }
  
  const padding = Math.floor((BORDER_WIDTH - 4 - displayText.length) / 2);
  return ' '.repeat(Math.max(0, padding)) + displayText + ' '.repeat(Math.max(0, BORDER_WIDTH - 4 - displayText.length - padding));
}

function displayNavItem(item, status, format = 'pretty') {
  const type = status.type?.toUpperCase() || 'ITEM';
  const headerText = `${type} ${status.current}/${status.total}`;
  console.log(`\n${chalk.yellow(createBorderLine('╔', '═', '╗'))}`);
  console.log(`${chalk.yellow('║')}${createCenteredText(headerText)}${chalk.yellow('║')}`);
  console.log(`${chalk.yellow(createBorderLine('╚', '═', '╝'))}\n`);
  printOutput(item, format);
  console.log(`\n${chalk.dim(createBorderLine('┌', '─', '┐'))}`);
  console.log(`${chalk.dim('│')}${createCenteredText('Next: ssecli next  |  Prev: ssecli prev  |  Curr: ssecli curr')}${chalk.dim('│')}`);
  console.log(`${chalk.dim(createBorderLine('└', '─', '┘'))}\n`);
}

async function displayPostWithComments(post, status) {
  printOutput(post, 'pretty');
  if (post.Comment > 0) {
    try {
      const cfg = getConfig();
      const comments = await require('../api/client').postAPI('/api/auth/showPcomments', {
        userTelephone: cfg.userPhone || '',
        postID: parseInt(post.PostID),
        postType: 'post',
      });
      if (Array.isArray(comments) && comments.length > 0) {
        const headerText = `💬 ${comments.length} 条评论`;
        console.log(`\n${chalk.blue(createBorderLine('╔', '═', '╗'))}`);
        console.log(`${chalk.blue('║')}${createCenteredText(headerText)}${chalk.blue('║')}`);
        console.log(`${chalk.blue(createBorderLine('╚', '═', '╝'))}`);
        comments.forEach((c, i) => {
          const author = c.Author || c.UserName || '匿名';
          const content = c.Content || c.Pctext || '';
          const isLast = i === comments.length - 1;
          const isMony = author === 'Mony';
          const prefix = isLast ? chalk.gray('└') : chalk.gray('├');
          const authorColor = isMony ? chalk.yellow.bold : chalk.magenta;
          const numberPrefix = isMony ? chalk.yellow('✨') + ' ' : '';
          const contentColor = isMony ? chalk.yellow : chalk.gray;
          console.log(`\n${prefix}${chalk.gray('─')} ${numberPrefix}${chalk.yellow.bold(i + 1)}. ${authorColor(author)}`);
          console.log(`   ${contentColor(content)}`);
          
          if (Array.isArray(c.SubComments) && c.SubComments.length > 0) {
            c.SubComments.forEach((sub, j) => {
              const subAuthor = sub.author || sub.Author || sub.UserName || '匿名';
              const subContent = sub.content || sub.Content || sub.Cctext || '';
              const subIsLast = j === c.SubComments.length - 1;
              const subIsMony = subAuthor === 'Mony';
              const subPrefix = subIsLast ? chalk.gray('   └') : chalk.gray('   ├');
              const replyTo = sub.userTargetName || sub.UserTargetName ? `回复 ${sub.userTargetName || sub.UserTargetName}` : '';
              const subAuthorColor = subIsMony ? chalk.yellow.bold : chalk.cyan;
              const subContentColor = subIsMony ? chalk.yellow : chalk.gray;
              const subNumberPrefix = subIsMony ? chalk.yellow('✨') + ' ' : '';
              console.log(`${subPrefix}${chalk.gray('─')} ${subNumberPrefix}${subAuthorColor(subAuthor)}${replyTo ? ' ' + chalk.dim(replyTo) : ''}`);
              console.log(`      ${subContentColor(subContent)}`);
            });
          }
        });
      }
    } catch (e) {
      console.log(`\n${chalk.red('⚠️')} 获取评论失败`);
    }
  }
  console.log(`\n${chalk.dim(createBorderLine('┌', '─', '┐'))}`);
  console.log(`${chalk.dim('│')}${createCenteredText('Next: ssecli next  |  Prev: ssecli prev  |  Curr: ssecli curr')}${chalk.dim('│')}`);
  console.log(`${chalk.dim(createBorderLine('└', '─', '┘'))}\n`);
}

module.exports = { displayNavItem, displayPostWithComments, getNavStatus, chalk };
