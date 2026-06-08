const { REST, Routes } = require('discord.js');
const config = require('./config');
const linkPr = require('./commands/link-pr');
const jiraStatus = require('./commands/jira-status');

const commands = [linkPr.data.toJSON(), jiraStatus.data.toJSON()];

async function main() {
  const rest = new REST({ version: '10' }).setToken(config.discord.token());
  const applicationId = config.discord.applicationId();
  const guildId = config.discord.guildId;

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
      body: commands,
    });
    console.log(`Comandos registrados no servidor ${guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(applicationId), {
      body: commands,
    });
    console.log('Comandos registrados globalmente');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
