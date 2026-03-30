const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

const mcp = new Command('mcp').description('MCP server configuration');

mcp.command('config').description('Generate MCP server configuration JSON')
  .action(() => {
    const installPath = path.resolve(__dirname, '..', '..');
    
    const mcpServerPath = path.join(installPath, 'src', 'mcp-server.js');
    
    const config = {
      mcpServers: {
        ssecli: {
          command: 'node',
          args: [mcpServerPath],
          cwd: installPath,
          env: {}
        }
      }
    };
    
    console.log(JSON.stringify(config, null, 2));
  });

mcp.command('install').description('Show installation guide for Claude/Trae')
  .action(() => {
    const installPath = path.resolve(__dirname, '..', '..');
    
    const mcpServerPath = path.join(installPath, 'src', 'mcp-server.js');
    
    const config = {
      mcpServers: {
        ssecli: {
          command: 'node',
          args: [mcpServerPath],
          cwd: installPath,
          env: {}
        }
      }
    };

    console.log('\n📦 SSE CLI MCP Server Configuration Guide\n');
    console.log('=' .repeat(50));
    console.log('\n1️⃣  Run this command to get your MCP config:\n');
    console.log('   ssecli mcp config\n');
    console.log('2️⃣  Add the output to your MCP config file:\n');
    console.log('   - Claude Desktop: ~/.config/claude/claude_desktop_config.json');
    console.log('   - Trae: ~/.config/trae/mcp_config.json');
    console.log('   - Cursor: ~/.cursor/mcp_config.json\n');
    console.log('3️⃣  Your generated config:\n');
    console.log(JSON.stringify(config, null, 2));
    console.log('\n' + '=' .repeat(50));
    console.log('\n💡 Tip: Copy the config above and add it to your MCP config file!\n');
  });

module.exports = mcp;
