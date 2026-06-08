# Dev Bot — Discord + Jira + Bitbucket

Bot isolado para **ambiente de teste**. Não faz parte do Arpenium Laravel e não deve usar credenciais de produção da equipe.

## O que faz

| Comando | Descrição |
|---------|-----------|
| `/link-pr` | Vincula PR do Bitbucket à task Jira (link + comentário + status → **Em análise**) |
| `/jira-status` | Consulta status da task |

## Status Jira suportados

- A fazer
- Em andamento
- **Em análise** ← transição ao vincular PR
- Concluído

## Pré-requisitos

- Node.js 18+
- Conta Discord (Application + Bot)
- Conta Jira Cloud free (sandbox)
- Conta Bitbucket Cloud free (sandbox)
- Token Atlassian: https://id.atlassian.com/manage-profile/security/api-tokens

## Configuração

1. Copie o exemplo de ambiente:

```bash
cp .env.example .env
```

2. Preencha `.env`:

```env
DISCORD_BOT_TOKEN=          # Bot → Token (Developer Portal)
DISCORD_APPLICATION_ID=1513392554408939681
DISCORD_GUILD_ID=           # ID do servidor Discord de teste

ATLASSIAN_EMAIL=            # e-mail da conta Atlassian de teste
ATLASSIAN_API_TOKEN=        # token ATATT...

JIRA_BASE_URL=https://SEU-WORKSPACE.atlassian.net
JIRA_PROJECT_KEY=           # ex.: TEST

JIRA_TRANSITION_ON_LINK=Em análise
BITBUCKET_WORKSPACE=        # ex.: likex
```

3. No [Discord Developer Portal](https://discord.com/developers/applications/1513392554408939681):

   - Bot → **Reset Token** → copie para `DISCORD_BOT_TOKEN`
   - Bot → ative **Message Content Intent** (opcional, não usado no MVP)
   - OAuth2 → URL Generator → scopes: `bot`, `applications.commands`
   - Convide o bot ao servidor de teste

4. Instale e registre comandos:

```bash
npm install
npm run register-commands
npm start
```

## Uso

```
/link-pr issue:TEST-1 url:https://bitbucket.org/seu-workspace/seu-repo/pull-requests/1
/jira-status issue:TEST-1
```

## Segurança

- **Nunca** commite `.env`
- Use contas e projetos **sandbox** até validar tudo
- Rotacione tokens expostos em chats ou logs
- A chave pública do Discord (`DISCORD_PUBLIC_KEY`) só é necessária para webhooks HTTP; este bot usa Gateway WebSocket

## Deploy no seu VPS

```bash
# Exemplo com pm2
npm install --production
npm run register-commands
pm2 start src/index.js --name dev-bot
```
