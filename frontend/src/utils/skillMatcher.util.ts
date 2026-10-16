/**
 * Skill Normalization and Matching Utility (Frontend)
 * 
 * Provides consistent, canonical normalization and comparison of skills matching
 * the backend implementation.
 */

export interface SkillMatchResult {
  matchedCount: number;
  totalRequired: number;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  isAllMatched: boolean;
}

const SKILL_ALIASES: Record<string, string> = {
  // JavaScript
  'javascript': 'javascript',
  'java script': 'javascript',
  'js': 'javascript',

  // TypeScript
  'typescript': 'typescript',
  'type script': 'typescript',
  'ts': 'typescript',

  // React
  'react': 'react',
  'reactjs': 'react',
  'react js': 'react',
  'react.js': 'react',

  // React Native
  'react native': 'react native',
  'reactnative': 'react native',

  // Node.js
  'node': 'nodejs',
  'nodejs': 'nodejs',
  'node js': 'nodejs',
  'node.js': 'nodejs',

  // Next.js
  'next': 'nextjs',
  'nextjs': 'nextjs',
  'next js': 'nextjs',
  'next.js': 'nextjs',

  // Express
  'express': 'express',
  'expressjs': 'express',
  'express js': 'express',
  'express.js': 'express',

  // Vue
  'vue': 'vue',
  'vuejs': 'vue',
  'vue js': 'vue',
  'vue.js': 'vue',

  // Angular
  'angular': 'angular',
  'angularjs': 'angular',
  'angular js': 'angular',
  'angular.js': 'angular',

  // MongoDB
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'mongo db': 'mongodb',

  // PostgreSQL
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'postgre sql': 'postgresql',
  'postgre': 'postgresql',
  'pgsql': 'postgresql',

  // MySQL
  'mysql': 'mysql',
  'my sql': 'mysql',

  // SQL
  'sql': 'sql',

  // C / C++ / C#
  'c': 'c',
  'c++': 'c++',
  'cpp': 'c++',
  'c#': 'c#',
  'csharp': 'c#',
  'c sharp': 'c#',

  // Python
  'python': 'python',
  'py': 'python',

  // Golang
  'go': 'golang',
  'golang': 'golang',

  // Docker
  'docker': 'docker',

  // Kubernetes
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',

  // Cloud providers
  'aws': 'aws',
  'amazon web services': 'aws',
  'gcp': 'gcp',
  'google cloud platform': 'gcp',
  'google cloud': 'gcp',
  'azure': 'azure',
  'microsoft azure': 'azure',

  // Tailwind
  'tailwind': 'tailwind',
  'tailwindcss': 'tailwind',
  'tailwind css': 'tailwind',

  // LangChain / LangGraph
  'langchain': 'langchain',
  'lang chain': 'langchain',
  'langgraph': 'langgraph',
  'lang graph': 'langgraph',

  // PyTorch
  'pytorch': 'pytorch',
  'py torch': 'pytorch',

  // HTML / CSS
  'html': 'html',
  'html5': 'html',
  'html 5': 'html',
  'css': 'css',
  'css3': 'css',
  'css 3': 'css',
};

const STRICT_ISOLATED_TOKENS = new Set(['c', 'java', 'go', 'r', 'sql']);

export class SkillMatcher {
  public static extractSkillName(skill: unknown): string {
    if (skill === null || skill === undefined) {
      return '';
    }
    if (typeof skill === 'string') {
      return skill.trim();
    }
    if (typeof skill === 'object') {
      const obj = skill as Record<string, unknown>;
      const candidate = obj.name ?? obj.skill ?? obj.canonicalName ?? obj.title ?? obj.value ?? obj.label ?? obj.skillName;
      if (typeof candidate === 'string') {
        return candidate.trim();
      }
      if (candidate !== null && candidate !== undefined) {
        return String(candidate).trim();
      }
    }
    return '';
  }

  public static toCanonicalKey(input: unknown): string {
    const raw = this.extractSkillName(input);
    if (!raw) return '';

    let cleaned = raw
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, '');

    cleaned = cleaned
      .replace(/[^\w\s+#]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return '';

    if (SKILL_ALIASES[cleaned]) {
      return SKILL_ALIASES[cleaned];
    }

    const compacted = cleaned.replace(/\s+/g, '');
    if (SKILL_ALIASES[compacted]) {
      return SKILL_ALIASES[compacted];
    }

    if (STRICT_ISOLATED_TOKENS.has(cleaned)) {
      return cleaned;
    }

    return compacted;
  }

  public static isSkillMatch(skillA: unknown, skillB: unknown): boolean {
    const keyA = this.toCanonicalKey(skillA);
    const keyB = this.toCanonicalKey(skillB);
    if (!keyA || !keyB) return false;
    return keyA === keyB;
  }

  public static extractStudentSkillNames(skillsContainer: unknown): string[] {
    if (!skillsContainer) return [];

    const result: string[] = [];

    const processItem = (item: unknown) => {
      if (!item) return;
      if (Array.isArray(item)) {
        item.forEach(processItem);
      } else if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) result.push(trimmed);
      } else if (typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const extracted = this.extractSkillName(obj);
        if (extracted) {
          result.push(extracted);
        } else {
          Object.values(obj).forEach(val => {
            if (Array.isArray(val)) {
              val.forEach(processItem);
            }
          });
        }
      }
    };

    processItem(skillsContainer);
    return result;
  }

  public static extractStudentSkillKeys(skillsContainer: unknown): Set<string> {
    const names = this.extractStudentSkillNames(skillsContainer);
    const set = new Set<string>();
    for (const name of names) {
      const key = this.toCanonicalKey(name);
      if (key) {
        set.add(key);
      }
    }
    return set;
  }

  public static matchSkills(studentSkills: unknown, requiredSkills: unknown[]): SkillMatchResult {
    const studentKeys = this.extractStudentSkillKeys(studentSkills);
    const reqArray = Array.isArray(requiredSkills) ? requiredSkills : [];

    const effectiveRequired = reqArray.filter(req => {
      const rawName = this.extractSkillName(req);
      return rawName.toLowerCase() !== 'all skills welcome';
    });

    const totalRequired = effectiveRequired.length;
    if (totalRequired === 0) {
      return {
        matchedCount: 0,
        totalRequired: 0,
        matchPercentage: 100,
        matchedSkills: [],
        missingSkills: [],
        isAllMatched: true,
      };
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const req of effectiveRequired) {
      const reqName = this.extractSkillName(req);
      const reqKey = this.toCanonicalKey(reqName);
      if (reqKey && studentKeys.has(reqKey)) {
        matchedSkills.push(reqName);
      } else {
        missingSkills.push(reqName);
      }
    }

    const matchedCount = matchedSkills.length;
    const matchPercentage = Math.round((matchedCount / totalRequired) * 100);
    const isAllMatched = matchedCount === totalRequired;

    return {
      matchedCount,
      totalRequired,
      matchPercentage,
      matchedSkills,
      missingSkills,
      isAllMatched,
    };
  }
}
