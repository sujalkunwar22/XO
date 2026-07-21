const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

// Clean target dist directory
const dest = path.join(__dirname, 'dist');
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

// Copy from frontend/dist to dist
copyFolderSync(path.join(__dirname, 'frontend', 'dist'), dest);
console.log('Successfully copied frontend/dist to root dist/ directory.');
