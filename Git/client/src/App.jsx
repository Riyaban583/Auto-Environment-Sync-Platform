import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [githubUser, setGithubUser] = useState(null);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const connected = params.get("githubConnected");
  const user = params.get("user");

  if (connected === "true" && user) {
    try {
      const parsedUser = JSON.parse(user);

      setGithubUser(parsedUser);

      // Save so refresh ke baad bhi user dikhe
      localStorage.setItem(
        "devsyncGithubUser",
        JSON.stringify(parsedUser)
      );

      // URL clean kar do
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    } catch (error) {
      console.error("Failed to read GitHub user:", error);
    }
  } else {
    // Refresh hone par saved user load karo
    const savedUser = localStorage.getItem(
      "devsyncGithubUser"
    );

    if (savedUser) {
      try {
        setGithubUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("devsyncGithubUser");
      }
    }
  }
}, []);

  const handleGitHubConnect = () => {
  window.location.href = "http://localhost:5001/api/github/login";
};

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/git/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Repository analysis failed"
        );
      }

      setAnalysis(data.repository);
    } catch (error) {
      console.error("Repository analysis error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <div className="logoIcon">D</div>

          <div>
            <h2>DevSync</h2>
            <span>Repository Intelligence</span>
          </div>
        </div>

        <div className="status">
          <span className="statusDot"></span>
          Git Service
        </div>
      </nav>

      <main className="main">
        <section className="hero">
          <p className="tag">
            GITHUB REPOSITORY ANALYZER
          </p>

          <h1>
            Understand your repository
            <span> in seconds.</span>
          </h1>

          <p className="description">
            Connect a GitHub repository and let DevSync
            analyze its structure, branches, commits,
            dependencies and development environment.
          </p>
        </section>

        <section className="connectCard">
          <div className="cardHeader">
            <div>
              <h3>Connect Repository</h3>

              <p>
                Enter the URL of a public GitHub repository.
              </p>
            </div>

         {githubUser ? (
  <div className="githubUser">
    <img
      src={githubUser.avatar}
      alt={githubUser.username}
    />

    <div>
      <strong>@{githubUser.username}</strong>
      <span>GitHub Connected</span>
    </div>
  </div>
) : (
  <button
    className="githubConnectBtn"
    onClick={handleGitHubConnect}
  >
    Connect GitHub
  </button>
)}
          </div>

          <div className="inputGroup">
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Repository"}
            </button>
          </div>

          <p className="hint">
            Example: https://github.com/facebook/react
          </p>

          {error && (
            <p className="errorMessage">
              {error}
            </p>
          )}
        </section>

        <section className="features">
          <div className="featureCard">
            <div className="featureIcon">01</div>

            <h3>Repository</h3>

            <p>
              Clone and inspect the repository automatically.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">02</div>

            <h3>Branches</h3>

            <p>
              Discover repository branches and current branch.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">03</div>

            <h3>Commits</h3>

            <p>
              Analyze recent Git commit history.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">04</div>

            <h3>Environment</h3>

            <p>
              Detect technologies and environment requirements.
            </p>
          </div>
        </section>

        {analysis && (
          <section className="analysisSection">
            <div className="analysisTitle">
              <div>
                <p className="tag">
                  ANALYSIS COMPLETE
                </p>

                <h2>Repository Analysis</h2>
              </div>

              <span className="successBadge">
                Connected
              </span>
            </div>

            <div className="metadataGrid">
              <div className="analysisCard">
                <span>Repository</span>

                <h3>
                  {analysis.metadata.name}
                </h3>

                <p>
                  {analysis.metadata.owner}
                </p>
              </div>

              <div className="analysisCard">
                <span>Current Branch</span>

                <h3>
                  {analysis.metadata.currentBranch || "N/A"}
                </h3>
              </div>

              <div className="analysisCard">
                <span>Branches</span>

                <h3>
                  {analysis.metadata.totalBranches}
                </h3>
              </div>

              <div className="analysisCard">
                <span>Commits Loaded</span>

                <h3>
                  {analysis.metadata.totalCommitsFetched}
                </h3>
              </div>
            </div>

            <div className="detailsGrid">
              <div className="detailsCard">
                <h3>Branches</h3>

                <div className="branchList">
                  {analysis.branches.map(
                    (branch, index) => (
                      <div
                        className="branchItem"
                        key={index}
                      >
                        <span className="branchDot"></span>
                        {branch}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="detailsCard">
                <h3>Recent Commits</h3>

                <div className="commitList">
                  {analysis.commits.map((commit) => (
                    <div
                      className="commitItem"
                      key={commit.hash}
                    >
                      <div className="commitTop">
                        <strong>
                          {commit.message}
                        </strong>

                        <code>
                          {commit.hash.substring(0, 7)}
                        </code>
                      </div>

                      <p>
                        {commit.author} •{" "}
                        {new Date(
                          commit.date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;