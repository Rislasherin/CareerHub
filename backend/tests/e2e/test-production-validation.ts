import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

const tests = [
    'test-acknowledgements.ts',
    'test-adaptive-difficulty-depth.ts',
    'test-ai-interview-security-isolation.ts',
    'test-closing-flow.ts',
    'test-concurrency-data-consistency.ts',
    'test-context-memory-anti-repetition.ts',
    'test-error-recovery-resilience.ts',
    'test-evaluation-final-results.ts',
    'test-interruption-pause-repeat.ts',
    'test-interview-config-jd-rules.ts',
    'test-interview-configuration-multitype.ts',
    'test-interview-lifecycle-recovery.ts',
    'test-intro-flow.ts',
    'test-jd-interview-orchestration.ts',
    'test-multitype-question-generation-enforcement.ts',
    'test-production-failure-recovery.ts',
    'test-question-quality.ts',
    'test-realtime-state-frontend-sync.ts',
    'test-smart-answer-understanding.ts',
    'test-student-response-handling.ts'
];

interface TestResult {
    name: string;
    passed: boolean;
    durationMs: number;
    errorDetails?: string;
    output?: string;
}

async function runTests() {
    Logger.info(LogCategory.SYSTEM_INFO, `Starting Full Regression Validation on ${tests.length} test suites...\n`);
    
    const results: TestResult[] = [];
    const startTimeOverall = Date.now();
    
    for (const testFile of tests) {
        Logger.info(LogCategory.SYSTEM_INFO, `\n====================================================================`);
        Logger.info(LogCategory.SYSTEM_INFO, `Executing: ${testFile}`);
        Logger.info(LogCategory.SYSTEM_INFO, `====================================================================\n`);
        
        const testPath = path.join(__dirname, testFile);
        const startTime = Date.now();
        let passed = false;
        let errorDetails = '';
        let output = '';

        try {
            output = execSync(`npx tsx ${testPath}`, { encoding: 'utf-8', stdio: 'pipe' });
            passed = true;
            Logger.info(LogCategory.SYSTEM_INFO, `✅ [PASS] ${testFile}`);
        } catch (error: any) {
            passed = false;
            errorDetails = error.message;
            output = error.stdout?.toString() || '' + '\n' + (error.stderr?.toString() || '');
            Logger.error(LogCategory.SYSTEM_ERROR, `❌ [FAIL] ${testFile}`);
            Logger.error(LogCategory.SYSTEM_ERROR, errorDetails);
            Logger.error(LogCategory.SYSTEM_ERROR, output);
        }

        const durationMs = Date.now() - startTime;
        
        results.push({
            name: testFile,
            passed,
            durationMs,
            errorDetails,
            output
        });
    }

    const durationOverall = Date.now() - startTimeOverall;
    
    Logger.info(LogCategory.SYSTEM_INFO, `\n====================================================================`);
    Logger.info(LogCategory.SYSTEM_INFO, `Regression Validation Complete!`);
    Logger.info(LogCategory.SYSTEM_INFO, `Total Time: ${(durationOverall / 1000).toFixed(2)}s`);
    Logger.info(LogCategory.SYSTEM_INFO, `====================================================================\n`);

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.length - passedCount;

    Logger.info(LogCategory.SYSTEM_INFO, `Passed: ${passedCount}/${results.length}`);
    Logger.info(LogCategory.SYSTEM_INFO, `Failed: ${failedCount}/${results.length}`);
    
    // Generate a Markdown Report
    let report = `# Feature 21: Full Regression Validation Report\n\n`;
    report += `**Total Tests:** ${results.length}\n`;
    report += `**Passed:** ${passedCount}\n`;
    report += `**Failed:** ${failedCount}\n`;
    report += `**Total Execution Time:** ${(durationOverall / 1000).toFixed(2)}s\n\n`;
    
    report += `## Detailed Results\n\n`;
    report += `| Test Suite | Status | Execution Time | Notes |\n`;
    report += `|---|---|---|---|\n`;
    
    for (const res of results) {
        const statusIcon = res.passed ? '✅ PASS' : '❌ FAIL';
        const notes = res.passed ? '-' : 'See error log below';
        report += `| \`${res.name}\` | ${statusIcon} | ${res.durationMs}ms | ${notes} |\n`;
    }
    
    if (failedCount > 0) {
        report += `\n## Failure Details\n\n`;
        for (const res of results.filter(r => !r.passed)) {
            report += `### \`${res.name}\`\n`;
            report += `**Error Details:**\n\`\`\`\n${res.errorDetails}\n\`\`\`\n`;
            report += `**Output:**\n\`\`\`\n${res.output}\n\`\`\`\n\n`;
        }
    }
    
    const reportPath = path.join(process.cwd(), 'regression_report.md');
    fs.writeFileSync(reportPath, report);
    Logger.info(LogCategory.SYSTEM_INFO, `\nReport written to ${reportPath}`);
    
    if (failedCount > 0) {
        process.exit(1);
    }
}

runTests().catch(err => Logger.error(LogCategory.SYSTEM_ERROR, "Error", err));
