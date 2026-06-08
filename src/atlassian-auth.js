const config = require('./config');

function buildAuthHeader(email, token) {
  const encoded = Buffer.from(`${email}:${token}`).toString('base64');
  return `Basic ${encoded}`;
}

function getJiraAuthHeader() {
  return buildAuthHeader(
    config.atlassian.email(),
    config.atlassian.apiToken()
  );
}

function getBitbucketAuthHeader() {
  return buildAuthHeader(
    config.atlassian.email(),
    config.bitbucket.apiToken()
  );
}

async function atlassianFetch(url, options = {}, authHeader = getJiraAuthHeader()) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader,
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

async function bitbucketFetch(url, options = {}) {
  return atlassianFetch(url, options, getBitbucketAuthHeader());
}

async function jiraFetch(url, options = {}) {
  const authMode = config.jira.authMode;

  if (authMode === 'basic') {
    return atlassianFetch(url, options, getJiraAuthHeader());
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.atlassian.apiToken()}`,
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
    throw new Error(formatJiraHttpError(response.status, data));
  }

  return data;
}

function formatJiraHttpError(status, data) {
  const detail = typeof data === 'object' ? JSON.stringify(data) : data;

  if (status === 404) {
    return 'Issue não encontrada ou sem permissão no Jira. Verifique a key e o acesso da conta configurada em ATLASSIAN_EMAIL.';
  }

  if (status === 401 || status === 403) {
    return `Falha de autenticação no Jira (HTTP ${status}). Revise ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN e JIRA_AUTH_MODE no .env.`;
  }

  return `HTTP ${status} — ${detail}`;
}

module.exports = {
  atlassianFetch,
  bitbucketFetch,
  jiraFetch,
  getJiraAuthHeader,
  getBitbucketAuthHeader,
};
