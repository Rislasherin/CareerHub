import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  IInterviewEvaluationLLMService,
  IEvaluationLLMInput,
  IEvaluationLLMOutput,
} from '@application/interfaces/ai-interview/IInterviewEvaluationLLMService';
import { LLMProviderFactory } from './LLMProvider.factory';
import { ProviderRateLimiter } from './ProviderRateLimiter';
import { OllamaPriorityQueue } from './OllamaPriorityQueue';
import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { Logger, LogCategory } from '../../logger/logger';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const fullEvaluationZodSchema = z.object({
  overallScore: z.number().min(0).max(100).nullable(),
  overallSummary: z.string(),
  competencies: z.array(z.object({
    name: z.string(),
    category: z.string(),
    score: z.number().min(0).max(100).nullable(),
    status: z.enum(['EVALUATED', 'INSUFFICIENT_EVIDENCE']),
    explanation: z.string(),
    evidence: z.array(z.string()),
  })),
  strengths: z.array(z.string()),
  developmentAreas: z.array(z.string()),
  insufficientEvidenceAreas: z.array(z.string()),
  recommendation: z.nativeEnum(AIRecommendation),
  recommendationReasoning: z.string(),
  confidence: z.nativeEnum(EvaluationConfidence),
  confidenceScore: z.number().min(0).max(100),
  confidenceReasoning: z.string(),
  aiSuggestedActions: z.array(z.string()),
});

const FULL_EVALUATION_PROMPT = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert, objective, evidence-based AI Technical Interview Evaluator and Talent Assessment Specialist.
Your task is to produce a rigorous, structured, and fair post-interview evaluation of a candidate based STRICTLY on the interview transcript, questions, candidate answers, and job requirements.

==================================================
EVALUATION RULES & PRINCIPLES
==================================================
1. STRICT EVIDENCE-BASED ASSESSMENT:
   - Base every score, strength, and development area solely on verifiable content from candidate responses.
   - For every evaluated competency, provide concrete evidence points (quotes or specific concepts explained/missed by candidate).
   - NEVER make unsupported personal or personality judgments (e.g. "candidate seems lazy", "candidate lacks passion").
   - NEVER evaluate or infer protected personal characteristics (accent, speaking speed, ethnicity, gender, tone, confidence level). Focus purely on technical substance, reasoning, and problem-solving content.

2. INSUFFICIENT EVIDENCE HANDLING:
   - If a required or preferred competency was NOT adequately explored during the interview (e.g. fewer than 1 substantive question), DO NOT fabricate or guess a score.
   - Set "status" to "INSUFFICIENT_EVIDENCE", "score" to null, and provide a clear explanation stating that the interview lacked sufficient questions to reliably assess this skill.
   - Add the competency name to "insufficientEvidenceAreas".

3. SCORING GUIDELINES (0-100):
   - 90-100: Exceptional depth, clear mastery, edge cases addressed, best practices articulated.
   - 75-89: Solid competency, correct fundamental and practical understanding, minor gaps in advanced nuances.
   - 60-74: Basic or partial understanding, noticeable gaps or hesitation on core principles.
   - Below 60: Significant misconceptions, incorrect explanations, or inability to answer core aspects.
   - Overall Score: Weighted reflection of evaluated competencies (or null if all competencies had insufficient evidence).

4. ADVISORY AI RECOMMENDATION:
   - STRONG_PROCEED: High overall score (>=85), strong evidence across all core competencies.
   - PROCEED: Solid overall score (>=70), core competencies satisfied with minor development areas.
   - CONSIDER: Mixed performance (>=55), candidate demonstrated basic knowledge but requires further review or skill verification.
   - DO_NOT_PROCEED: Score <55 or critical gaps in mandatory core competencies.

5. EVALUATION CONFIDENCE:
   - HIGH: High question coverage (>=5 questions), candidate provided comprehensive answers across all core competencies.
   - MEDIUM: Moderate coverage (3-4 questions) or 1-2 competencies marked as insufficient evidence.
   - LOW: Low question count (<3 questions), brief/unresponsive candidate answers, or multiple competencies unassessed.

6. ACTIONABLE AI SUGGESTIONS:
   - Provide concrete next-step recommendations for HR (e.g. "Candidate demonstrated strong Node.js knowledge but struggled with MongoDB aggregation pipelines. Recommend a practical coding exercise on indexing if proceeding.").

Return a valid JSON object matching the requested schema strictly.`
  ],
  [
    'user',
    `JOB DETAILS:
Role: {jobTitle}
Experience Level: {experienceLevel}
Job Description: {jobDescription}
Required Skills: {requiredSkills}
Preferred Skills: {preferredSkills}

TARGET EVALUATION RUBRIC COMPETENCIES:
{targetRubric}

INTERVIEW TRANSCRIPT & QUESTION RESPONSES:
{transcriptJson}

Total Interview Duration: {durationMinutes} minutes

Please evaluate this interview thoroughly according to the structured rubric.`
  ]
]);

export class LangChainFullInterviewEvaluator implements IInterviewEvaluationLLMService {
  private _llm: BaseChatModel;

  constructor(llm?: BaseChatModel) {
    this._llm = llm || LLMProviderFactory.createFullEvaluationLLM();
  }

  async evaluateFullInterview(input: IEvaluationLLMInput): Promise<IEvaluationLLMOutput> {
    const config = LLMProviderFactory.getFullEvaluationConfig();
    Logger.info(
      LogCategory.SYSTEM_INFO,
      `[LangChainFullInterviewEvaluator] Evaluating full interview [Provider: ${config.provider}, Model: ${config.model}, Questions: ${input.transcript.length}]`
    );

    const formattedRubric = input.targetRubricCompetencies
      .map(c => `- ${c.name} (${c.category}): ${c.description}`)
      .join('\n');

    const formattedTranscript = JSON.stringify(input.transcript, null, 2);

    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let release: () => void;
        if (config.provider === 'OLLAMA') {
          release = await OllamaPriorityQueue.acquire('LOW');
        } else {
          release = await ProviderRateLimiter.acquire('EVALUATION_LLM', 10);
        }
        try {
          const chain = FULL_EVALUATION_PROMPT.pipe(this._llm.withStructuredOutput(fullEvaluationZodSchema));
          const result = await chain.invoke({
            jobTitle: input.jobTitle,
            experienceLevel: input.experienceLevel,
            jobDescription: input.jobDescription || 'None provided',
            requiredSkills: input.requiredSkills.join(', '),
            preferredSkills: (input.preferredSkills || []).join(', ') || 'None',
            targetRubric: formattedRubric,
            transcriptJson: formattedTranscript,
            durationMinutes: input.totalInterviewDurationMinutes,
          }, {
            signal: AbortSignal.timeout(Math.max(config.timeoutMs, 300000)), // Allow up to 300s (5m) for full interview synthesis
          });

          // Validate output with Zod
          const parsed = fullEvaluationZodSchema.parse(result);

          return {
            ...parsed,
            modelInfo: {
              model: config.model,
              provider: config.provider,
            },
          };
        } finally {
          release();
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        Logger.error(LogCategory.SYSTEM_ERROR, `[LangChainFullInterviewEvaluator] Evaluation attempt ${attempt} failed:`, err);
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, attempt * 2000));
        }
      }
    }

    throw lastError || new Error('Full interview evaluation failed after multiple attempts');
  }
}
