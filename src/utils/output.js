const Table = require('cli-table3');
const chalk = require('chalk');

function truncate(str, maxLen = 50) {
  if (!str) return '';
  str = String(str);
  return str.length <= maxLen ? str : str.substring(0, maxLen) + chalk.gray('...');
}

function formatValue(value, depth = 0) {
  if (depth > 2) return chalk.gray('[Nested...]');
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (typeof value[0] === 'object' && value[0] !== null) {
      return chalk.gray(`[Array(${value.length})]`);
    }
    return `[${value.map(v => formatValue(v, depth + 1)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return chalk.gray(`[Object]`);
  }
  return String(value);
}

function formatOutput(data, format = 'table') {
  switch (format) {
    case 'json': return JSON.stringify(data, null, 2);
    case 'table': return formatAsTable(data);
    case 'pretty': return formatAsPretty(data);
    default: return formatAsList(data);
  }
}

function formatAsTable(data) {
  if (!data) return '';
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    const allHeaders = Object.keys(firstItem);
    let headers;
    if (allHeaders.includes('PostID') && allHeaders.includes('Title')) {
      headers = ['PostID', 'UserName', 'Title', 'Like', 'Comment', 'Heat', 'PostTime'];
    } else if (allHeaders.includes('ProductID') && allHeaders.includes('Name')) {
      headers = ['ProductID', 'Name', 'Price', 'Description'];
    } else {
      headers = allHeaders.slice(0, 8);
    }
    const table = new Table({ head: headers.map(h => chalk.cyan.bold(h)) });
    data.forEach(item => table.push(headers.map(key => {
      const value = item[key];
      return typeof value === 'string' && value.length > 60 ? truncate(value, 60) : formatValue(value);
    })));
    return table.toString();
  } else if (typeof data === 'object') {
    const table = new Table();
    Object.entries(data).forEach(([key, value]) => {
      table.push({ [chalk.cyan.bold(key)]: truncate(formatValue(value), 100) });
    });
    return table.toString();
  }
  return formatValue(data);
}

function formatAsList(data) {
  if (!data) return '';
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item, i) => {
      const isMony = item.UserName === 'Mony';
      if (item.PostID && item.Title) {
        const titleColor = isMony ? chalk.yellow.bold : chalk.green.bold;
        const numberPrefix = isMony ? chalk.yellow('✨') + ' ' : '';
        return `\n${numberPrefix}${chalk.yellow.bold(`#${i + 1}`)} ${chalk.dim(`[${item.PostID}]`)} ${titleColor(item.Title)}
   ${chalk.yellow('👍')} ${item.Like}  ${chalk.blue('💬')} ${item.Comment}
   ${chalk.gray(truncate(item.Content, 60))}`;
      } else if (item.ProductID && item.Name) {
        return `\n${chalk.yellow.bold(`#${i + 1}`)} ${chalk.dim(`[${item.ProductID}]`)} ${chalk.magenta.bold(item.Name)}
   ${chalk.green('¥')}${item.Price}
   ${chalk.gray(truncate(item.Description, 80))}`;
      }
      return `\n${chalk.yellow.bold(`#${i + 1}`)}\n${Object.entries(item).slice(0, 6).map(([k, v]) => `   ${chalk.cyan(k)}: ${truncate(formatValue(v), 50)}`).join('\n')}`;
    }).join('\n');
  } else if (typeof data === 'object') {
    return Object.entries(data).map(([k, v]) => `${chalk.cyan.bold(k)}: ${formatValue(v)}`).join('\n');
  }
  return formatValue(data);
}

function formatAsPretty(data) {
  if (!data) return '';
  const skip = ['UserScore', 'UserTelephone', 'UserAvatar', 'Photos', 'Tag'];
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item, i) => {
      const isMony = item.UserName === 'Mony';
      const borderColor = isMony ? chalk.yellow : chalk.yellow;
      const headerLine = isMony 
        ? `\n${borderColor('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}\n${borderColor('┃')} ✨ ${chalk.bold.yellow('尊贵的 Mony 帖子')} ✨ ${borderColor('┃')}\n${borderColor('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}`
        : `\n${borderColor('━━━')} ${chalk.bold(i + 1)} ${borderColor('━━━')}`;
      return headerLine + '\n' +
        Object.entries(item).filter(([k]) => !skip.includes(k)).map(([k, v]) => {
          const val = formatValue(v);
          const keyColor = isMony ? chalk.yellow.bold : chalk.cyan.bold;
          return `  ${keyColor(k.padEnd(12))}: ${val.length > 200 ? val.substring(0, 200) + '\n  ' + chalk.gray('...') : val}`;
        }).join('\n');
    }).join('\n');
  } else if (typeof data === 'object') {
    const isMony = data.UserName === 'Mony';
    let result = '';
    if (isMony) {
      result += `${chalk.yellow('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}\n`;
      result += `${chalk.yellow('┃')} ✨ ${chalk.bold.yellow('尊贵的 Mony 帖子')} ✨ ${chalk.yellow('┃')}\n`;
      result += `${chalk.yellow('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}\n`;
    }
    result += Object.entries(data).filter(([k]) => !skip.includes(k)).map(([k, v]) => {
      const keyColor = isMony ? chalk.yellow.bold : chalk.cyan.bold;
      return `${keyColor(k)}: ${formatValue(v)}`;
    }).join('\n');
    return result;
  }
  return formatValue(data);
}

function printOutput(data, format = 'list') {
  console.log(formatOutput(data, format));
}

module.exports = { formatOutput, formatAsTable, formatAsList, formatAsPretty, printOutput, chalk };
