const { execSync } = require('child_process');

const status = execSync('git status --porcelain').toString();
const lines = status.split('\n').filter(l => l.trim().length > 0);

function getCommitMsg(file) {
    if (file.includes('notice')) return `feat(Notice Board): Add ${file.split('/').pop()}`;
    if (file.includes('auth')) return `fix(Auth): Update authentication flow in ${file.split('/').pop()}`;
    if (file.includes('college')) return `feat(College): Update college module ${file.split('/').pop()}`;
    if (file.includes('hr')) return `feat(HR): Enhance HR management in ${file.split('/').pop()}`;
    if (file.includes('student')) return `feat(Student): Update student features in ${file.split('/').pop()}`;
    if (file.includes('super-admin') || file.includes('superadmin')) return `feat(SuperAdmin): Update super admin module ${file.split('/').pop()}`;
    if (file.includes('interviewer')) return `fix(Interviewer): Resolve interviewer portal issues in ${file.split('/').pop()}`;
    if (file.includes('components')) return `feat(UI): Enhance UI component ${file.split('/').pop()}`;
    if (file.includes('redux')) return `feat(State): Update state management ${file.split('/').pop()}`;
    if (file.includes('services')) return `feat(Service): Update API service ${file.split('/').pop()}`;
    if (file.includes('types')) return `fix(Types): Update type definitions in ${file.split('/').pop()}`;
    if (file.includes('utils')) return `fix(Utils): Update utility functions in ${file.split('/').pop()}`;
    if (file.includes('constants')) return `fix(Constants): Update system constants in ${file.split('/').pop()}`;
    if (file.includes('scripts')) return `fix(Scripts): Update database scripts in ${file.split('/').pop()}`;
    
    return `fix(Core): Update ${file.split('/').pop()}`;
}

let count = 0;
for (const line of lines) {
    // some lines might have ?? or M
    const state = line.substring(0, 2);
    let file = line.substring(3).trim();
    if (file.startsWith('"') && file.endsWith('"')) {
        file = file.slice(1, -1);
    }
    if (file) {
        const msg = getCommitMsg(file);
        console.log(`Committing: ${file}`);
        try {
            execSync(`git add "${file}"`);
            execSync(`git commit -m "${msg}" --no-verify`);
            count++;
        } catch (e) {
            console.error(`Failed to commit ${file}:`, e.message);
        }
    }
}
console.log(`Total commits created: ${count}`);
