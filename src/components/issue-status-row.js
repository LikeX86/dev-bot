const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const CUSTOM_ID_PREFIX = 'jira:status:';

// Botões de status exibidos na mensagem do /link-pr.
// O nome real da transição no Jira pode ser sobrescrito por variável de ambiente.
const STATUS_ACTIONS = [
  {
    code: 'andamento',
    style: ButtonStyle.Primary,
    statusName: () => process.env.JIRA_STATUS_IN_PROGRESS || 'Em andamento',
  },
  {
    code: 'analise',
    style: ButtonStyle.Secondary,
    statusName: () => process.env.JIRA_TRANSITION_ON_LINK || 'Em análise',
  },
  {
    code: 'concluido',
    style: ButtonStyle.Success,
    statusName: () => process.env.JIRA_TRANSITION_ON_COMPLETE || 'Concluído',
  },
];

function findActionByCode(code) {
  return STATUS_ACTIONS.find((action) => action.code === code) || null;
}

function buildCustomId(code, issueKey) {
  return `${CUSTOM_ID_PREFIX}${code}:${issueKey}`;
}

function parseCustomId(customId) {
  if (!customId.startsWith(CUSTOM_ID_PREFIX)) {
    return null;
  }

  const rest = customId.slice(CUSTOM_ID_PREFIX.length);
  const separatorIndex = rest.indexOf(':');

  if (separatorIndex === -1) {
    return null;
  }

  const code = rest.slice(0, separatorIndex);
  const issueKey = rest.slice(separatorIndex + 1);
  const action = findActionByCode(code);

  if (!action || !issueKey) {
    return null;
  }

  return { code, issueKey, action };
}

function buildStatusRow(issueKey, currentStatusName = '') {
  const normalizedCurrent = currentStatusName.trim().toLowerCase();

  return new ActionRowBuilder().addComponents(
    STATUS_ACTIONS.map((action) => {
      const statusName = action.statusName();
      const isCurrent = statusName.toLowerCase() === normalizedCurrent;

      return new ButtonBuilder()
        .setCustomId(buildCustomId(action.code, issueKey))
        .setLabel(statusName)
        .setStyle(action.style)
        .setDisabled(isCurrent);
    })
  );
}

module.exports = {
  CUSTOM_ID_PREFIX,
  STATUS_ACTIONS,
  buildStatusRow,
  parseCustomId,
};
