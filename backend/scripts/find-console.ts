import * as fs from 'fs';
import * as path from 'path';

const searchDirs = [
    path.join(__dirname, '../src'),
    path.join(__dirname, '../tests')
];

function walk(dir: string, filelist: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walk(filepath, filelist);
        } else if (filepath.endsWith('.ts')) {
            filelist.push(filepath);
        }
    }
    return filelist;
}

const allFiles = searchDirs.flatMap(dir => walk(dir));

const consoleRegex = /console\.(log|error|warn|info|debug)\(/g;

for (const file of allFiles) {
    if (file.includes('logger.ts')) continue; // Skip the logger implementation itself
    if (file.includes('replace-console.ts')) continue;
    
    let content = fs.readFileSync(file, 'utf-8');
    
    if (consoleRegex.test(content)) {
        // We will need to manually review these or use a smart replacement, 
        // since we need to import Logger and LogCategory.
        console.log(`Found console.* in: ${file}`);
    }
}
