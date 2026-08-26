import * as fs from 'fs';
import * as path from 'path';

const backendRoot = path.join(__dirname, '..');
const srcDir = path.join(backendRoot, 'src');
const testsDir = path.join(backendRoot, 'tests');

const testCategories: Record<string, string[]> = {
    'unit': [
        'test-question-quality.ts',
        'test-adaptive-difficulty-depth.ts',
        'test-context-memory-anti-repetition.ts',
        'test-smart-answer-understanding.ts',
        'test-student-response-handling.ts',
        'test-interview-config-jd-rules.ts',
        'test-interview-configuration-multitype.ts',
        'test-multitype-question-generation-enforcement.ts'
    ],
    'integration': [
        'test-jd-interview-orchestration.ts',
        'test-evaluation-final-results.ts',
        'test-realtime-state-frontend-sync.ts',
        'test-intro-flow.ts',
        'test-closing-flow.ts',
        'test-acknowledgements.ts'
    ],
    'concurrency': [
        'test-concurrency-data-consistency.ts',
        'test-mongodb-concurrency-stress.ts',
        'test-distributed-coordination.ts',
        'test-distributed-stress.ts'
    ],
    'security': [
        'test-ai-interview-security-isolation.ts'
    ],
    'resilience': [
        'test-provider-resilience-failover.ts',
        'test-error-recovery-resilience.ts',
        'test-production-failure-recovery.ts',
        'test-interruption-pause-repeat.ts',
        'test-interview-lifecycle-recovery.ts',
        'test-provider-rate-limiting.ts'
    ],
    'e2e': [
        'test-production-validation.ts',
        'test-multi-interview-load.ts'
    ],
    'architecture': []
};

// Create dirs
fs.mkdirSync(testsDir, { recursive: true });
for (const category of Object.keys(testCategories)) {
    fs.mkdirSync(path.join(testsDir, category), { recursive: true });
}

// Move files and update imports
for (const [category, files] of Object.entries(testCategories)) {
    for (const file of files) {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(testsDir, category, file);
        
        if (fs.existsSync(srcPath)) {
            let content = fs.readFileSync(srcPath, 'utf-8');
            
            // Replace relative imports: from "./something" to "../../src/something"
            // or from "../something" to "../../src/../something"
            // specifically for the top level files in src/
            
            content = content.replace(/from\s+["'](\.\/|\.\.\/)(.*?)["']/g, (match, prefix, rest) => {
                if (prefix === './') {
                    return `from "../../src/${rest}"`;
                } else if (prefix === '../') {
                     return `from "../../${rest}"`;
                }
                return match;
            });
            
            // For @domain, @application, etc. aliases, they rely on tsconfig paths. 
            // We should ensure tsconfig paths are resolved from the new location or just let tsconfig handle it (since they are absolute to baseUrl).
            
            fs.writeFileSync(destPath, content, 'utf-8');
            fs.unlinkSync(srcPath);
            console.log(`Moved ${file} to tests/${category}/`);
        } else {
            console.warn(`Warning: ${file} not found in src/`);
        }
    }
}
