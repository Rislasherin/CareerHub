import { CandidateUtteranceIntent } from "@domain/enums/CandidateUtteranceIntent.enum";
import { CandidateQuestionCategory } from "@domain/enums/CandidateQuestionCategory.enum";

export interface CandidateUtteranceClassification {
  intent: CandidateUtteranceIntent;
  questionCategory?: CandidateQuestionCategory;
}

export function classifyCandidateUtterance(text: string): CandidateUtteranceClassification {
  const clean = text.trim().toLowerCase().replace(/[^\w\s'?]/g, '').replace(/\s+/g, ' ');
  const cleanWithoutPunct = clean.replace(/[?]/g, '');
  const words = cleanWithoutPunct.split(' ').filter(Boolean);

  // 1. Hesitation / Thinking Requests (short phrases <= 8 words)
  if (words.length <= 8) {
    const isHesitation = /^(let me (think|see|check)|give me a (second|moment|sec|minute)|can i (think( for a (moment|second|sec))?|have a moment|take a (second|moment)|get a (second|moment))|i need (some |a )?(time to think|second|moment|minute)|i'm trying to remember|trying to remember|just a (second|moment|sec)|hold on( a second| a sec| a moment)?|wait a (second|moment|sec)|one second|one moment)$/i.test(cleanWithoutPunct);
    if (isHesitation) return { intent: CandidateUtteranceIntent.HESITATION };
  }

  // 2. Explicit Uncertainty / "Don't know" (short responses <= 7 words)
  if (words.length <= 7) {
    const isExplicitDontKnow = /^(i (don't|dont|do not) know( the answer| this| that)?|i'm not sure( about (that|this))?|i am not sure( about (that|this))?|not sure( about (that|this))?|i have no idea|no idea( about that| about this)?|i can't remember|i cannot remember)$/i.test(cleanWithoutPunct);
    if (isExplicitDontKnow) return { intent: CandidateUtteranceIntent.EXPLICIT_DONT_KNOW };
  }

  // 3. Repeat Question Patterns (short phrases <= 9 words)
  if (words.length <= 9) {
    const isRepeat = /^(can you (repeat|say that again|say the question again)( the question| that)?|could you (repeat|say that again|say the question again)( the question| that)?|please repeat( the question| that)?|repeat( the question| that)?( please)?|what was the question( again)?|say that again( please)?|one more time please|can i hear the question again|repeat please)$/i.test(cleanWithoutPunct);
    if (isRepeat) return { intent: CandidateUtteranceIntent.REPEAT_QUESTION };
  }

  // 4. Pause Request Patterns (short phrases <= 8 words)
  if (words.length <= 8) {
    const isPause = /^(can we pause( for a (second|moment|minute)| the interview)?|please pause( the interview)?|pause( the interview)?( please)?|can i take a (quick |short )?break|can i have a (quick |short )?break|can we take a (quick |short )?break|take a quick break|quick break please)$/i.test(cleanWithoutPunct);
    if (isPause) return { intent: CandidateUtteranceIntent.PAUSE_REQUEST };
  }

  // 5. Candidate Questions & Off-Topic Detection (conservative, <= 15 words)
  if (words.length <= 15) {
    // 5a. Clarification Patterns
    const isClarification = /^(do you mean|what do you mean by|what exactly do you mean|could you clarify|can you clarify|are you asking (about|for)|can you explain what you mean)/i.test(cleanWithoutPunct);
    if (isClarification) {
      return { intent: CandidateUtteranceIntent.CANDIDATE_QUESTION, questionCategory: CandidateQuestionCategory.CLARIFICATION };
    }

    // 3b. Interview Process Patterns
    const isProcess = /^(what happens after|what is the next step|what are the next steps|when will i hear back|how long will this interview|what is the hiring process|what comes next)/i.test(cleanWithoutPunct);
    if (isProcess) {
      return { intent: CandidateUtteranceIntent.CANDIDATE_QUESTION, questionCategory: CandidateQuestionCategory.INTERVIEW_PROCESS };
    }

    // 3c. Unknown Info (Salary, Benefits, Compensation, Executive leadership)
    const isUnknownInfo = /^(what is the (company )?(salary|pay|compensation|benefits|ctc|package)|how much does this (role |job |position )?pay|who is the (company )?(ceo|cto|founder|owner)|what are the (company )?benefits)/i.test(cleanWithoutPunct);
    if (isUnknownInfo) {
      return { intent: CandidateUtteranceIntent.CANDIDATE_QUESTION, questionCategory: CandidateQuestionCategory.UNKNOWN_INFO };
    }

    // 3d. Company or Role Questions
    const isCompanyOrRole = /^(what (technologies|tech stack|stack|tools) does (your |the )?company use|what does the company use|what is the company (culture|work environment)|can i ask (something |a question )?(about the (role|job|company|position|stack|tech stack))|tell me about the (company|role|culture)|what are the (job |role )?responsibilities)/i.test(cleanWithoutPunct);
    if (isCompanyOrRole) {
      return { intent: CandidateUtteranceIntent.CANDIDATE_QUESTION, questionCategory: CandidateQuestionCategory.COMPANY_OR_ROLE };
    }

    // 3e. Off-Topic Questions / Chit-chat
    const isOffTopic = /^(what('s| is) the weather|what is your favorite (programming language|language|framework)|are you (an ai|a robot|human|real)|who (made|created|built) you|tell me a joke|how are you( doing)?|what is your name)/i.test(cleanWithoutPunct);
    if (isOffTopic) {
      return { intent: CandidateUtteranceIntent.CANDIDATE_QUESTION, questionCategory: CandidateQuestionCategory.OFF_TOPIC };
    }
  }

  // 4. Default: Normal Candidate Technical/Behavioral Answer
  return { intent: CandidateUtteranceIntent.NORMAL_ANSWER };
}

export function getCandidateQuestionResponse(
  category: CandidateQuestionCategory,
  activeQuestionText?: string,
  currentTopic?: string,
  consecutiveOffTopicCount: number = 0
): string {
  if (consecutiveOffTopicCount >= 3) {
    return "Let's make sure we stay focused on your interview. Please provide your answer to the active question whenever you're ready.";
  }

  switch (category) {
    case CandidateQuestionCategory.CLARIFICATION:
      if (currentTopic && currentTopic !== "General" && currentTopic !== "None") {
        return `Yes, I'm referring specifically to ${currentTopic}. Take your time whenever you're ready to answer.`;
      }
      return "Yes, that's what I'm referring to. Whenever you're ready, please continue with your answer.";

    case CandidateQuestionCategory.INTERVIEW_PROCESS:
      return "The recruiting team will follow up regarding the next steps after this interview. Whenever you're ready, please continue with your answer.";

    case CandidateQuestionCategory.COMPANY_OR_ROLE:
      return "The role focuses on the core skills and technologies outlined in the job description. Whenever you're ready, let's return to the question.";

    case CandidateQuestionCategory.UNKNOWN_INFO:
      return "I don't have that specific information available during this interview. The recruiting team can provide those details. Let's continue with the interview question.";

    case CandidateQuestionCategory.OFF_TOPIC:
    default:
      return "Let's keep our focus on the interview for now. Whenever you're ready, please continue with the question.";
  }
}
