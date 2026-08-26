import { 
  AIInterviewSession 
} from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { 
  InterviewQuestion 
} from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { 
  AnswerEvaluation 
} from "../../src/domain/value-objects/AnswerEvaluation";
import { 
  InterviewConfiguration 
} from "../../src/domain/value-objects/InterviewConfiguration";
import { 
  InterviewPlan 
} from "../../src/domain/value-objects/InterviewPlan";
import { 
  LangChainAnswerEvaluator 
} from "../../src/infrastructure/services/ai-interview/LangChainAnswerEvaluator.service";
import { AnswerQuality } from "../../src/domain/enums/AnswerQuality.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";

import { RunnableLambda } from '@langchain/core/runnables';
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runEvaluationAndFinalResultsTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 13: AI EVALUATION & FINAL RESULTS TESTS              ");
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PASS] ${testName}${detail ? ` -> ${detail}` : ''}`);
      passed++;
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, `[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Category-Specific Answer Evaluation (TECHNICAL, BEHAVIORAL, HR)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Category Evaluation Parsing ---");
  const mockLLM = {
    withStructuredOutput: () => new RunnableLambda({
      func: async (promptValue: any) => {
        const text = promptValue?.value || promptValue?.text || String(promptValue);
        if (text.includes("Category: BEHAVIORAL")) {
          return {
            score: 85,
            quality: AnswerQuality.GOOD,
            feedback: "Demonstrated clear conflict resolution and team collaboration using STAR framework.",
            needsFollowUp: false
          };
        } else if (text.includes("Category: HR")) {
          return {
            score: 80,
            quality: AnswerQuality.GOOD,
            feedback: "Strong career motivation and alignment with engineering values.",
            needsFollowUp: false
          };
        } else {
          return {
            score: 90,
            quality: AnswerQuality.EXCELLENT,
            feedback: "Accurate explanation of the libuv event loop and thread pool.",
            needsFollowUp: false
          };
        }
      }
    })
  } as any;

  const evaluator = new LangChainAnswerEvaluator(mockLLM);

  const techEval = await evaluator.evaluateAnswer({
    questionText: "How does Node.js handle async concurrency?",
    candidateAnswer: "Node.js uses the single-threaded event loop backed by libuv for non-blocking I/O.",
    interviewContext: "Role: Backend Engineer",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.MID
  });

  assert(techEval.score === 90, "Technical evaluation score returned 90");
  assert(techEval.quality === AnswerQuality.EXCELLENT, "Technical evaluation quality EXCELLENT");

  const behavioralEval = await evaluator.evaluateAnswer({
    questionText: "Describe a time you resolved a disagreement with a team member.",
    candidateAnswer: "We had differing architecture opinions. I organized a prototype spike to measure latency data.",
    interviewContext: "Role: Backend Engineer",
    interviewType: InterviewType.BEHAVIORAL,
    difficulty: InterviewDifficulty.MID
  });

  assert(behavioralEval.score === 85, "Behavioral evaluation score returned 85");
  assert(behavioralEval.feedback.includes("STAR"), "Behavioral feedback mentions collaboration criteria");

  // --------------------------------------------------------------------------
  // TEST 2: Per-Question Evaluation Attachment & Idempotency
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Evaluation Attachment & Idempotency ---");
  const q1 = new InterviewQuestion({
    id: "q-eval-1",
    text: "Explain PostgreSQL indexing strategies.",
    type: QuestionType.MAIN,
    context: "PostgreSQL"
  });

  q1.recordAnswer("I use B-Tree indexes for equality/range queries and GIN for JSONB.");
  const eval1 = new AnswerEvaluation({
    score: 88,
    quality: AnswerQuality.GOOD,
    feedback: "Clear understanding of B-Tree vs GIN indexing.",
    needsFollowUp: false
  });

  q1.attachEvaluation(eval1);
  assert(q1.evaluation?.score === 88, "Evaluation attached successfully");

  let threwDuplicateError = false;
  try {
    q1.attachEvaluation(eval1);
  } catch (err) {
    threwDuplicateError = true;
  }
  assert(threwDuplicateError, "Duplicate evaluation attachment prevented (idempotent)");

  // --------------------------------------------------------------------------
  // TEST 3: Domain Final Result Calculation (Overall Score, Categories, Strengths)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Final Interview Result Aggregation ---");
  const q2 = new InterviewQuestion({
    id: "q-eval-2",
    text: "Tell me about a difficult bug you solved under pressure.",
    type: QuestionType.MAIN,
    context: "Team Collaboration"
  });
  q2.recordAnswer("A memory leak occurred in production. I took heap dumps and identified unclosed event emitters.");
  q2.attachEvaluation(new AnswerEvaluation({
    score: 92,
    quality: AnswerQuality.EXCELLENT,
    feedback: "Excellent debugging methodology and ownership.",
    needsFollowUp: false
  }));

  const session = new AIInterviewSession({
    id: "sess-result-1",
    interviewId: "int-res-1",
    studentId: "stud-res-1",
    durationMinutes: 30,
    configuration: InterviewConfiguration.createDefault(),
    interviewPlan: new InterviewPlan([
      { category: InterviewType.TECHNICAL, skillOrTopic: "PostgreSQL", targetQuestions: 1, questionsAsked: 1 },
      { category: InterviewType.BEHAVIORAL, skillOrTopic: "Team Collaboration", targetQuestions: 1, questionsAsked: 1 }
    ]),
    questions: [q1, q2],
    phase: InterviewPhase.COMPLETED
  });

  const finalResult = session.calculateFinalResult();
  assert(finalResult.overallScore === 90, "Overall score calculated as weighted average (90)", `Overall: ${finalResult.overallScore}`);
  assert(finalResult.categoryScores["PostgreSQL"] === 88, "PostgreSQL category score: 88");
  assert(finalResult.categoryScores["Team Collaboration"] === 92, "Team Collaboration category score: 92");
  assert(finalResult.recommendation === 'STRONG_HIRE', "Recommendation is STRONG_HIRE for score >= 85");
  assert(finalResult.strengths.length === 2, "2 key strengths identified");

  // --------------------------------------------------------------------------
  // TEST 4: Missing & Partial Evaluations Graceful Fallback
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Missing & Partial Evaluations Handling ---");
  const unevaluatedSession = new AIInterviewSession({
    id: "sess-empty-1",
    interviewId: "int-empty-1",
    studentId: "stud-empty-1",
    durationMinutes: 30,
    configuration: InterviewConfiguration.createDefault(),
    questions: [],
    phase: InterviewPhase.COMPLETED
  });

  const emptyResult = unevaluatedSession.calculateFinalResult();
  assert(emptyResult.overallScore === 0, "Empty session defaults overall score to 0");
  assert(emptyResult.recommendation === 'NO_HIRE', "Empty session defaults recommendation to NO_HIRE");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runEvaluationAndFinalResultsTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
