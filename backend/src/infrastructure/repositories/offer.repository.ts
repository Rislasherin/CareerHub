import { IOfferRepository } from "@domain/repositories/IOfferRepository";
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
}
