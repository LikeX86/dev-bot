require('dotenv').config({ override: true });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

module.exports = {
  discord: {
    token: () => required('DISCORD_BOT_TOKEN'),
    applicationId: () => required('DISCORD_APPLICATION_ID'),
    guildId: process.env.DISCORD_GUILD_ID || null,
  },
  atlassian: {
    email: () => required('ATLASSIAN_EMAIL'),
    apiToken: () => required('ATLASSIAN_API_TOKEN'),
  },
  jira: {
    baseUrl: () => required('JIRA_BASE_URL').replace(/\/$/, ''),
    cloudId: () => required('JIRA_CLOUD_ID'),
    projectKey: () => required('JIRA_PROJECT_KEY'),
    transitionOnLink: process.env.JIRA_TRANSITION_ON_LINK || 'Em análise',
    authMode: process.env.JIRA_AUTH_MODE || 'gateway',
    statuses: ['A fazer', 'Em andamento', 'Em análise', 'Concluído'],
  },
  bitbucket: {
    workspace: () => required('BITBUCKET_WORKSPACE'),
    apiToken: () =>
      process.env.BITBUCKET_API_TOKEN || required('ATLASSIAN_API_TOKEN'),
  },
};
