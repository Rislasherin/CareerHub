import * as fs from 'fs';
import * as path from 'path';

const searchDirs = [
    path.join(__dirname, '../src')
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
    if (file.includes('logger.ts')) continue;
    
    let content = fs.readFileSync(file, 'utf-8');
    
    if (consoleRegex.test(content)) {
        // Calculate relative path to logger
        const srcDir = path.join(__dirname, '../src');
        const loggerDir = path.join(srcDir, 'infrastructure/logger');
        let relativeLoggerPath = path.relative(path.dirname(file), path.join(loggerDir, 'logger')).replace(/\\/g, '/');
        
        if (!relativeLoggerPath.startsWith('.')) {
            relativeLoggerPath = './' + relativeLoggerPath;
        }

        const importStatement = `import { Logger, LogCategory } from '${relativeLoggerPath}';\n`;
        
        if (!content.includes('import { Logger')) {
            // Find the last import
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLastImport = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
            } else {
                content = importStatement + content;
            }
        }
        
        // Replace console.*
        content = content.replace(/console\.log\(/g, 'Logger.info(LogCategory.SYSTEM_INFO, ');
        content = content.replace(/console\.error\(/g, 'Logger.error(LogCategory.SYSTEM_ERROR, ');
        content = content.replace(/console\.warn\(/g, 'Logger.warn(LogCategory.SYSTEM_INFO, ');
        content = content.replace(/console\.info\(/g, 'Logger.info(LogCategory.SYSTEM_INFO, ');
        content = content.replace(/console\.debug\(/g, 'Logger.debug(LogCategory.SYSTEM_INFO, ');
        
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Updated ${file}`);
    }
}
