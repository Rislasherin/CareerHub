import { CreateAIPracticeInterviewUseCase } from "../../src/application/usecases/ai-practice/implementations/CreateAIPracticeInterview.usecase";
import { GetAIPracticeInterviewUseCase } from "../../src/application/usecases/ai-practice/implementations/GetAIPracticeInterview.usecase";
import { AIPracticeInterview } from "../../src/domain/entities/ai-practice/AIPracticeInterview";
import { PracticeDifficulty } from "../../src/domain/enums/PracticeDifficulty.enum";
import { PracticeInterviewStatus } from "../../src/domain/enums/PracticeInterviewStatus.enum";
import { IAIPracticeInterviewRepository } from "../../src/domain/repositories/ai-practice/IAIPracticeInterviewRepository";

async function runTests() {
  console.log("==========================================================");
  console.log("    STUDENT AI PRACTICE INTERVIEW CORE FOUNDATION TESTS   ");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Mock Repository
  const store = new Map<string, AIPracticeInterview>();
  const mockRepo: IAIPracticeInterviewRepository = {
    async findById(id: string): Promise<AIPracticeInterview | null> {
      return store.get(id) || null;
    },
    async create(entity: AIPracticeInterview): Promise<AIPracticeInterview> {
      const id = entity.id || Math.random().toString(36).substring(7);
      const saved = new AIPracticeInterview({
        id,
        studentId: entity.studentId,
        difficulty: entity.difficulty,
        topics: entity.topics,
        status: entity.status,
        questions: entity.questions.map(q => ({ ...q })),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
      });
      store.set(id, saved);
      return saved;
    },
    async update(id: string, entity: AIPracticeInterview): Promise<AIPracticeInterview> {
      store.set(id, entity);
      return entity;
    },
    async delete(id: string): Promise<void> {
      store.delete(id);
    },
    async count(): Promise<number> {
      return store.size;
    },
    async findByStudentId(studentId: string): Promise<AIPracticeInterview[]> {
      return Array.from(store.values()).filter(p => p.studentId === studentId);
    },
    async findByIdAndStudentId(id: string, studentId: string): Promise<AIPracticeInterview | null> {
      const entity = store.get(id);
      return (entity && entity.studentId === studentId) ? entity : null;
    },
    async recordAnswerAtomically(sessionId: string, questionId: string, answer: string): Promise<boolean> {
      const entity = store.get(sessionId);
      if (!entity) return false;
      const question = entity.questions.find(q => q.id === questionId);
      if (!question || question.candidateAnswer !== undefined) return false;
      question.candidateAnswer = answer;
      question.answeredAt = new Date();
      return true;
    }
  };

  // 2. Use Cases
  const createUseCase = new CreateAIPracticeInterviewUseCase(mockRepo);
  const getUseCase = new GetAIPracticeInterviewUseCase(mockRepo);

  try {
    // Test Case 1: Create Practice Session
    const mockStudentA = "student-123";
    const dto = {
      difficulty: PracticeDifficulty.MEDIUM,
      topics: ["React", "TypeScript"] as any
    };
    
    const created = await createUseCase.execute(mockStudentA, dto);
    assert(created.id !== undefined, "Session ID should be generated");
    assert(created.studentId === mockStudentA, "Student ID should map correctly");
    assert(created.difficulty === PracticeDifficulty.MEDIUM, "Difficulty level should be MEDIUM");
    assert(created.status === PracticeInterviewStatus.CREATED, "Initial status should be CREATED");
    
    // Test Case 2: Retrieve Owned Practice Session (Get Use Case)
    const fetched = await getUseCase.execute(created.id!, mockStudentA);
    assert(fetched !== null, "Student should retrieve their own practice session");
    assert(fetched.difficulty === PracticeDifficulty.MEDIUM, "Difficulty matches");

    // Test Case 3: Tenant Isolation (IDOR Prevention Check)
    const mockStudentB = "student-999";
    let threwIdorError = false;
    try {
      await getUseCase.execute(created.id!, mockStudentB);
    } catch (err) {
      threwIdorError = true;
    }
    assert(threwIdorError, "Access must be rejected if requested by another student ID");

  } catch (err: any) {
    assert(false, `Tests run errored: ${err.message}`);
  }

  console.log("==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");
}

runTests();
