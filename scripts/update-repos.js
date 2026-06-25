#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * update-repos.js — GitHub Repository Auto-Updater
 * ═══════════════════════════════════════════════════════════════════
 *
 * What this script does:
 *  1. Fetches all repositories via GitHub REST API
 *  2. Filters out forks, archived, and private repos
 *  3. Sorts by last updated (or stars, configurable)
 *  4. Generates a rich Markdown table with stats
 *  5. Replaces the LATEST-REPOS-START/END section in README.md
 *
 * Environment Variables:
 *  - GITHUB_TOKEN     : Personal Access Token (injected by Actions)
 *  - GITHUB_USERNAME  : GitHub username (default: Arslan-web-Dev)
 *  - MAX_REPOS        : Max repos to show (default: 10)
 *  - SORT_BY          : Sort method: updated | stars | created
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// ─── Configuration ───────────────────────────────────────────────────────────

const CONFIG = {
  username: process.env.GITHUB_USERNAME || "Arslan-web-Dev",
  token: process.env.GITHUB_TOKEN,
  maxRepos: parseInt(process.env.MAX_REPOS || "10", 10),
  sortBy: process.env.SORT_BY || "updated", // 'updated' | 'stars' | 'created'
  readmePath: path.join(__dirname, "..", "README.md"),
  markerStart: "<!-- LATEST-REPOS-START -->",
  markerEnd: "<!-- LATEST-REPOS-END -->",
  // Repos to always exclude (add repo names you don't want to show)
  excludeRepos: [],
};

// ─── Language → Badge Color Mapping ─────────────────────────────────────────

const LANG_COLORS = {
  JavaScript: "F7DF1E",
  TypeScript: "3178C6",
  Python: "3776AB",
  "C++": "00599C",
  C: "A8B9CC",
  Java: "ED8B00",
  Go: "00ADD8",
  Rust: "000000",
  PHP: "777BB4",
  Ruby: "CC342D",
  Swift: "FA7343",
  Kotlin: "7F52FF",
  Dart: "0175C2",
  HTML: "E34F26",
  CSS: "1572B6",
  Shell: "4EAA25",
  Vue: "4FC08D",
  Svelte: "FF3E00",
  default: "6e7681",
};

// ─── Language → Emoji Mapping ────────────────────────────────────────────────

const LANG_EMOJI = {
  JavaScript: "🟨",
  TypeScript: "🔷",
  Python: "🐍",
  "C++": "⚙️",
  Java: "☕",
  Go: "🐹",
  Rust: "🦀",
  PHP: "🐘",
  Ruby: "💎",
  Swift: "🐦",
  Dart: "🎯",
  HTML: "🌐",
  CSS: "🎨",
  Shell: "🐚",
  Vue: "💚",
  Svelte: "🧡",
  default: "📦",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Makes an HTTPS GET request and returns parsed JSON
 */
function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "github-profile-updater/1.0",
        Accept: "application/vnd.github.v3+json",
        ...headers,
      },
    };

    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Fetches ALL repositories (handles pagination)
 */
