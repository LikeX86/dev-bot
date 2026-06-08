require('dotenv').config({ override: true });
const { jiraFetch } = require('../src/atlassian-auth');

const cloudId = process.env.JIRA_CLOUD_ID;
const issueKey = process.argv[2] || 'SCRUM-1';
const base = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`;

async function main() {
  console.log('Email:', process.env.ATLASSIAN_EMAIL);
  console.log('Issue:', issueKey);

  try {
    const projects = await jiraFetch(`${base}/project/search?maxResults=10`);
    console.log('Projetos visíveis:', projects.total, projects.values?.map((p) => p.key).join(', ') || 'nenhum');
  } catch (error) {
    console.log('Projetos:', error.message);
  }

  try {
    const issue = await jiraFetch(`${base}/issue/${issueKey}?fields=summary,status`);
    console.log('OK:', issueKey, '-', issue.fields.summary, '-', issue.fields.status.name);
  } catch (error) {
    console.log('Issue:', error.message);
    process.exit(1);
  }
}

main();
