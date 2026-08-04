export const categorizeSkills = (skills: string[]): Record<string, string[]> => {
    const categories: Record<string, string[]> = {
        Languages: [],
        Frameworks: [],
        Libraries: [],
        Databases: [],
        Cloud: [],
        DevOps: [],
        Tools: [],
        Other: []
    };

    const keywords = {
        Languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'sql', 'html', 'css'],
        Frameworks: ['react', 'angular', 'vue', 'next', 'nuxt', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'flutter', 'react native'],
        Libraries: ['redux', 'jquery', 'pandas', 'numpy', 'scipy', 'tensorflow', 'keras', 'pytorch', 'tailwind', 'bootstrap', 'material', 'chakra', 'rxjs'],
        Databases: ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'cassandra', 'dynamodb', 'firebase', 'supabase'],
        Cloud: ['aws', 'amazon', 'gcp', 'google cloud', 'azure', 'heroku', 'digitalocean', 'vercel', 'netlify'],
        DevOps: ['docker', 'kubernetes', 'jenkins', 'github actions', 'gitlab ci', 'travis', 'circleci', 'terraform', 'ansible', 'linux', 'bash'],
        Tools: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'trello', 'confluence', 'slack', 'figma', 'postman', 'swagger', 'vscode', 'intellij', 'webpack', 'vite']
    };

    skills.forEach(skill => {
        const lower = skill.toLowerCase();
        let placed = false;
        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(w => lower.includes(w))) {
                categories[cat].push(skill);
                placed = true;
                break;
            }
        }
        if (!placed) categories.Other.push(skill);
    });

    return categories;
};

export const formatLink = (url: string) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

export const ensureHttps = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : 'https://' + url;
};
