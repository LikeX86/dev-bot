const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} = require('discord.js');
const config = require('./config');
const linkPr = require('./commands/link-pr');
const jiraStatus = require('./commands/jira-status');
const jiraComment = require('./commands/jira-comment');
const ping = require('./commands/ping');
const { handleIssueStatusButton } = require('./handlers/issue-status-button');
const { CUSTOM_ID_PREFIX } = require('./components/issue-status-row');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection();

[linkPr, jiraStatus, jiraComment, ping].forEach((command) => {
  commands.set(command.data.name, command);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot conectado como ${readyClient.user.tag}`);
  console.log(`Jira: ${config.jira.baseUrl()} | Bitbucket: ${config.bitbucket.workspace()}`);
});

async function safeReply(interaction, content) {
  const payload = {
    content,
    flags: MessageFlags.Ephemeral,
  };

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (replyError) {
    if ([10062, 40060, 10008].includes(replyError.code)) {
      console.warn(`Interação Discord expirada ou já respondida (${replyError.code})`);
      return;
    }

    throw replyError;
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith(CUSTOM_ID_PREFIX)) {
    try {
      await handleIssueStatusButton(interaction);
    } catch (error) {
      console.error(error);
      await safeReply(interaction, '❌ Erro ao processar o botão.');
    }
    return;
  }

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
    await safeReply(interaction, '❌ Erro interno ao executar o comando.');
  }
});

client.on('error', (error) => {
  console.error('Erro no client Discord:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promise rejeitada sem tratamento:', error);
});

client.login(config.discord.token());
