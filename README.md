# Dev Bot — Discord + Jira + Bitbucket

Bot para equipe de desenvolvimento integrar PRs do Bitbucket com tasks do Jira via Discord.

## Comandos

| Comando | Descrição |
|---------|-----------|
| `/link-pr` | Vincula PR aberto do Bitbucket à issue (link + comentário + status) |
| `/jira-status` | Consulta título e status da issue |
| `/jira-comment` | Adiciona comentário manual na issue |

Após o `/link-pr`, a mensagem exibe botões para alterar o status no Jira: **Em andamento**, **Em análise** e **Concluído**.

## Pré-requisitos

- Node.js 18+
- Bot Discord (Application + Token)
- Jira Cloud + Bitbucket Cloud (sandbox)
- Token clássico Atlassian para Jira (`JIRA_AUTH_MODE=basic`)

## Configuração

```bash
cp .env.example .env
npm install
npm run register-commands
npm start
```

Variáveis principais no `.env`:

```env
DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=
DISCORD_GUILD_ID=

ATLASSIAN_EMAIL=
ATLASSIAN_API_TOKEN=
BITBUCKET_API_TOKEN=

JIRA_BASE_URL=https://seu-workspace.atlassian.net
JIRA_PROJECT_KEY=
JIRA_AUTH_MODE=basic

JIRA_TRANSITION_ON_LINK=Em análise
JIRA_TRANSITION_ON_COMPLETE=Concluído
JIRA_STATUS_IN_PROGRESS=Em andamento

BITBUCKET_WORKSPACE=
# TECHLEAD_ROLE_ID=   # opcional — restringe botões de status
```

## Uso

```
/link-pr issue:SCRUM-1 url:https://bitbucket.org/workspace/repo/pull-requests/1
/jira-status issue:SCRUM-1
/jira-comment issue:SCRUM-1 texto:Revisado, aguardando merge
```

## Deploy (pm2)

```bash
npm install --production
npm run register-commands
pm2 start src/index.js --name dev-bot
```

## Segurança

- Nunca commite `.env`
- Rotacione tokens periodicamente
- Use apenas contas e workspaces de sandbox/teste
