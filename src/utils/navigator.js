const { loadConfig, saveConfig } = require('../config');

const NAV_HISTORY_KEY = 'navHistory';
const NAV_INDEX_KEY = 'navIndex';
const NAV_TYPE_KEY = 'navType';
const NAV_QUERY_KEY = 'navQuery';
const NAV_OFFSET_KEY = 'navOffset';

function getNavigatorState() {
  const config = loadConfig();
  return {
    history: config[NAV_HISTORY_KEY] || [],
    index: config[NAV_INDEX_KEY] ?? -1,
    type: config[NAV_TYPE_KEY] || null,
    query: config[NAV_QUERY_KEY] || null,
    offset: config[NAV_OFFSET_KEY] ?? 0,
  };
}

function setNavigatorState(state) {
  const config = loadConfig();
  config[NAV_HISTORY_KEY] = state.history;
  config[NAV_INDEX_KEY] = state.index;
  config[NAV_TYPE_KEY] = state.type;
  config[NAV_QUERY_KEY] = state.query;
  config[NAV_OFFSET_KEY] = state.offset;
  saveConfig(config);
}

function clearNavigator() {
  const config = loadConfig();
  config[NAV_HISTORY_KEY] = [];
  config[NAV_INDEX_KEY] = -1;
  config[NAV_TYPE_KEY] = null;
  config[NAV_QUERY_KEY] = null;
  config[NAV_OFFSET_KEY] = 0;
  saveConfig(config);
}

function startNavigation(type, items, query = null) {
  if (!items || items.length === 0) {
    console.log('No items to navigate');
    return null;
  }
  const state = {
    history: items,
    index: 0,
    type: type,
    query: query,
    offset: 0,
  };
  setNavigatorState(state);
  return state.history[0];
}

function getCurrent() {
  const state = getNavigatorState();
  if (state.index < 0 || state.index >= state.history.length) {
    return null;
  }
  return state.history[state.index];
}

async function loadNextPage() {
  const state = getNavigatorState();
  if (!state.query || !state.type) {
    return null;
  }

  try {
    const { postAPI } = require('../api/client');
    const nextOffset = state.offset + state.history.length;
    let result;

    if (state.type === 'post') {
      result = await postAPI('/api/auth/browse', {
        ...state.query,
        Offset: nextOffset,
      });
    } else if (state.type === 'product') {
      result = await postAPI('/api/auth/getProducts', {
        ...state.query,
        Offset: nextOffset,
      });
    }

    if (Array.isArray(result) && result.length > 0) {
      const newHistory = [...state.history, ...result];
      state.history = newHistory;
      state.offset = nextOffset;
      setNavigatorState(state);
      return { loaded: true, state };
    }
    return { loaded: false, state };
  } catch (error) {
    console.error('Failed to load next page:', error.message);
    return { loaded: false, state };
  }
}

async function getNext() {
  let state = getNavigatorState();

  if (state.index + 1 >= state.history.length) {
    const result = await loadNextPage();
    if (!result.loaded) {
      console.log('Already at the last item');
      return getCurrent();
    }
    state = result.state;
  }

  state.index++;
  setNavigatorState(state);
  return getCurrent();
}

function getPrev() {
  const state = getNavigatorState();
  if (state.index - 1 < 0) {
    state.index = 0;
    setNavigatorState(state);
    console.log('Already at the first item');
    return getCurrent();
  }
  state.index--;
  setNavigatorState(state);
  return getCurrent();
}

function goToIndex(index) {
  const state = getNavigatorState();
  if (index < 0 || index >= state.history.length) {
    console.log('Invalid index');
    return null;
  }
  state.index = index;
  setNavigatorState(state);
  return getCurrent();
}

function getNavStatus() {
  const state = getNavigatorState();
  return {
    type: state.type,
    current: state.index + 1,
    total: state.history.length,
    hasPrev: state.index > 0,
    hasNext: true,
  };
}

module.exports = {
  startNavigation,
  getCurrent,
  getNext,
  getPrev,
  goToIndex,
  getNavStatus,
  clearNavigator,
  getNavigatorState,
};
