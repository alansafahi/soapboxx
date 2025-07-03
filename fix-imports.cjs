#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Function to calculate relative path
function getRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile);
  const clientSrc = path.join(__dirname, 'client', 'src');
  
  // Convert @/ paths to actual paths
  let targetPath;
  if (toPath.startsWith('@/')) {
    targetPath = path.join(clientSrc, toPath.substring(2));
  } else if (toPath.startsWith('@assets/')) {
    targetPath = path.join(clientSrc, 'assets', toPath.substring(8));
  } else if (toPath.startsWith('@shared/')) {
    targetPath = path.join(process.cwd(), 'shared', toPath.substring(8));
  } else if (toPath === '@shared' || toPath.startsWith('@shared')) {
    targetPath = path.join(process.cwd(), 'shared');
  } else {
    return toPath; // Not an absolute import we need to fix
  }
  
  let relativePath = path.relative(fromDir, targetPath);
  
  // Ensure relative path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // Convert Windows paths to Unix-style
  relativePath = relativePath.replace(/\\/g, '/');
  
  return relativePath;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern to match import statements with @/ paths and @shared paths
  const importPattern = /import\s+(?:(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?["'](@\/[^"']+|@assets\/[^"']+|@shared\/[^"']+|@shared[^"']*)["'])/g;
  
  content = content.replace(importPattern, (match, importPath) => {
    const newPath = getRelativePath(filePath, importPath);
    if (newPath !== importPath) {
      modified = true;
      return match.replace(importPath, newPath);
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const clientSrcDir = path.join(__dirname, 'client', 'src');

if (!fs.existsSync(clientSrcDir)) {
  console.error('client/src directory not found!');
  process.exit(1);
}

console.log('Finding TypeScript/JavaScript files...');
const files = findFiles(clientSrcDir);
console.log(`Found ${files.length} files to process`);

let fixedCount = 0;
for (const file of files) {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
}

console.log(`\nFixed imports in ${fixedCount} files`);