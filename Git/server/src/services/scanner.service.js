const fs = require("fs");
const path = require("path");

const IGNORE_FOLDERS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
];

function scanDirectory(directoryPath, rootPath = directoryPath) {
  const results = [];

  const items = fs.readdirSync(directoryPath, {
    withFileTypes: true,
  });

  for (const item of items) {
    if (IGNORE_FOLDERS.includes(item.name)) {
      continue;
    }

    const fullPath = path.join(directoryPath, item.name);

    const relativePath = path.relative(rootPath, fullPath);

    if (item.isDirectory()) {
      results.push({
        name: item.name,
        path: relativePath,
        type: "folder",
      });

      const children = scanDirectory(fullPath, rootPath);

      results.push(...children);
    } else {
      results.push({
        name: item.name,
        path: relativePath,
        type: "file",
        extension: path.extname(item.name),
      });
    }
  }

  return results;
}

module.exports = {
  scanDirectory,
};