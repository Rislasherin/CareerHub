import { Job } from "@domain/entities/Job";
import { InterviewConfiguration } from "@domain/value-objects/InterviewConfiguration";
import { InterviewPlan, InterviewPlanItem } from "@domain/value-objects/InterviewPlan";
import { InterviewType } from "@domain/enums/InterviewType.enum";

export interface IBuiltInterviewContext {
  interviewContext: string;
  interviewPlan: InterviewPlan;
  initialTopic: string;
  initialCategory: InterviewType;
}

export class InterviewContextBuilder {
  /**
   * Builds the comprehensive interview context string and structured interview plan
   * from the Job entity and InterviewConfiguration.
   */
  public static build(job: Job | null, configuration: InterviewConfiguration): IBuiltInterviewContext {
    const jobTitle = job?.title || "Software Professional";
    const jobDescription = job?.description || "General industry role";
    const experienceLevel = job?.experienceLevel || configuration.difficulty;
    const requiredSkills = (job?.requiredSkills && job.requiredSkills.length > 0)
      ? job.requiredSkills
      : (configuration.skills.length > 0 ? [...configuration.skills] : ["Core Fundamentals", "Problem Solving"]);
    
    const preferredSkills = job?.preferredSkills || [];
    const focusSkills = configuration.skills.length > 0 ? configuration.skills : requiredSkills;

    // 1. Build structured context prompt block
    const contextSections: string[] = [
      `Role: ${jobTitle}`,
      `Experience Level: ${experienceLevel}`,
      `Target Difficulty: ${configuration.difficulty}`,
      `Interview Types: ${configuration.types.join(", ")}`,
      `Required Technical/Core Skills: ${requiredSkills.join(", ")}`,
    ];

    if (preferredSkills.length > 0) {
      contextSections.push(`Preferred Skills: ${preferredSkills.join(", ")}`);
    }

    if (focusSkills.length > 0) {
      contextSections.push(`Focus Evaluation Skills: ${focusSkills.join(", ")}`);
    }

    if (jobDescription && jobDescription.length > 10) {
      // Include concise job summary
      const conciseDesc = jobDescription.length > 300 ? `${jobDescription.substring(0, 300)}...` : jobDescription;
      contextSections.push(`Job Responsibilities & Summary: ${conciseDesc}`);
    }

    if (configuration.customInstructions.length > 0) {
      contextSections.push(`HR Custom Instructions & Constraints:\n${configuration.customInstructions.map(ci => `- ${ci}`).join("\n")}`);
    }

    if (configuration.prohibitedTopics.length > 0) {
      contextSections.push(`Prohibited Topics (Do NOT ask about): ${configuration.prohibitedTopics.join(", ")}`);
    }

    if (configuration.evaluationCriteria.length > 0) {
      contextSections.push(`Specific Evaluation Rubric:\n${configuration.evaluationCriteria.map(ec => `- ${ec}`).join("\n")}`);
    }

    const interviewContext = contextSections.join("\n\n");

    // 2. Generate structured Interview Plan
    // Respect configured totalQuestions or estimate ~1 question every 4.5 minutes
    const totalQuestions = (configuration.totalQuestions && configuration.totalQuestions > 0)
      ? configuration.totalQuestions
      : Math.max(2, Math.round(configuration.durationMinutes / 4.5));

    const planItems: InterviewPlanItem[] = [];
    const types = configuration.types;
    const distribution = configuration.questionDistribution;

    // Deterministic question count allocation per category
    const categoryAllocation = InterviewConfiguration.calculateQuestionAllocation(types, totalQuestions, distribution);

    types.forEach((type) => {
      const count = categoryAllocation.get(type) || 0;
      if (count <= 0) return;

      if (type === InterviewType.TECHNICAL) {
        const techSkills = focusSkills.slice(0, Math.max(1, count));
        const qPerTech = Math.max(1, Math.floor(count / techSkills.length));
        let remainingForTech = count;

        techSkills.forEach((s, idx) => {
          const target = (idx === techSkills.length - 1)
            ? remainingForTech
            : Math.min(remainingForTech, qPerTech);
          remainingForTech -= target;

          planItems.push({
            category: InterviewType.TECHNICAL,
            skillOrTopic: s,
            targetQuestions: target,
            questionsAsked: 0,
          });
        });
      } else if (type === InterviewType.BEHAVIORAL) {
        const behavioralTopics = [
          "Team Collaboration & Communication",
          "Problem Solving under Pressure",
          "Conflict Resolution & Adaptability",
          "Ownership & Accountability"
        ];
        const selected = behavioralTopics.slice(0, Math.max(1, Math.min(count, behavioralTopics.length)));
        const qPerTopic = Math.max(1, Math.floor(count / selected.length));
        let remainingForBehavioral = count;

        selected.forEach((t, idx) => {
          const target = (idx === selected.length - 1)
            ? remainingForBehavioral
            : Math.min(remainingForBehavioral, qPerTopic);
          remainingForBehavioral -= target;

          planItems.push({
            category: InterviewType.BEHAVIORAL,
            skillOrTopic: t,
            targetQuestions: target,
            questionsAsked: 0,
          });
        });
      } else if (type === InterviewType.HR) {
        const hrTopics = [
          "Career Motivation & Alignment",
          "Culture Fit & Workplace Expectations",
          "Role Expectations & Availability"
        ];
        const selected = hrTopics.slice(0, Math.max(1, Math.min(count, hrTopics.length)));
        const qPerTopic = Math.max(1, Math.floor(count / selected.length));
        let remainingForHr = count;

        selected.forEach((t, idx) => {
          const target = (idx === selected.length - 1)
            ? remainingForHr
            : Math.min(remainingForHr, qPerTopic);
          remainingForHr -= target;

          planItems.push({
            category: InterviewType.HR,
            skillOrTopic: t,
            targetQuestions: target,
            questionsAsked: 0,
          });
        });
      } else {
        planItems.push({
          category: InterviewType.CUSTOM,
          skillOrTopic: focusSkills[0] || "Custom Competency Evaluation",
          targetQuestions: count,
          questionsAsked: 0,
        });
      }
    });

    if (planItems.length === 0) {
      planItems.push({
        category: configuration.primaryType,
        skillOrTopic: focusSkills[0] || "Core Competency",
        targetQuestions: totalQuestions,
        questionsAsked: 0,
      });
    }

    const interviewPlan = new InterviewPlan(planItems);
    const initialItem = interviewPlan.getNextItem() || planItems[0];

    return {
      interviewContext,
      interviewPlan,
      initialTopic: initialItem.skillOrTopic,
      initialCategory: initialItem.category,
    };
  }
}
