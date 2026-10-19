import { AnswerRelevanceClassification, CandidateAnswerQuality } from "../../application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { Logger, LogCategory } from "../../infrastructure/logger/logger";

export interface IRelevanceAssessmentResult {
  classification: AnswerRelevanceClassification;
  quality: CandidateAnswerQuality;
  keyPoint?: string;
  acknowledgement?: string | null;
  spokenResponse?: string;
  reasoning: string;
}

const COMMON_FILLER = new Set([
  'uh', 'um', 'hmm', 'ah', 'dunno', 'idk', 'asdf', 'whatever', 'thing', 'things',
  'stuff', 'maybe', 'kinda', 'sorta', 'like', 'yeah', 'okay', 'right', 'so'
]);

const OFF_TOPIC_PATTERNS = [
  /\b(weather|sunny|rain|raining|cloudy|temperature|hot outside|cold outside)\b/i,
  /\b(sandwich|pizza|burger|lunch|dinner|breakfast|food|coffee|cooking|recipe|eat|ate)\b/i,
  /\b(movie|cinema|netflix|song|music|guitar|concert|actor|actress|video game|gaming|playstation|xbox)\b/i,
  /\b(dog|cat|pet|puppy|kitten|zoo|animal)\b/i,
  /\b(football|soccer|basketball|cricket|tennis|match|stadium|championship)\b/i,
  /\b(vacation|holiday|beach|trip|flight|hotel|travel|swimming)\b/i,
  /\b(how are you|who are you|are you real|are you human|tell me a joke|what is your name)\b/i,
  /\b(salary|ctc|package|benefits|pay scale|bonus|compensation)\b/i
];

const KNOWN_CONTRADICTIONS_AND_MISCONCEPTIONS = [
  {
    topic: /redis/i,
    pattern: /\b(relational|sql database|foreign key|table joins|acid transaction across tables)\b/i,
    description: "Redis is an in-memory key-value data store, not a relational SQL database with foreign keys."
  },
  {
    topic: /node(\.js)?|event loop/i,
    pattern: /\b(multi[- ]threaded javascript|runs on multiple threads simultaneously for js code|separate thread per request)\b/i,
    description: "Node.js JavaScript execution is single-threaded on the event loop; it does not run user JS code on multiple threads per request."
  },
  {
    topic: /mongodb|nosql/i,
    pattern: /\b(strictly relational|normalized tables|sql queries|foreign keys by default)\b/i,
    description: "MongoDB is a document-oriented NoSQL database, not a normalized relational SQL database."
  },
  {
    topic: /http|rest/i,
    pattern: /\b(inherently stateful|maintains connection open across reboots|stateful by default)\b/i,
    description: "HTTP and REST are inherently stateless application protocols."
  },
  {
    topic: /react/i,
    pattern: /\b(directly mutates real dom|re-renders because server database changed automatically)\b/i,
    description: "React utilizes a virtual DOM reconciliation algorithm and does not automatically listen to direct database changes without state/network integration."
  },
  {
    topic: /docker|container/i,
    pattern: /\b(full virtual machine with guest os kernel|hypervisor emulates hardware)\b/i,
    description: "Containers share the host operating system kernel and are not full virtual machines with independent guest kernels."
  },
  {
    topic: /jwt|token/i,
    pattern: /\b(encrypted by default|secret key stored in the token payload)\b/i,
    description: "Standard JWTs are base64url encoded and digitally signed, not encrypted by default, and the secret key is never stored in the payload."
  }
];

