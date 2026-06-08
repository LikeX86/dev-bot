const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');

const startedAt = Date.now();

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Verifica se o bot está online');

async function execute(interaction) {
  const latency = Date.now() - interaction.createdTimestamp;
  const apiLatency = Math.round(interaction.client.ws.ping);
  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    content: [
      '🟢 Bot online',
      `• Discord: ${latency}ms`,
      `• API: ${apiLatency}ms`,
      `• Uptime: ${uptimeSeconds}s`,
      `• Jira: ${config.jira.baseUrl()}`,
      `• Bitbucket: ${config.bitbucket.workspace()}`,
    ].join('\n'),
  });
}

module.exports = { data, execute };
