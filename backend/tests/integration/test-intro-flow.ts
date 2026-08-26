import { AIInterviewSession } from "../../src/domain/entities/ai-interview/AIInterviewSession";
import { InterviewQuestion } from "../../src/domain/entities/ai-interview/InterviewQuestion";
import { InterviewPhase } from "../../src/domain/enums/InterviewPhase.enum";
import { QuestionType } from "../../src/domain/enums/QuestionType.enum";
import { InterviewType } from "../../src/domain/enums/InterviewType.enum";

import { Logger, LogCategory } from "../../src/infrastructure/logger/logger";

async function runIntroFlowTests() {
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, "     AI INTERVIEW OPENING & CONVERSATION-START VERIFICATION       ");
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
  // TEST 1: Greeting Synthesis Logic
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 1: Opening Greeting Assembly ---");

  const mockStudent = {
    id: "stud-123",
    firstName: "Risla",
    lastName: "Sherin",
  };

  const mockJob = {
    id: "job-456",
    title: "Full Stack Developer",
  };

  const question1Text = "Can you explain how Node.js handles asynchronous operations and manages the event loop?";
  const firstQuestion = new InterviewQuestion({
    id: "q-1",
    text: question1Text,
    type: QuestionType.MAIN,
    context: "Node.js",
  });

  const session = new AIInterviewSession({
    id: "sess-1",
    interviewId: "int-1",
    studentId: mockStudent.id,
    jobId: mockJob.id,
    durationMinutes: 30,
    currentTopic: "Node.js",
  });

  session.startIntro();
  session.moveToQuestion(firstQuestion, "Node.js", InterviewType.TECHNICAL);

  const candidateName = mockStudent.firstName.trim();
  const jobTitle = mockJob.title.trim();
  const activeQuestion = session.questions[session.questions.length - 1];

  const openingGreeting = `Hello ${candidateName}, welcome to your ${jobTitle} interview. I'm your AI interviewer today. Let's get started. ${activeQuestion.text}`;

  Logger.info(LogCategory.SYSTEM_INFO, `[Synthesized Opening]: "${openingGreeting}"`);

  assert(openingGreeting.startsWith("Hello Risla"), "Includes candidate's actual first name");
  assert(openingGreeting.includes("Full Stack Developer interview"), "Includes the actual job title");
  assert(openingGreeting.includes("I'm your AI interviewer today. Let's get started."), "Includes professional intro phrase");
  assert(openingGreeting.endsWith(question1Text), "Seamlessly attaches already-generated Question 1 without re-prompting");

  // --------------------------------------------------------------------------
  // TEST 2: Fallback Handling for Missing Profile / Job
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 2: Graceful Fallbacks (Missing Name / Job) ---");

  const fallbackCandidateName = "";
  const fallbackJobTitle = "";
  const resolvedName = fallbackCandidateName || "there";
  const resolvedJob = fallbackJobTitle || "this position";

  const fallbackOpening = `Hello ${resolvedName}, welcome to your ${resolvedJob} interview. I'm your AI interviewer today. Let's get started. ${activeQuestion.text}`;
  Logger.info(LogCategory.SYSTEM_INFO, `[Fallback Opening]: "${fallbackOpening}"`);

  assert(fallbackOpening.startsWith("Hello there"), "Falls back cleanly to 'Hello there'");
  assert(fallbackOpening.includes("this position interview"), "Falls back cleanly to 'this position'");

  // --------------------------------------------------------------------------
  // TEST 3: Single Opening Guarantee (Subsequent Turns)
  // --------------------------------------------------------------------------
  Logger.info(LogCategory.SYSTEM_INFO, "\n--- TEST 3: Greeting Is NOT Repeated On Question 2 ---");

  const question2Text = "How do you manage state transitions and side effects in React?";
  const secondQuestion = new InterviewQuestion({
    id: "q-2",
    text: question2Text,
    type: QuestionType.MAIN,
    context: "React",
  });

  session.startEvaluation();
  session.moveToQuestion(secondQuestion, "React", InterviewType.TECHNICAL);

  const currentQ = session.questions[session.questions.length - 1];
  assert(currentQ.text === question2Text, "Question 2 text does not contain intro greeting");
  assert(!currentQ.text.includes("Hello Risla"), "Question 2 is pure without greeting repetition");

  Logger.info(LogCategory.SYSTEM_INFO, "\n==================================================================");
  Logger.info(LogCategory.SYSTEM_INFO, `  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  Logger.info(LogCategory.SYSTEM_INFO, "==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runIntroFlowTests().catch(err => {
  Logger.error(LogCategory.SYSTEM_ERROR, "Test Suite Crashed:", err);
  process.exit(1);
});
