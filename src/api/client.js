const axios = require('axios');
const { getConfig } = require('../config');

function createClient() {
  const config = getConfig();
  const baseURL = config.apiBaseUrl || 'https://ssemarket.cn';
  const token = config.token;

  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  client.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      console.error('API Error:', error.response?.data?.msg || error.response?.data?.message || error.message);
      process.exit(1);
    }
  );

  return client;
}

function postAPI(endpoint, data = {}) {
  const client = createClient();
  return client.post(endpoint, data);
}

function getAPI(endpoint, params = {}) {
  const client = createClient();
  return client.get(endpoint, { params });
}

module.exports = {
  createClient,
  postAPI,
  getAPI,
};