async function fetchAllRepos(username, token) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  const headers = token ? { Authorization: `token ${token}` } : {};

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&type=owner`;
    console.log(`📡 Fetching page ${page}...`);

    const batch = await fetchJSON(url, headers);

    if (!Array.isArray(batch) || batch.length === 0) break;

    repos.push(...batch);

    if (batch.length < perPage) break;
    page++;

    // Rate limit safety: small delay between pages
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`✅ Fetched ${repos.length} total repositories`);
  return repos;
}

/**
 * Filters repos: remove forks, archived, private, excluded
 */
function filterRepos(repos) {
  return repos.filter((repo) => {
    if (repo.fork) return false; // Skip forks
    if (repo.archived) return false; // Skip archived
    if (repo.private) return false; // Skip private
    if (repo.name === CONFIG.username) return false; // Skip profile repo itself
    if (CONFIG.excludeRepos.includes(repo.name)) return false; // Skip excluded
    return true;
  });
}

/**
 * Sorts repos by the configured method
 */
function sortRepos(repos) {
  return repos.sort((a, b) => {
    switch (CONFIG.sortBy) {
      case "stars":
        // Primary: stars DESC, Secondary: updated DESC
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at) - new Date(a.updated_at);

      case "created":
        return new Date(b.created_at) - new Date(a.created_at);

      case "updated":
      default:
        return new Date(b.updated_at) - new Date(a.updated_at);
    }
  });
}

/**
 * Formats a date as a relative time string (e.g. "3 days ago")
 */
function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Gets the language badge color
 */
function getLangColor(lang) {
  return LANG_COLORS[lang] || LANG_COLORS.default;
}

/**
 * Gets the language emoji
 */
function getLangEmoji(lang) {
  return LANG_EMOJI[lang] || LANG_EMOJI.default;
}

/**
 * Generates the Markdown table for the repos section
 */
function generateMarkdown(repos) {
  const timestamp = new Date().toUTCString();

  const lines = [
    `<!-- This section is automatically generated by GitHub Actions. -->`,
    `<!-- Last updated: ${timestamp} -->`,
    `<!-- Do NOT manually edit between the marker comments. -->`,
    ``,
    `> 📊 Showing **${repos.length}** repositories • Sorted by **${CONFIG.sortBy}** • Forks & archived excluded`,
    ``,
    `| &nbsp; | Repository | Description | Language | Stars | Updated |`,
    `|:---:|:---|:---|:---:|:---:|:---:|`,
  ];

  for (const repo of repos) {
    const name = repo.name;
    const url = repo.html_url;
    const desc =
      repo.description
        ? repo.description.replace(/\|/g, "\\|").substring(0, 80) +
          (repo.description.length > 80 ? "…" : "")
        : "*No description*";

    const lang = repo.language || "Other";
    const langEmoji = getLangEmoji(lang);
    const langColor = getLangColor(lang);

    // Star badge
    const stars = repo.stargazers_count;
    const starBadge =
      stars > 0
        ? `![Stars](https://img.shields.io/badge/⭐_${stars}-ffd700?style=flat-square&labelColor=0d1117)`
        : `![Stars](https://img.shields.io/badge/⭐_0-555?style=flat-square&labelColor=0d1117)`;

    // Language badge logo mapping for SimpleIcons compatibility
    const LOGO_MAPPING = {
      "C++": "cplusplus",
      "C#": "csharp",
      "Go": "go",
      "HTML": "html5",
      "CSS": "css3",
      "Shell": "gnubash",
      "Vue": "vuedotjs",
      "Svelte": "svelte",
      "JavaScript": "javascript",
      "TypeScript": "typescript",
      "Python": "python",
      "Java": "openjdk"
    };
    const logoName = LOGO_MAPPING[lang] || lang.toLowerCase();
    const langBadge = `![${lang}](https://img.shields.io/badge/${encodeURIComponent(lang)}-${langColor}?style=flat-square&logo=${encodeURIComponent(logoName)}&logoColor=white)`;

    const updated = timeAgo(repo.updated_at);

    // Topics as mini-badges (first 3 only)
    const topics = (repo.topics || []).slice(0, 3);
    const topicBadges = topics
      .map(
        (t) =>
          `![${t}](https://img.shields.io/badge/${encodeURIComponent(t)}-333?style=flat-square)`
      )
      .join(" ");

    lines.push(
      `| ${langEmoji} | [**${name}**](${url}) ${topicBadges ? "<br/>" + topicBadges : ""} | ${desc} | ${langBadge} | ${starBadge} | \`${updated}\` |`
    );
  }

  lines.push(``);
  lines.push(
    `<div align="right"><sub>🤖 Auto-updated by <a href=".github/workflows/update-repos.yml">GitHub Actions</a> • ${timestamp}</sub></div>`
  );

  return lines.join("\n");
}

/**
 * Updates the README.md between the marker comments
 */
function updateReadme(newContent) {
  if (!fs.existsSync(CONFIG.readmePath)) {
    throw new Error(`README.md not found at: ${CONFIG.readmePath}`);
  }

  const readme = fs.readFileSync(CONFIG.readmePath, "utf-8");

  const startIdx = readme.indexOf(CONFIG.markerStart);
  const endIdx = readme.indexOf(CONFIG.markerEnd);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Could not find markers in README.md.\n` +
        `Expected: "${CONFIG.markerStart}" and "${CONFIG.markerEnd}"\n` +
        `Please ensure your README.md has these exact comment markers.`
    );
  }

  const before = readme.substring(0, startIdx + CONFIG.markerStart.length);
  const after = readme.substring(endIdx);

  const updated = `${before}\n${newContent}\n${after}`;
  fs.writeFileSync(CONFIG.readmePath, updated, "utf-8");

  console.log(`✅ README.md updated successfully`);
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 GitHub Profile Repository Updater`);
  console.log(`${"═".repeat(50)}`);
  console.log(`👤 Username  : ${CONFIG.username}`);
  console.log(`📊 Sort by   : ${CONFIG.sortBy}`);
  console.log(`📦 Max repos : ${CONFIG.maxRepos}`);
  console.log(`🔑 Token     : ${CONFIG.token ? "✅ Present" : "⚠️  Missing (rate limited)"}`);
  console.log(`${"═".repeat(50)}\n`);

  try {
    // 1. Fetch all repos
    const allRepos = await fetchAllRepos(CONFIG.username, CONFIG.token);

    // 2. Filter
    const filtered = filterRepos(allRepos);
    console.log(`🔍 After filtering: ${filtered.length} repos (removed forks/archived)`);

    // 3. Sort
    const sorted = sortRepos(filtered);
    console.log(`📊 Sorted by: ${CONFIG.sortBy}`);

    // 4. Limit
    const limited = sorted.slice(0, CONFIG.maxRepos);
    console.log(`✂️  Showing top: ${limited.length} repos\n`);

    // 5. Log what we're showing
    console.log(`📋 Repositories to display:`);
    limited.forEach((r, i) => {
      const stars = r.stargazers_count;
      const updated = timeAgo(r.updated_at);
      console.log(
        `   ${String(i + 1).padStart(2)}. ${r.name.padEnd(35)} ⭐${String(stars).padEnd(5)} 🕐 ${updated}`
      );
    });

    // 6. Generate markdown
    const markdown = generateMarkdown(limited);

    // 7. Update README
    updateReadme(markdown);

    console.log(`\n✅ Done! README.md has been updated.\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
