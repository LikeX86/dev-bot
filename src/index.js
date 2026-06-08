const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const linkPr = require('./commands/link-pr');
const jiraStatus = require('./commands/jira-status');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection();

[linkPr, jiraStatus].forEach((command) => {
  commands.set(command.data.name, command);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot conectado como ${readyClient.user.tag}`);
  console.log(`Jira: ${config.jira.baseUrl()} | Bitbucket: ${config.bitbucket.workspace()}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    const reply = {
      content: '❌ Erro interno ao executar o comando.',
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(config.discord.token());
