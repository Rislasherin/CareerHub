import { IGetPlacementReadinessUseCase, PlacementReadinessResponse, StudentReadiness, SkillGap } from "../interfaces/IGetPlacementReadiness.usecase";
import { StudentModel } from "@infrastructure/database/models/student/student.model";
import { JobModel } from "@infrastructure/database/models/company/job.model";
import { AIPracticeInterviewModel } from "@infrastructure/database/models/student/ai-practice.model";
import { AIInterviewEvaluationModel } from "@infrastructure/database/models/company/ai-interview-evaluation.model";

export class GetPlacementReadinessUseCase implements IGetPlacementReadinessUseCase {
  async execute(collegeId: string): Promise<PlacementReadinessResponse> {
    // 1. Fetch Students for the college
    const students = await StudentModel.find({ collegeId, isDeleted: false, status: { $in: ["ACTIVE", "IN_PROCESS", "PLACED"] } }).lean();
    
    // 2. Extract Student IDs
    const studentIds = students.map((s: any) => s._id.toString());
    
    // 3. Fetch Practice and Interview Data
    const [practices, evaluations, activeJobs] = await Promise.all([
      AIPracticeInterviewModel.find({ studentId: { $in: studentIds } }).lean(),
      AIInterviewEvaluationModel.find({ studentId: { $in: studentIds } }).lean(),
      JobModel.find({ 
        $or: [{ collegeId }, { collegeId: "ALL" }], 
        status: { $regex: /^approved$/i }, 
        isDeleted: false 
      }).lean(),
    ]);

    // Pre-process Practice data
    const practiceMap = practices.reduce((acc: any, practice: any) => {
      const sId = practice.studentId.toString();
      if (!acc[sId]) acc[sId] = { count: 0, totalScore: 0, questionsCount: 0 };
      acc[sId].count += 1;
      
      const qScores = practice.questions?.filter((q: any) => typeof q.score === 'number').map((q: any) => q.score) || [];
      if (qScores.length > 0) {
        acc[sId].totalScore += qScores.reduce((a: number, b: number) => a + b, 0);
        acc[sId].questionsCount += qScores.length;
      }
      return acc;
    }, {});

    // Pre-process Interview Evaluations data
    const interviewMap = evaluations.reduce((acc: any, evalDoc: any) => {
      const sId = evalDoc.studentId.toString();
      if (!acc[sId]) acc[sId] = { count: 0, totalScore: 0 };
      if (evalDoc.overallScore) {
        acc[sId].count += 1;
        acc[sId].totalScore += evalDoc.overallScore;
      }
      return acc;
    }, {});

    const studentReadinessList: StudentReadiness[] = [];
    const summary = { ready: 0, almostReady: 0, needsWork: 0, atRisk: 0 };
    
    // Skill Gap calculation maps
    const jobSkillsMap: { [key: string]: number } = {};
    activeJobs.forEach((job: any) => {
      job.requiredSkills?.forEach((skill: string) => {
        const s = skill.toLowerCase().trim();
        jobSkillsMap[s] = (jobSkillsMap[s] || 0) + 1;
      });
    });

    const studentLacksSkill: { [key: string]: number } = {};
    Object.keys(jobSkillsMap).forEach(k => studentLacksSkill[k] = 0);

    // Calculate readiness for each student
    for (const student of students as any[]) {
      const sId = student._id.toString();
      
      // Calculate Profile Completeness (max 10)
      let profileScore = 0;
      if (student.linkedinUrl) profileScore += 3;
      if (student.portfolioUrl || student.githubUrl) profileScore += 2;
      if (student.professionalSummary) profileScore += 2;
      if (student.experience && student.experience.length > 0) profileScore += 3;
      
      // Calculate Skills Score (max 25)
      let skillsScore = 0;
      const allStudentSkills = [
        ...(student.skills?.languages || []),
        ...(student.skills?.frameworks || []),
        ...(student.skills?.databases || []),
        ...(student.skills?.cloudDevops || []),
        ...(student.skills?.otherTools || []),
        ...(student.skills?.aiMl || [])
      ].map(s => s.toLowerCase().trim());
      
      const skillCount = allStudentSkills.length;
      skillsScore = Math.min(25, skillCount * 2.5); // 10 skills = max 25 points

      // Calculate Resume Score (max 20)
      const resumeScore = student.resumeScore ? (student.resumeScore / 100) * 20 : null;

      // Calculate Practice Score (max 15)
      const practiceStats = practiceMap[sId];
      let practiceScore = 0;
      if (practiceStats && practiceStats.count > 0) {
        const avgPractice = practiceStats.questionsCount > 0 ? practiceStats.totalScore / practiceStats.questionsCount : 0;
        // 5 points just for practicing, 10 points based on score
        practiceScore = Math.min(15, 5 + ((avgPractice / 100) * 10));
      }

      // Calculate Interview Score (max 30)
      const evalStats = interviewMap[sId];
      const interviewScore = evalStats && evalStats.count > 0 ? (evalStats.totalScore / evalStats.count) * 0.3 : null;

      // Final Score Calculation (Prorated based on available data)
      let availableMax = 10 + 25 + 15; // Profile + Skills + Practice always counted
      let obtained = profileScore + skillsScore + practiceScore;
      
      if (resumeScore !== null) {
        availableMax += 20;
        obtained += resumeScore;
      }
      if (interviewScore !== null) {
        availableMax += 30;
        obtained += interviewScore;
      }

      const finalPercentage = availableMax > 0 ? Math.round((obtained / availableMax) * 100) : 0;

      // Determine Status & Reason
      let status: 'READY' | 'ALMOST_READY' | 'NEEDS_WORK' | 'AT_RISK' = 'READY';
      let mainGap = '-';
      let reason = '-';
      let recommendedAction = 'Ready to apply for jobs';

      if (finalPercentage < 45 || practiceScore === 0) {
        status = 'AT_RISK';
        if (practiceScore === 0) {
          mainGap = 'Practice';
          reason = 'No recent mock interviews or practice sessions';
          recommendedAction = 'Complete at least 3 AI mock practice sessions';
        } else if (interviewScore !== null && (interviewScore / 0.3) < 50) {
          mainGap = 'Interview';
          reason = 'Consistently low interview evaluation scores';
          recommendedAction = 'Schedule 1:1 mentorship for interview preparation';
        } else {
          mainGap = 'Overall';
          reason = 'Low overall readiness score';
          recommendedAction = 'Review overall profile and identify weak areas';
        }
      } else if (finalPercentage < 65) {
        status = 'NEEDS_WORK';
        if (resumeScore !== null && (resumeScore / 0.2) < 60) {
          mainGap = 'Resume';
          reason = 'Resume ATS score is below target';
          recommendedAction = 'Improve resume using the ATS builder';
        } else if (skillsScore < 15) {
          mainGap = 'Skills';
          reason = 'Missing required technical skills';
          recommendedAction = 'Complete missing skill assessments';
        }
      } else if (finalPercentage < 80) {
        status = 'ALMOST_READY';
        mainGap = 'Fine-tuning';
        reason = 'Solid profile but needs minor improvements';
        recommendedAction = 'Take one more mock interview to boost confidence';
      }

      // Update Summary
      if (status === 'READY') summary.ready++;
      else if (status === 'ALMOST_READY') summary.almostReady++;
      else if (status === 'NEEDS_WORK') summary.needsWork++;
      else if (status === 'AT_RISK') summary.atRisk++;

      studentReadinessList.push({
        studentId: sId,
        name: `${student.firstName} ${student.lastName}`,
        department: student.department || 'General',
        readinessScore: finalPercentage,
        status,
        mainGap,
        reason,
        recommendedAction,
        factors: {
          resume: resumeScore ? Math.round(resumeScore / 0.2) : null,
          interview: interviewScore ? Math.round(interviewScore / 0.3) : null,
          skills: Math.round(skillsScore / 0.25),
          practice: Math.round(practiceScore / 0.15),
          profile: Math.round(profileScore / 0.1),
        }
      });

      // Update Skill Gap Map
      Object.keys(jobSkillsMap).forEach(k => {
        if (!allStudentSkills.includes(k)) {
          studentLacksSkill[k]++;
        }
      });
    }

    // Sort Skill Gaps
    const skillGaps: SkillGap[] = Object.keys(studentLacksSkill)
      .map(skill => ({ skill, studentsMissing: studentLacksSkill[skill] }))
      .sort((a, b) => b.studentsMissing - a.studentsMissing)
      .slice(0, 10); // Top 10 skill gaps

    return {
      summary,
      students: studentReadinessList,
      skillGaps,
    };
  }
}
