const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const REPOSITORIES_DIR = path.join(__dirname, "../../repositories");

// Make sure repositories folder exists
if (!fs.existsSync(REPOSITORIES_DIR)) {
  fs.mkdirSync(REPOSITORIES_DIR, { recursive: true });
}


// Validate GitHub URL
function validateGithubUrl(repoUrl) {
  try {
    const url = new URL(repoUrl);

    if (url.protocol !== "https:") {
      return false;
    }

    if (url.hostname !== "github.com") {
      return false;
    }

    const parts = url.pathname
      .replace(/\.git$/, "")
      .split("/")
      .filter(Boolean);

    return parts.length === 2;
  } catch (error) {
    return false;
  }
}


// Get owner and repository name
function getRepositoryInfo(repoUrl) {
  const url = new URL(repoUrl);

  const parts = url.pathname
    .replace(/\.git$/, "")
    .split("/")
    .filter(Boolean);

  return {
    owner: parts[0],
    name: parts[1],
  };
}


// Clone + Analyze Repository
async function cloneRepository(repoUrl) {
  if (!validateGithubUrl(repoUrl)) {
    throw new Error("Invalid GitHub repository URL");
  }

  const { owner, name } = getRepositoryInfo(repoUrl);

  // Unique folder
  const folderName = `${name}-${Date.now()}`;

  const repositoryPath = path.join(
    REPOSITORIES_DIR,
    folderName
  );

  console.log(`Cloning repository: ${repoUrl}`);

  const git = simpleGit();

  // Clone repository
  await git.clone(repoUrl, repositoryPath);

  console.log("Repository cloned successfully");

  // Git instance for cloned repository
  const repoGit = simpleGit(repositoryPath);


  // -------------------------
  // BRANCH INFORMATION
  // -------------------------

  const branchSummary = await repoGit.branch([
    "-a"
  ]);

  const branches = branchSummary.all;

  const currentBranch = branchSummary.current;


  // -------------------------
  // COMMIT HISTORY
  // -------------------------

  const log = await repoGit.log({
    maxCount: 10,
  });

  const commits = log.all.map((commit) => ({
    hash: commit.hash,
    message: commit.message,
    author: commit.author_name,
    email: commit.author_email,
    date: commit.date,
  }));


  // -------------------------
  // REPOSITORY METADATA
  // -------------------------

  const stats = fs.statSync(repositoryPath);

  const metadata = {
    owner,
    name,
    url: repoUrl,
    localPath: repositoryPath,
    currentBranch,
    totalBranches: branches.length,
    totalCommitsFetched: commits.length,
    clonedAt: stats.birthtime,
  };


  // Final analysis
  return {
    metadata,
    branches,
    commits,
  };
}


module.exports = {
  validateGithubUrl,
  cloneRepository,
};