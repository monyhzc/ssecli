const fs = require('fs-extra');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME || '/tmp', '.ssemarket-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureConfigDir() {
  fs.ensureDirSync(CONFIG_DIR);
}

function loadConfig() {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    return fs.readJsonSync(CONFIG_FILE);
  }
  return {};
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeJsonSync(CONFIG_FILE, config, { spaces: 2 });
}

function getConfig(key) {
  const config = loadConfig();
  return key ? config[key] : config;
}

function setConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
}

function clearConfig() {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    fs.removeSync(CONFIG_FILE);
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  getConfig,
  setConfig,
  clearConfig,
  CONFIG_DIR,
  CONFIG_FILE
};
