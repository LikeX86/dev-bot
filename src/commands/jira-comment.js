const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const { getIssue, addComment } = require('../jira');

const data = new SlashCommandBuilder()
  .setName('jira-comment')
  .setDescription('Adiciona um comentário a uma task do Jira')
  .addStringOption((option) =>
    option
      .setName('issue')
      .setDescription(`Chave da issue (ex.: ${process.env.JIRA_PROJECT_KEY || 'PROJ'}-123)`)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('texto')
      .setDescription('Conteúdo do comentário')
      .setRequired(true)
  );

async function execute(interaction) {
  const issueKey = interaction.options.getString('issue').trim().toUpperCase();
  const texto = interaction.options.getString('texto').trim();
  const discordUser = interaction.user.tag;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const projectKey = config.jira.projectKey();

  if (!issueKey.startsWith(`${projectKey}-`)) {
    await interaction.editReply({
      content: `❌ A issue deve pertencer ao projeto ${projectKey}.`,
    });
    return;
  }

  try {
    const issue = await getIssue(issueKey);
    await addComment(issueKey, `${texto}\n\n— comentário via Discord por ${discordUser}`);

    await interaction.editReply({
      content: [
        `✅ Comentário adicionado em **${issueKey}** — ${issue.fields.summary}`,
        `> ${texto}`,
      ].join('\n'),
    });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Não foi possível comentar em **${issueKey}**: ${error.message}`,
    });
  }
}

module.exports = { data, execute };
