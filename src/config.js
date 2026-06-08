require('dotenv').config();

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
    projectKey: () => required('JIRA_PROJECT_KEY'),
    transitionOnLink: process.env.JIRA_TRANSITION_ON_LINK || 'Em análise',
    statuses: ['A fazer', 'Em andamento', 'Em análise', 'Concluído'],
  },
  bitbucket: {
    workspace: () => required('BITBUCKET_WORKSPACE'),
  },
};
