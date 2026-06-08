const { SlashCommandBuilder } = require('discord.js');
const { getPullRequest } = require('../bitbucket');
const { linkPullRequest } = require('../jira');

const data = new SlashCommandBuilder()
  .setName('link-pr')
  .setDescription('Vincula um PR do Bitbucket a uma task do Jira')
  .addStringOption((option) =>
    option
      .setName('issue')
      .setDescription(`Chave da issue (ex.: ${process.env.JIRA_PROJECT_KEY || 'PROJ'}-123)`)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('url')
      .setDescription('URL do pull request no Bitbucket')
      .setRequired(true)
  );

async function execute(interaction) {
  const issueKey = interaction.options.getString('issue').trim().toUpperCase();
  const prUrl = interaction.options.getString('url').trim();
  const discordUser = interaction.user.tag;

  await interaction.deferReply();

  try {
    const pr = await getPullRequest(prUrl);
    const result = await linkPullRequest(issueKey, pr, discordUser);

    const lines = [
      `✅ **${result.issueKey}** atualizada`,
      `• **Task:** ${result.summary}`,
      `• **PR:** ${result.prTitle}`,
      `• **Link:** ${result.prUrl}`,
      `• **Status:** ${result.status}`,
    ];

    if (result.transitionWarning) {
      lines.push(`• ⚠️ Transição: ${result.transitionWarning}`);
    }

    await interaction.editReply({ content: lines.join('\n') });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Não foi possível vincular o PR.\n\`\`\`${error.message}\`\`\``,
    });
  }
}

module.exports = { data, execute };
