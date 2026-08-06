import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJoinInterviewUseCase, JoinInterviewInput, JoinInterviewResult } from "../interfaces/IJoinInterview.usecase";
import { IMediaServer } from "@application/services/IMediaServer";
import { IMessageBroker } from "@application/services/IMessageBroker";

export class JoinInterviewUseCase implements IJoinInterviewUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _mediaServer: IMediaServer,
        private readonly _messageBroker: IMessageBroker,
        private readonly _liveKitUrl: string
    ) { }
    async execute(input: JoinInterviewInput): Promise<JoinInterviewResult> {
        const interview = await this._interviewRepository.findById(input.interviewId);

        //Business Rule Validation 

        if (!interview) {
            throw new Error(`Interviewer not found:${input.interviewId}`);

        }
        if (interview?.studentId !== input.studentId) {
            throw new Error('Unauthorized: This interview does not belong to this student.');
        }
        if (!interview.isJoinable()) {
            throw new Error(
                `Interview cannot be joined. Current status: ${interview.status}`)
        }

        // Create media room 
        const roomName = `interview-${interview.id}`;
        await this._mediaServer.createRoom(roomName)

        // State transition 
        interview.markAsWaiting()
        interview.markAsPreparing(roomName)

        //Generate student token 
        const studentIdentity = `student-${input.studentId}`;
        const liveKitToken = await this._mediaServer.generateToken(
            roomName,
            studentIdentity,
            true
        );

        // Dispatch AI Worker 
        await this._messageBroker.publish(`ai-interview.start`, {
            interviewId: interview.id,
            roomName,
            studentId: interview.studentId,
            jobId: interview.jobId,
            type: interview.type
        });

        // Persist updated state 
        await this._interviewRepository.save(interview);

        return {
            liveKitToken,
            liveKitUrl: this._liveKitUrl,
            roomName
        };
    }
}