export function assessAnswerRelevance(
  questionText: string,
  candidateAnswer: string,
  topic: string = "General"
): IRelevanceAssessmentResult {
  try {
    const rawAnswer = (candidateAnswer || "").trim();
    if (!rawAnswer) {
      return {
        classification: AnswerRelevanceClassification.NO_RESPONSE,
        quality: CandidateAnswerQuality.UNCLEAR,
        reasoning: "Candidate gave no response (empty answer).",
        spokenResponse: "I haven't heard your response yet. Take your time, or let me know if you would like me to repeat the question."
      };
    }

    const cleanAnswer = rawAnswer.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanAnswer.split(' ').filter(Boolean);
    const wordCount = words.length;
    const cleanQuestion = (questionText || "").toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanTopic = (topic || "").toLowerCase();

    // 1. Unclear / Too Short / Incoherent / Pure Filler
    if (wordCount === 0 || cleanAnswer.length < 2) {
      return {
        classification: AnswerRelevanceClassification.UNCLEAR_OR_TOO_SHORT,
        quality: CandidateAnswerQuality.UNCLEAR,
        reasoning: "Answer is too short or empty to evaluate.",
        spokenResponse: "Could you elaborate a bit more on that?"
      };
    }

    const nonFillerCount = words.filter(w => !COMMON_FILLER.has(w)).length;
    const isPureFiller = nonFillerCount === 0 || (wordCount <= 6 && nonFillerCount <= 1 && !/\b(jwt|redis|sql|nosql|react|node|docker|git|aws|yes|no)\b/i.test(cleanAnswer));
    if (isPureFiller) {
      return {
        classification: AnswerRelevanceClassification.UNCLEAR_OR_TOO_SHORT,
        quality: CandidateAnswerQuality.UNCLEAR,
        reasoning: "Answer consists entirely of hesitation or filler words.",
        spokenResponse: "Could you please elaborate on your thoughts or provide an example?"
      };
    }

    // 2. Off-Topic / Irrelevant Detection
    for (const offTopicRegex of OFF_TOPIC_PATTERNS) {
      if (offTopicRegex.test(cleanAnswer) && !offTopicRegex.test(cleanQuestion)) {
        // If candidate answer mentions off-topic themes not prompted by the question
        return {
          classification: AnswerRelevanceClassification.IRRELEVANT_OR_UNRELATED,
          quality: CandidateAnswerQuality.WEAK,
          reasoning: "Answer discusses an unrelated topic or casual banter.",
          spokenResponse: `That doesn't quite address our question regarding ${topic !== 'General' ? topic : 'this area'}. Let's refocus on the question: ${questionText}`
        };
      }
    }

    // 2b. Cross-Domain Technical Irrelevance Check
    const isErrorHandlingQuestion = /\b(error|errors|exception|exceptions|error handling|try[- ]catch|promise rejection)\b/i.test(cleanQuestion);
    const isClosureQuestion = /\b(closure|closures|lexical scope|scope chain)\b/i.test(cleanQuestion);
    const isArchitectureAnswer = /\b(microservices?|docker|kubernetes|k8s|containers?|service mesh|load balancer)\b/i.test(cleanAnswer);
    const hasLanguageCoreAnswer = /\b(try|catch|finally|throw|exception|reject|rejection|error|unhandled|scope|function|outer|inner|variable)\b/i.test(cleanAnswer);

    if ((isErrorHandlingQuestion || isClosureQuestion) && isArchitectureAnswer && !hasLanguageCoreAnswer) {
      return {
        classification: AnswerRelevanceClassification.IRRELEVANT_OR_UNRELATED,
        quality: CandidateAnswerQuality.WEAK,
        reasoning: "Answer discusses system architecture or infrastructure rather than the requested programming language concept.",
        spokenResponse: isErrorHandlingQuestion
          ? "Microservices relates to system architecture, but we're focusing on JavaScript error handling. Could you explain how you handle errors, exceptions, or promise rejections in JavaScript?"
          : "That relates to system architecture, but we're focusing on closures. Could you explain how closures work in JavaScript?"
      };
    }

    // 2c. Node.js Asynchronous Operations / Event Loop Recognition
    const isNodeAsyncQuestion = /\b(node(\.js)?|event loop|async(hronous)?\s+operations?|non[- ]blocking)\b/i.test(cleanQuestion);
    const mentionsEventLoop = /\b(single[- ]threaded event loop|event loop|single threaded|libuv)\b/i.test(cleanAnswer);

    if (isNodeAsyncQuestion && mentionsEventLoop) {
      const isDetailed = wordCount >= 14 || /\b(libuv|offload|thread pool|callback queue|microtask|macrotask|non[- ]blocking)\b/i.test(cleanAnswer);
      if (isDetailed) {
        return {
          classification: AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
          quality: CandidateAnswerQuality.STRONG,
          keyPoint: "single-threaded event loop",
          acknowledgement: "Right, Node.js handles asynchronous operations using a single-threaded event loop.",
          reasoning: "Candidate accurately explained how Node.js utilizes the single-threaded event loop for asynchronous operations."
        };
      } else {
        return {
          classification: AnswerRelevanceClassification.RELEVANT_INCOMPLETE,
          quality: CandidateAnswerQuality.PARTIAL,
          keyPoint: "single-threaded event loop",
          acknowledgement: "Right, Node.js uses a single-threaded event loop.",
          spokenResponse: "Right, Node.js uses a single-threaded event loop. Could you walk me through how the event loop coordinates with libuv or the thread pool to handle non-blocking I/O operations?",
          reasoning: "Candidate correctly identified the single-threaded event loop, but omitted details on underlying I/O offloading mechanisms."
        };
      }
    }

    // 3. Technical Contradiction & Misconception Detection
    for (const item of KNOWN_CONTRADICTIONS_AND_MISCONCEPTIONS) {
      const isTopicMatch = item.topic.test(cleanQuestion) || item.topic.test(cleanTopic) || item.topic.test(cleanAnswer);
      if (isTopicMatch && item.pattern.test(cleanAnswer)) {
        return {
          classification: AnswerRelevanceClassification.INCORRECT_OR_MISCONCEPTION,
          quality: CandidateAnswerQuality.WEAK,
          reasoning: item.description,
          spokenResponse: `Could you clarify your reasoning on that? Specifically, how would that function given ${item.description.toLowerCase().split(',')[0]}?`
        };
      }
    }

    // Explicit technical negation or claim of opposite fact
    const isExplicitlyWrong = /\b(does not exist|is never used|cannot be used|is impossible in|is a myth)\b/i.test(cleanAnswer) &&
      /\b(indexing|caching|async|database|api|http|test|git|react|node)\b/i.test(cleanQuestion);
    if (isExplicitlyWrong) {
      return {
        classification: AnswerRelevanceClassification.INCORRECT_OR_MISCONCEPTION,
        quality: CandidateAnswerQuality.WEAK,
        reasoning: "Candidate asserted an impossible negation regarding core software engineering concepts.",
        spokenResponse: "Could you walk me through your reasoning behind that conclusion?"
      };
    }

    // 4. Concise Factoid / Keyword / Direct Definition Answers
    const isDirectFactoidQuestion = /^(which|what('s|\s+is|\s+are)?\s+([a-z0-9_-]+\s+)?(tool|library|framework|database|cache|orm|language|method|protocol|concept)|what('s|\s+is|\s+are)\s+[a-z0-9_-]+|name a|name the)\b/i.test(cleanQuestion);
    const hasCoreTechKeyword = /\b(jwt|json web token|redis|mongodb|postgres|postgresql|mysql|sqlite|docker|kubernetes|node|nodejs|react|redux|zustand|express|fastify|nestjs|graphql|rest|grpc|kafka|rabbitmq|git|aws|gcp|azure|typescript|javascript|python|go|java|html|css|tailwind|vitest|jest|mocha)\b/i.test(cleanAnswer);
    const hasTechnicalDefinition = /\b(in[- ]memory|key[- ]value|data store|cache|database|document[- ]oriented|relational|non[- ]relational|virtual dom|lexical scope|closure|event loop|single[- ]threaded|container|virtualization)\b/i.test(cleanAnswer);

    if (isDirectFactoidQuestion && (hasCoreTechKeyword || hasTechnicalDefinition) && wordCount <= 16) {
      const matchedKeyword = cleanAnswer.match(/\b(jwt|redis|mongodb|postgres|postgresql|mysql|docker|kubernetes|node|react|express|fastify|nestjs|graphql|rest|kafka|rabbitmq|git|aws|typescript|javascript)\b/i)?.[0];
      const keyAck = matchedKeyword ? `Right, ${matchedKeyword.toUpperCase()} is accurate.` : "Makes sense, thank you.";
      return {
        classification: AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
        quality: CandidateAnswerQuality.STRONG,
        keyPoint: matchedKeyword || "Accurate definition",
        acknowledgement: keyAck,
        reasoning: "Candidate accurately identified or defined the requested technology or concept."
      };
    }

    // 5. Open-Ended / Deep-Dive Explanation Questions
    const isExplanationQuestion = /^(explain|how does|how would you|describe|walk me through|what is the difference|compare|deep dive|what are the trade-offs|can you (explain|describe|walk me through)|could you (explain|describe|walk me through))/i.test(cleanQuestion);

    if (isExplanationQuestion) {
      if (wordCount < 4) {
        return {
          classification: AnswerRelevanceClassification.RELEVANT_INCOMPLETE,
          quality: CandidateAnswerQuality.WEAK,
          reasoning: "Answer is too brief for an open-ended technical explanation question.",
          spokenResponse: "You touched on that briefly. Could you dive a bit deeper into the underlying mechanism?"
        };
      }

      if (wordCount < 14) {
        return {
          classification: AnswerRelevanceClassification.RELEVANT_INCOMPLETE,
          quality: CandidateAnswerQuality.PARTIAL,
          reasoning: "Answer provides a high-level overview but misses structural depth or edge cases.",
          spokenResponse: "You mentioned the general approach. Could you elaborate on how you would handle potential edge cases or trade-offs?"
        };
      }

      // Substantive Explanation (>= 14 words)
      const keyPointMatch = cleanAnswer.match(/\b(offload|libuv|event loop|indexing|caching|state management|concurrency|middleware|dependency injection|normalization|denormalization|virtual dom|immutability|non[- ]blocking|asynchronous|scalability)\b/i)?.[0];
      const ack = keyPointMatch ? `Understood, especially regarding ${keyPointMatch}.` : "Makes sense, thank you for walking through that.";
      return {
        classification: AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
        quality: CandidateAnswerQuality.STRONG,
        keyPoint: keyPointMatch,
        acknowledgement: ack,
        reasoning: "Candidate provided a detailed, technically coherent explanation."
      };
    }

    // 6. General Questions / Behavioral / Architecture
    if (wordCount < 5) {
      return {
        classification: AnswerRelevanceClassification.RELEVANT_INCOMPLETE,
        quality: hasCoreTechKeyword ? CandidateAnswerQuality.PARTIAL : CandidateAnswerQuality.WEAK,
        reasoning: "Answer is concise but leaves room for explanation.",
        spokenResponse: "Could you expand on that with a specific scenario you've encountered?"
      };
    }

    if (wordCount < 12) {
      return {
        classification: AnswerRelevanceClassification.PARTIALLY_RELEVANT,
        quality: CandidateAnswerQuality.PARTIAL,
        reasoning: "Answer addresses part of the question but lacks complete depth.",
        spokenResponse: "That gives some helpful context. Could you explain what impact that had on the team or system?"
      };
    }

    // Sufficient general response
    return {
      classification: AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
      quality: CandidateAnswerQuality.STRONG,
      acknowledgement: "Understood, thank you.",
      reasoning: "Candidate provided a clear and relevant response to the question."
    };
  } catch (err) {
    Logger.warn(LogCategory.SYSTEM_INFO, "[AI_WORKER] Error in assessAnswerRelevance, defaulting to RELEVANT_SUFFICIENT:", err);
    return {
      classification: AnswerRelevanceClassification.RELEVANT_SUFFICIENT,
      quality: CandidateAnswerQuality.STRONG,
      acknowledgement: "Understood.",
      reasoning: "Defensive fallback on unexpected parsing error."
    };
  }
}
