import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';
import { CandidateUtteranceIntent } from "../../src/domain/enums/CandidateUtteranceIntent.enum";
import { CandidateQuestionCategory } from "../../src/domain/enums/CandidateQuestionCategory.enum";
import { 
  classifyCandidateUtterance, 
  getCandidateQuestionResponse 
} from "../../src/application/services/ai-interview/CandidateUtteranceClassifier";

async function runStudentResponseTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     FEATURE 2 & 5: RESPONSE HANDLING & CANDIDATE QUESTIONS       ");
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
  // TEST 1: Hesitation - "Let me think."
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Hesitation - 'Let me think.' ---");
  const t1 = classifyCandidateUtterance("Let me think.");
  assert(t1.intent === CandidateUtteranceIntent.HESITATION, "Classified 'Let me think.' as HESITATION");

  // --------------------------------------------------------------------------
  // TEST 2: Hesitation Variations
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Hesitation Variations ---");
  const hesitationPhrases = [
    "Give me a second.",
    "give me a moment",
    "Let me see",
    "Can I think for a moment?",
    "I'm trying to remember.",
    "trying to remember",
    "Just a second",
    "hold on a sec",
    "Wait a moment",
    "one second",
  ];

  for (const phrase of hesitationPhrases) {
    const res = classifyCandidateUtterance(phrase);
    assert(res.intent === CandidateUtteranceIntent.HESITATION, `Classified "${phrase}" as HESITATION`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Explicit Uncertainty - "I don't know."
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Uncertainty - 'I don't know.' ---");
  const t3 = classifyCandidateUtterance("I don't know.");
  assert(t3.intent === CandidateUtteranceIntent.EXPLICIT_DONT_KNOW, "Classified 'I don't know.' as EXPLICIT_DONT_KNOW");

  // --------------------------------------------------------------------------
  // TEST 4: Explicit Uncertainty - "I'm not sure." & Variations
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 4: Uncertainty Variations ---");
  const uncertaintyPhrases = [
    "I'm not sure.",
    "i am not sure",
    "I'm not sure about that.",
    "I don't know the answer.",
    "i do not know",
    "I have no idea.",
    "no idea",
    "Not sure about this",
    "I can't remember.",
  ];

  for (const phrase of uncertaintyPhrases) {
    const res = classifyCandidateUtterance(phrase);
    assert(res.intent === CandidateUtteranceIntent.EXPLICIT_DONT_KNOW, `Classified "${phrase}" as EXPLICIT_DONT_KNOW`);
  }

  // --------------------------------------------------------------------------
  // FEATURE 5 TESTS: CANDIDATE QUESTIONS & OFF-TOPIC
  // --------------------------------------------------------------------------

  // TEST 5A: Company Questions
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- FEATURE 5: Company / Role Questions ---");
  const companyQ = classifyCandidateUtterance("What technologies does your company use?");
  assert(companyQ.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION, "Company stack classified as CANDIDATE_QUESTION");
  assert(companyQ.questionCategory === CandidateQuestionCategory.COMPANY_OR_ROLE, "Category is COMPANY_OR_ROLE");

  const companyResp = getCandidateQuestionResponse(companyQ.questionCategory!, "Explain Node.js event loop", "Node.js");
  assert(companyResp.includes("job description") && companyResp.includes("return to the question"), "Company response redirects to question without hallucination");

  // TEST 5B: Interview Process Question
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- FEATURE 5: Interview Process Question ---");
  const processQ = classifyCandidateUtterance("What happens after this interview?");
  assert(processQ.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION, "Process query classified as CANDIDATE_QUESTION");
  assert(processQ.questionCategory === CandidateQuestionCategory.INTERVIEW_PROCESS, "Category is INTERVIEW_PROCESS");

  const processResp = getCandidateQuestionResponse(processQ.questionCategory!);
  assert(processResp.includes("recruiting team will follow up"), "Process response explains next steps");

  // TEST 5C: Clarification Question
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- FEATURE 5: Clarification Question ---");
  const clarifyQ = classifyCandidateUtterance("Do you mean Node.js specifically?");
  assert(clarifyQ.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION, "Clarification classified as CANDIDATE_QUESTION");
  assert(clarifyQ.questionCategory === CandidateQuestionCategory.CLARIFICATION, "Category is CLARIFICATION");

  const clarifyResp = getCandidateQuestionResponse(clarifyQ.questionCategory!, "Explain Node.js async", "Node.js");
  assert(clarifyResp.includes("specifically to Node.js"), "Clarification confirms active topic");

  // TEST 5D: Off-Topic Queries
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- FEATURE 5: Off-Topic Query ---");
  const offTopicQ = classifyCandidateUtterance("What's the weather today?");
  assert(offTopicQ.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION, "Weather classified as CANDIDATE_QUESTION");
  assert(offTopicQ.questionCategory === CandidateQuestionCategory.OFF_TOPIC, "Category is OFF_TOPIC");

  const offTopicResp = getCandidateQuestionResponse(offTopicQ.questionCategory!);
  assert(offTopicResp.includes("focus on the interview"), "Off-topic response politely redirects");

  // TEST 5E: Unknown Company Info (e.g. Salary, Benefits)
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- FEATURE 5: Unknown Company Info ---");
  const salaryQ = classifyCandidateUtterance("What is the company salary?");
  assert(salaryQ.intent === CandidateUtteranceIntent.CANDIDATE_QUESTION, "Salary query classified as CANDIDATE_QUESTION");
  assert(salaryQ.questionCategory === CandidateQuestionCategory.UNKNOWN_INFO, "Category is UNKNOWN_INFO");

  const salaryResp = getCandidateQuestionResponse(salaryQ.questionCategory!);
  assert(salaryResp.includes("I don't have that specific information available"), "Does not hallucinate salary");

  // TEST 5F: Repeated Off-Topic Question Bounding
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- FEATURE 5: Repeated Off-Topic Bounding ---");
  const boundedResp = getCandidateQuestionResponse(CandidateQuestionCategory.OFF_TOPIC, "Q", "Node.js", 3);
  assert(boundedResp.includes("stay focused on your interview"), "Firm redirection after 3 consecutive off-topic questions");

  // --------------------------------------------------------------------------
  // TEST 6: Normal Technical Answers (Must NOT be misclassified)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 6: Normal Technical Answers ---");
  const normalAnswers = [
    "I used JWT for authentication.",
    "Redis.",
    "JWT.",
    "PostgreSQL.",
    "Yes.",
    "No.",
    "I used Node.js with Express and MongoDB.",
    "We implemented a microservices architecture with Kafka event bus.",
    "In Node.js, asynchronous operations are handled via the libuv event loop.",
    "How Node.js handles asynchronous operations is through non-blocking I/O and callbacks.",
    "The technologies our company used were React and Node.js.",
    "I don't know the exact internal C++ implementation of V8, but in JavaScript libuv offloads async I/O.",
    "I am not sure if Redis is faster than Memcached in all cases, but we used Redis for TTL support."
  ];

  for (const ans of normalAnswers) {
    const res = classifyCandidateUtterance(ans);
    assert(res.intent === CandidateUtteranceIntent.NORMAL_ANSWER, `Properly classified technical answer: "${ans.slice(0, 45)}..." as NORMAL_ANSWER`);
  }

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStudentResponseTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
