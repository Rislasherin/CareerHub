export const KNOWN_TECHNOLOGY_TERMS = [
  'Node.js', 'Node', 'Express', 'NestJS', 'Fastify', 'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'Redux', 'Zustand', 'MobX', 'TypeScript', 'JavaScript', 'Python', 'Django', 'Flask', 'FastAPI',
  'Go', 'Golang', 'Java', 'Spring Boot', 'Rust', 'C++', 'C#', '.NET',
  'PostgreSQL', 'Postgres', 'MongoDB', 'MySQL', 'SQLite', 'Redis', 'Cassandra', 'DynamoDB', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Kafka', 'RabbitMQ', 'GraphQL', 'REST', 'gRPC',
  'WebSockets', 'JWT', 'OAuth', 'Prisma', 'TypeORM', 'Mongoose', 'Sequelize', 'Tailwind', 'Sass',
  'Git', 'CI/CD', 'Microservices', 'Serverless', 'Terraform', 'Nginx'
];

export function extractMentionedTechnologies(textOrAnswers: string | string[]): string[] {
  const texts = Array.isArray(textOrAnswers) ? textOrAnswers.join(' ') : (textOrAnswers || '');
  if (!texts.trim()) return [];

  const found = new Set<string>();
  for (const tech of KNOWN_TECHNOLOGY_TERMS) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(texts)) {
      found.add(tech);
    }
  }
  return Array.from(found);
}
