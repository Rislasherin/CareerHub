import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { OfferDocument, OfferModel } from "@infrastructure/database/models/company/offer.model";
import { Offer } from "@domain/entities/Offer";
import { toOfferEntity, toOfferPersistence } from "@application/mappers/offer.mapper";

export class OfferRepository extends BaseRepository<Offer, OfferDocument> implements IOfferRepository {
    constructor(){
        super(OfferModel)
    }

    protected toEntity(doc: OfferDocument): Offer {
        return toOfferEntity(doc)
    }
    protected toPersistence(entity: Offer): Record<string, unknown> {
        return toOfferPersistence(entity)
    }

    async findByCompanyId(companyId: string): Promise<Offer[]> {
        const docs = await this.model.find({companyId,isDeleted: {$ne:true} }).sort({createdAt: 1});
        return docs.map(doc => this.toEntity(doc as OfferDocument))
    }

    async findByStudentId(studentId: string): Promise<Offer[]> {
        const docs = await this.model.find({studentId, isDeleted: {$ne: true} }).sort({createdAt: 1})
        return docs.map(doc => this.toEntity(doc as OfferDocument))
    }

    async getPopulatedStudentOffers(studentId: string): Promise<Record<string, unknown>[]> {
        const offers = await this.model.find({ studentId, isDeleted: { $ne: true } })
          .populate({
            path: 'jobId',
            select: 'title companyId',
            populate: {
              path: 'companyId',
              select: 'companyName logo'
            }
          })
          .sort({ createdAt: -1 })
          .exec();

        return offers.map(offer => {
            const doc = offer.toObject();
            return {
                ...doc,
                id: doc._id.toString(),
                job: doc.jobId
            };
        });
    }

    async getPopulatedHROffers(companyId: string): Promise<Record<string, unknown>[]> {
        const offers = await this.model.find({ companyId, isDeleted: { $ne: true } })
          .populate({
            path: 'studentId',
            select: 'firstName lastName email skills resumeUrl'
          })
          .populate({
            path: 'jobId',
            select: 'title department'
          })
          .sort({ createdAt: -1 })
          .exec();

        return offers.map(offer => {
            const doc = offer.toObject();
            return {
                ...doc,
                id: doc._id.toString(),
                student: doc.studentId,
                job: doc.jobId
            };
        });
    }

    async getOfferOutcomes(companyId: string, startDate?: Date, endDate?: Date): Promise<{ accepted: number, pending: number, declined: number }> {
        const match: any = { companyId: new Types.ObjectId(companyId) };
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = startDate;
            if (endDate) match.createdAt.$lte = endDate;
        }

        const result = await this.model.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const outcomes = { accepted: 0, pending: 0, declined: 0 };
        for (const r of result) {
            if (r._id === 'ACCEPTED') outcomes.accepted = r.count;
            if (r._id === 'PENDING') outcomes.pending = r.count;
            if (r._id === 'REJECTED') outcomes.declined = r.count;
        }

        return outcomes;
    }

    async getPopulatedCollegeOffers(collegeId: string): Promise<Record<string, unknown>[]> {
        const docs = await this.model.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            { $match: { "student.collegeId": collegeId } },
            {
                $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job"
                }
            },
            { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]);

        return docs.map(doc => ({
            ...doc,
            id: doc._id.toString()
        }));
    }
}
