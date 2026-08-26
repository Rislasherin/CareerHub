import { InterviewDifficulty } from "../../src/domain/enums/InterviewDifficulty.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";
import { InterviewConfiguration } from "../../src/domain/value-objects/InterviewConfiguration";
import { InterviewPlan } from "../../src/domain/value-objects/InterviewPlan";
import { Job } from "../../src/domain/entities/Job";
import { InterviewContextBuilder } from "../../src/application/services/ai-interview/InterviewContextBuilder";
import { LLMProviderFactory } from "../../src/infrastructure/services/ai-interview/LLMProvider.factory";
import { LangChainQuestionGenerator } from "../../src/infrastructure/services/ai-interview/LangChainQuestionGenerator.service";
import { LangChainAnswerEvaluator } from "../../src/infrastructure/services/ai-interview/LangChainAnswerEvaluator.service";
import { LangGraphInterviewAIOrchestrator } from "../../src/infrastructure/services/ai-interview/LangGraphInterviewAIOrchestrator.service";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function runTestSuite() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "  CAREERHUB AI INTERVIEW: JD-DRIVEN MULTI-TYPE SUITE VERIFICATION ");
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PASS] ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      Logger.error(LogCategory.SYSTEM_ERROR, `[FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  // Sample Mock Job Entity
  const mockJob = new Job({
    id: "job-12345",
    companyId: "comp-999",
    collegeId: "col-111",
    title: "Senior Full-Stack Architect (React & Node.js)",
    description: "Lead the backend distributed systems and frontend micro-frontends with high concurrency.",
    location: "San Francisco, CA",
    category: "Software Engineering",
    openings: 2,
    deadline: new Date(),
    type: "full-time" as any,
    workMode: "hybrid",
    interviewMode: "online",
    noticePeriod: "Immediate",
    eligibility: {
      minCGPA: 7.0,
      allowedBacklogs: 0,
      eligibleBranches: ["CS", "IT"],
      passingYear: 2024,
      degreeType: "B.Tech"
    },
    experienceLevel: "Senior",
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "System Architecture"],
    preferredSkills: ["GraphQL", "Redis", "Kafka"],
    minSalary: 140000,
    maxSalary: 190000,
    salaryType: "per_year",
    rounds: [],
    status: "active" as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // --------------------------------------------------------------------------
  // TEST 1: Validation of Invalid Configuration & Fallbacks
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Domain Validation & Fallback Handling ---");
  try {
    new InterviewConfiguration({ types: [], durationMinutes: 30 });
    assert(false, "Should reject empty types");
  } catch (err: any) {
    assert(true, "Rejects empty types", err.message);
  }

  try {
    new InterviewConfiguration({ types: [InterviewType.TECHNICAL], durationMinutes: 0 });
    assert(false, "Should reject 0 durationMinutes");
  } catch (err: any) {
    assert(true, "Rejects 0 durationMinutes", err.message);
  }

  const defaultConfig = InterviewConfiguration.createDefault();
  assert(defaultConfig.primaryType === InterviewType.TECHNICAL, "Default configuration uses TECHNICAL");
  assert(defaultConfig.difficulty === InterviewDifficulty.MID, "Default configuration uses MID difficulty");

  // --------------------------------------------------------------------------
  // TEST 2: Job-Description Context Building & Plan Generation (Single & Mixed)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: InterviewContextBuilder & Plan Allocation ---");
  const mixedConfig = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL, InterviewType.BEHAVIORAL],
    difficulty: InterviewDifficulty.SENIOR,
    durationMinutes: 30,
    skills: ["React", "System Architecture", "PostgreSQL"],
    questionDistribution: { technical: 70, behavioral: 30 },
    customInstructions: ["Focus on high scalability and concurrency", "Probe deeply into trade-offs"],
    prohibitedTopics: ["Legacy jQuery"],
  });

  const builtMixed = InterviewContextBuilder.build(mockJob, mixedConfig);
  assert(builtMixed.interviewContext.includes("Senior Full-Stack Architect"), "Context includes Job Title");
  assert(builtMixed.interviewContext.includes("SENIOR"), "Context includes Target Difficulty");
  assert(builtMixed.interviewContext.includes("Focus on high scalability and concurrency"), "Context includes HR Custom Instructions");
  assert(builtMixed.interviewContext.includes("Legacy jQuery"), "Context includes Prohibited Topics");
  assert(builtMixed.interviewPlan.items.length >= 2, "Plan allocates items for mixed categories");
  
  const techItems = builtMixed.interviewPlan.items.filter(i => i.category === InterviewType.TECHNICAL);
  const behItems = builtMixed.interviewPlan.items.filter(i => i.category === InterviewType.BEHAVIORAL);
  assert(techItems.length > 0 && behItems.length > 0, "Plan contains both TECHNICAL and BEHAVIORAL categories");

  // --------------------------------------------------------------------------
  // TEST 3: Realtime LLM Question Generation with Difficulty & Categories
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Realtime LLM Question Generation (Groq/Question LLM) ---");
  const questionLLM = LLMProviderFactory.createQuestionLLM();
  const questionGenerator = new LangChainQuestionGenerator(questionLLM);

  // 3a. Senior Technical Question
  const seniorTechQ = await questionGenerator.generateNextQuestion({
    interviewContext: builtMixed.interviewContext,
    previousQuestions: [],
    topic: "System Architecture",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
    customInstructions: [...mixedConfig.customInstructions],
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[Generated Senior Technical Question]: "${seniorTechQ.text}"`);
  assert(seniorTechQ.text.length > 10 && seniorTechQ.text.endsWith("?"), "Generated valid senior technical question");

  // 3b. Junior Technical Question
  const juniorConfig = new InterviewConfiguration({
    types: [InterviewType.TECHNICAL],
    difficulty: InterviewDifficulty.JUNIOR,
    durationMinutes: 15,
    skills: ["React Basics"],
  });
  const builtJunior = InterviewContextBuilder.build(mockJob, juniorConfig);
  const juniorTechQ = await questionGenerator.generateNextQuestion({
    interviewContext: builtJunior.interviewContext,
    previousQuestions: [],
    topic: "React Basics",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.JUNIOR,
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[Generated Junior Technical Question]: "${juniorTechQ.text}"`);
  assert(juniorTechQ.text.length > 10 && juniorTechQ.text.endsWith("?"), "Generated valid junior technical question");

  // 3c. Behavioral Question
  const behavioralQ = await questionGenerator.generateNextQuestion({
    interviewContext: builtMixed.interviewContext,
    previousQuestions: [seniorTechQ.text],
    topic: "Conflict Resolution & Team Collaboration",
    interviewType: InterviewType.BEHAVIORAL,
    difficulty: InterviewDifficulty.SENIOR,
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[Generated Behavioral Question]: "${behavioralQ.text}"`);
  assert(behavioralQ.text.length > 10 && behavioralQ.text.endsWith("?"), "Generated valid behavioral question");

  // 3d. HR Question
  const hrQ = await questionGenerator.generateNextQuestion({
    interviewContext: builtMixed.interviewContext,
    previousQuestions: [seniorTechQ.text, behavioralQ.text],
    topic: "Career Motivation & Workplace Expectations",
    interviewType: InterviewType.HR,
    difficulty: InterviewDifficulty.SENIOR,
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[Generated HR Question]: "${hrQ.text}"`);
  assert(hrQ.text.length > 10 && hrQ.text.endsWith("?"), "Generated valid HR question");

  // --------------------------------------------------------------------------
  // TEST 4: Dynamic Follow-Up Generation on Shallow Answers
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Dynamic Follow-Up Generation ---");
  const followUpQ = await questionGenerator.generateFollowUp({
    interviewContext: builtMixed.interviewContext,
    lastQuestion: seniorTechQ.text,
    lastAnswer: "I use caching to make things faster.",
    topic: "System Architecture",
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
    customInstructions: ["Probe deeply into trade-offs and eviction strategies"],
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[Generated Follow-Up Question]: "${followUpQ.text}"`);
  assert(followUpQ.text.length > 10 && followUpQ.text.endsWith("?"), "Generated contextual follow-up question");

  // --------------------------------------------------------------------------
  // TEST 5: LangGraph Realtime Routing & Plan Navigation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 5: LangGraph Routing & Plan-Driven Navigation ---");
  const evalLLM = LLMProviderFactory.createEvaluationLLM();
  const evaluator = new LangChainAnswerEvaluator(evalLLM);
  const orchestrator = new LangGraphInterviewAIOrchestrator(evaluator, questionGenerator);

  // 5a. Shallow answer -> Should trigger ASK_FOLLOW_UP
  const shallowResult = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: "Yes, we did.",
    currentQuestion: {
      id: "q-1",
      text: seniorTechQ.text,
      type: seniorTechQ.type,
      context: "System Architecture",
    },
    interviewContext: builtMixed.interviewContext,
    interviewPlan: builtMixed.interviewPlan,
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
    currentTopic: "System Architecture",
    coveredTopics: ["System Architecture"],
    followUpCount: 0,
    recentQuestions: [seniorTechQ.text],
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[LangGraph Shallow Result Action]: ${shallowResult.action}`);
  assert(shallowResult.action === "ASK_FOLLOW_UP", "LangGraph routes shallow answer to ASK_FOLLOW_UP");

  // 5b. Comprehensive answer -> Should trigger ASK_NEXT_QUESTION from InterviewPlan
  const fullResult = await orchestrator.processAnswer({
    sessionId: "sess-1",
    candidateAnswer: "In our microservices setup, we implemented Redis as a write-through cache with a Least Recently Used eviction policy, coupled with Kafka for async event broadcasting to maintain eventual consistency across distributed nodes.",
    currentQuestion: {
      id: "q-1",
      text: seniorTechQ.text,
      type: seniorTechQ.type,
      context: "System Architecture",
    },
    interviewContext: builtMixed.interviewContext,
    interviewPlan: builtMixed.interviewPlan,
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
    currentTopic: "System Architecture",
    coveredTopics: ["System Architecture"],
    followUpCount: 1,
    recentQuestions: [seniorTechQ.text],
  });
  Logger.info(LogCategory.SYSTEM_INFO, `[LangGraph Full Result Action]: ${fullResult.action}, NextTopic: "${fullResult.nextTopic}", Category: ${fullResult.nextCategory}`);
  assert(fullResult.action === "ASK_NEXT_QUESTION", "LangGraph routes comprehensive answer to ASK_NEXT_QUESTION");
  assert(!!fullResult.nextQuestion?.text, "LangGraph generated next question in realtime");

  // --------------------------------------------------------------------------
  // TEST 6: JD-Aware Background Answer Evaluation
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: JD-Aware Answer Evaluation (Ollama Evaluation LLM) ---");
  const evalResult = await evaluator.evaluateAnswer({
    questionText: seniorTechQ.text,
    candidateAnswer: "In our microservices setup, we implemented Redis as a write-through cache with LRU eviction and Kafka for async event propagation.",
    interviewContext: builtMixed.interviewContext,
    interviewType: InterviewType.TECHNICAL,
    difficulty: InterviewDifficulty.SENIOR,
  });
  Logger.info(LogCategory.SYSTEM_INFO, "[Evaluation Result]:", evalResult);
  assert(typeof evalResult.score === "number" && evalResult.score >= 0 && evalResult.score <= 100, "Valid evaluation score (0-100)");
  assert(["EXCELLENT", "GOOD", "AVERAGE", "POOR"].includes(evalResult.quality), "Valid evaluation quality enum");
  assert(evalResult.feedback.length > 5, "Valid evaluation feedback");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
