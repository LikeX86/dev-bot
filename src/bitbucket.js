const config = require('./config');
const { bitbucketFetch } = require('./atlassian-auth');

function parsePullRequestUrl(url) {
  const pattern =
    /^https?:\/\/bitbucket\.org\/([^/]+)\/([^/]+)\/pull-requests\/(\d+)\/?$/i;
  const match = url.trim().match(pattern);

  if (!match) {
    throw new Error(
      'URL inválida. Use: https://bitbucket.org/{workspace}/{repo}/pull-requests/{id}'
    );
  }

  const workspace = match[1];
  const repo = match[2].replace(/\.git$/, '');
  const id = match[3];
  const expectedWorkspace = config.bitbucket.workspace();

  if (workspace.toLowerCase() !== expectedWorkspace.toLowerCase()) {
    throw new Error(
      `Workspace "${workspace}" não corresponde ao configurado (${expectedWorkspace})`
    );
  }

  return { workspace, repo, id, url: url.trim() };
}

async function getPullRequest(prUrl) {
  const { workspace, repo, id, url } = parsePullRequestUrl(prUrl);
  const apiUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/pullrequests/${id}`;
  const data = await bitbucketFetch(apiUrl);

  return {
    id: data.id,
    title: data.title,
    state: data.state,
    url,
    repository: `${workspace}/${repo}`,
    sourceBranch: data.source?.branch?.name || '—',
    destinationBranch: data.destination?.branch?.name || '—',
    author: data.author?.display_name || data.author?.nickname || '—',
  };
}

module.exports = {
  parsePullRequestUrl,
  getPullRequest,
};
