const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getIssue } = require('../jira');

const data = new SlashCommandBuilder()
  .setName('jira-status')
  .setDescription('Consulta o status de uma task do Jira')
  .addStringOption((option) =>
    option
      .setName('issue')
      .setDescription('Chave da issue (ex.: PROJ-123)')
      .setRequired(true)
  );

async function execute(interaction) {
  const issueKey = interaction.options.getString('issue').trim().toUpperCase();

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const issue = await getIssue(issueKey);

    await interaction.editReply({
      content: [
        `**${issueKey}** — ${issue.fields.summary}`,
        `**Status:** ${issue.fields.status.name}`,
      ].join('\n'),
    });
  } catch (error) {
    await interaction.editReply({
      content: `❌ ${error.message}`,
    });
  }
}

module.exports = { data, execute };
