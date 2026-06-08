const { MessageFlags } = require('discord.js');
const { transitionIssue, getIssue, addComment } = require('../jira');
const { buildStatusRow, parseCustomId } = require('../components/issue-status-row');

function canManageIssue(member) {
  const roleId = process.env.TECHLEAD_ROLE_ID;

  if (!roleId) {
    return true;
  }

  return Boolean(member?.roles?.cache?.has(roleId));
}

function replaceStatusLine(content, statusName) {
  const statusLinePattern = /• \*\*Status:\*\* .+/;

  if (statusLinePattern.test(content)) {
    return content.replace(statusLinePattern, `• **Status:** ${statusName}`);
  }

  return `${content}\n• **Status:** ${statusName}`;
}

async function handleIssueStatusButton(interaction) {
  const parsed = parseCustomId(interaction.customId);

  if (!parsed) {
    return;
  }

  const { issueKey, action } = parsed;
  const statusName = action.statusName();

  if (!canManageIssue(interaction.member)) {
    await interaction.reply({
      content: '❌ Você não tem permissão para alterar o status desta issue.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferUpdate();

  try {
    await transitionIssue(issueKey, statusName);
    await addComment(
      issueKey,
      `Status alterado para **${statusName}** via Discord por ${interaction.user.tag}`
    );

    const issue = await getIssue(issueKey);
    const currentStatus = issue.fields.status.name;

    await interaction.editReply({
      content: replaceStatusLine(interaction.message.content, currentStatus),
      components: [buildStatusRow(issueKey, currentStatus)],
    });
  } catch (error) {
    await interaction.followUp({
      content: `❌ Não foi possível alterar **${issueKey}** para "${statusName}": ${error.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { handleIssueStatusButton, canManageIssue };
