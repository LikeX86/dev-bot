const config = require('./config');
const { atlassianFetch } = require('./atlassian-auth');

function jiraUrl(path) {
  return `${config.jira.baseUrl()}/rest/api/3${path}`;
}

function textToAdf(text) {
  return {
    type: 'doc',
    version: 1,
    content: text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : [],
    })),
  };
}

async function getIssue(issueKey) {
  return atlassianFetch(
    jiraUrl(`/issue/${issueKey}?fields=summary,status`)
  );
}

async function addRemoteLink(issueKey, url, title) {
  return atlassianFetch(jiraUrl(`/issue/${issueKey}/remotelink`), {
    method: 'POST',
    body: JSON.stringify({
      object: {
        url,
        title,
      },
    }),
  });
}

async function addComment(issueKey, text) {
  return atlassianFetch(jiraUrl(`/issue/${issueKey}/comment`), {
    method: 'POST',
    body: JSON.stringify({
      body: textToAdf(text),
    }),
  });
}

async function getTransitions(issueKey) {
  const data = await atlassianFetch(jiraUrl(`/issue/${issueKey}/transitions`));
  return data.transitions || [];
}

async function transitionIssue(issueKey, transitionName) {
  const transitions = await getTransitions(issueKey);
  const match = transitions.find(
    (t) => t.name.toLowerCase() === transitionName.toLowerCase()
  );

  if (!match) {
    const available = transitions.map((t) => t.name).join(', ') || 'nenhuma';
    throw new Error(
      `Transição "${transitionName}" indisponível. Disponíveis: ${available}`
    );
  }

  return atlassianFetch(jiraUrl(`/issue/${issueKey}/transitions`), {
    method: 'POST',
    body: JSON.stringify({
      transition: { id: match.id },
    }),
  });
}

async function linkPullRequest(issueKey, pr, discordUser) {
  const issue = await getIssue(issueKey);
  const projectKey = config.jira.projectKey();

  if (!issueKey.startsWith(`${projectKey}-`)) {
    throw new Error(`Issue deve pertencer ao projeto ${projectKey}`);
  }

  const prTitle = `PR #${pr.id}: ${pr.title}`;
  const commentLines = [
    `PR vinculado via Discord por ${discordUser}`,
    `• ${prTitle}`,
    `• Repositório: ${pr.repository}`,
    `• Branch origem: ${pr.sourceBranch}`,
    `• Branch destino: ${pr.destinationBranch}`,
    `• Autor: ${pr.author}`,
    `• Estado: ${pr.state}`,
    `• Link: ${pr.url}`,
  ];

  await addRemoteLink(issueKey, pr.url, prTitle);
  await addComment(issueKey, commentLines.join('\n'));

  let newStatus = issue.fields.status.name;
  const targetTransition = config.jira.transitionOnLink;

  try {
    await transitionIssue(issueKey, targetTransition);
    const updated = await getIssue(issueKey);
    newStatus = updated.fields.status.name;
  } catch (error) {
    return {
      issueKey,
      summary: issue.fields.summary,
      status: newStatus,
      transitionWarning: error.message,
      prTitle,
      prUrl: pr.url,
    };
  }

  return {
    issueKey,
    summary: issue.fields.summary,
    status: newStatus,
    prTitle,
    prUrl: pr.url,
  };
}

module.exports = {
  getIssue,
  addRemoteLink,
  addComment,
  getTransitions,
  transitionIssue,
  linkPullRequest,
};
