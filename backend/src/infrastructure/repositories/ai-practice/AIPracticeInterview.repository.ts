import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { AIPracticeInterview } from "@domain/entities/ai-practice/AIPracticeInterview";
import { BaseRepository } from "../BaseRepository";
import { AIPracticeInterviewDocument, AIPracticeInterviewModel } from "@infrastructure/database/models/student/ai-practice.model";
import { toAIPracticeInterviewEntity, toAIPracticeInterviewPersistence } from "@application/mappers/ai-practice.mapper";
import { Types } from "mongoose";

export class AIPracticeInterviewRepository
  extends BaseRepository<AIPracticeInterview, AIPracticeInterviewDocument>
  implements IAIPracticeInterviewRepository
{
  constructor() {
    super(AIPracticeInterviewModel);
  }

  protected toEntity(doc: AIPracticeInterviewDocument): AIPracticeInterview {
    return toAIPracticeInterviewEntity(doc);
  }

  protected toPersistence(entity: AIPracticeInterview): Record<string, unknown> {
    return toAIPracticeInterviewPersistence(entity);
  }

  async findByStudentId(studentId: string): Promise<AIPracticeInterview[]> {
    const docs = await this.model
      .find({ studentId: new Types.ObjectId(studentId), isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toEntity(doc as AIPracticeInterviewDocument));
  }

  async findByIdAndStudentId(id: string, studentId: string): Promise<AIPracticeInterview | null> {
    const doc = await this.model.findOne({
      _id: new Types.ObjectId(id),
      studentId: new Types.ObjectId(studentId),
      isDeleted: { $ne: true },
    });

    return doc ? this.toEntity(doc as AIPracticeInterviewDocument) : null;
  }

  async findLatestCompletedByStudentId(studentId: string): Promise<AIPracticeInterview | null> {
    const doc = await this.model.findOne({
      studentId: new Types.ObjectId(studentId),
      status: "COMPLETED",
      isDeleted: { $ne: true },
    }).sort({ completedAt: -1, createdAt: -1 });

    return doc ? this.toEntity(doc as AIPracticeInterviewDocument) : null;
  }

  /**
   * Atomically records an answer for a question using a MongoDB conditional updateOne.
   * The update only succeeds if:
   *  - The session is IN_PROGRESS
   *  - The target question exists and has no answer yet
   * This guards against duplicate concurrent submissions at the database level.
   */
  async recordAnswerAtomically(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<boolean> {
    const result = await this.model
      .updateOne(
        {
          _id: new Types.ObjectId(sessionId),
          status: "IN_PROGRESS",
          isDeleted: { $ne: true },
          questions: {
            $elemMatch: {
              id: questionId,
              candidateAnswer: { $in: [null, undefined, ""] },
            },
          },
        },
        {
          $set: {
            "questions.$.candidateAnswer": answer,
            "questions.$.answeredAt": new Date(),
          },
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
