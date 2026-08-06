import { voice } from '@livekit/agents';
import { realtime } from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import { BaseAgent } from './BaseAgent';
import { interviewRepository, studentRepository, jobRepository } from '@infrastructure/di/infra.container';

export class InterviewerAgent extends BaseAgent {

  protected async setupAgent(): Promise<voice.Agent> {
    
    // Fetch context from MongoDB using our DI containers
    console.log(`[InterviewerAgent] Fetching context for Interview ID: ${this.interviewId}`);
    const interview = await interviewRepository.findById(this.interviewId);
    if (!interview) {
        throw new Error(`Interview context not found for ID: ${this.interviewId}`);
    }

    const student = await studentRepository.findById(interview.studentId);
    const job = await jobRepository.findById(interview.jobId);

    // Build the dynamic system instructions!
    const instructions = `
        You are an expert technical interviewer for CareerHub. 
        You are interviewing ${student?.firstName || 'the candidate'} for the role of "${job?.title || 'Software Engineer'}".

        Job Description Snippet:
        ${job?.description?.substring(0, 1000) || 'General Software Engineering Role'}

        Candidate Resume Skills:
        ${Object.values(student?.skills || {}).flat().filter(Boolean).join(', ') || 'General Programming Skills'}

        Your job is to ask technical questions based on the candidate's skills and how they map to the job requirements.
        Keep your responses concise. Do not talk for more than 30 seconds at a time.
        If the user interrupts you, stop talking immediately and listen.
    `;

    // Initialize the Voice Agent with OpenAI Realtime Model and Silero VAD
    const agent = new voice.Agent({
      instructions,
      vad: await silero.VAD.load(),
      llm: new realtime.RealtimeModel({
        model: 'gpt-4o-realtime-preview-2024-10-01',
      }),
    });

    console.log('[InterviewerAgent] OpenAI Realtime pipeline initialized with Candidate Context.');
    return agent;
  }
}
