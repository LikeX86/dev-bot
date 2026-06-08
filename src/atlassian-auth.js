const config = require('./config');

function getAuthHeader() {
  const email = config.atlassian.email();
  const token = config.atlassian.apiToken();
  const encoded = Buffer.from(`${email}:${token}`).toString('base64');
  return `Basic ${encoded}`;
}

async function atlassianFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const detail = typeof data === 'object' ? JSON.stringify(data) : data;
    throw new Error(`HTTP ${response.status} — ${detail}`);
  }

  return data;
}

module.exports = { atlassianFetch, getAuthHeader };
