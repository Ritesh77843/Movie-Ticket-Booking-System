const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('localStorage')) {
                content = content.replace(/localStorage/g, 'sessionStorage');
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

replaceInDir(path.join(__dirname, 'src'));
console.log("Replaced localStorage with sessionStorage across frontend.");
