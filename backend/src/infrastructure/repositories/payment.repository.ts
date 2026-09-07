import { Model } from "mongoose";
import { Payment } from "@domain/entities/Payment";
import { IPaymentRepository } from "@domain/repositories/IPaymentRepository";
import { PaymentDocument } from "../database/models/organizer/payment.model";

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly model: Model<PaymentDocument>) {}

  private toEntity(doc: PaymentDocument): Payment {
    return new Payment({
      id: doc.id,
      collegeId: doc.collegeId,
      subscriptionId: doc.subscriptionId,
      provider: doc.provider,
      providerPaymentId: doc.providerPaymentId,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      eventType: doc.eventType,
      failureReason: doc.failureReason ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Payment | null> {
    const doc = await this.model.findOne({ id });
    return doc ? this.toEntity(doc) : null;
  }

  async findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const doc = await this.model.findOne({ providerPaymentId });
    return doc ? this.toEntity(doc) : null;
  }

  async findByCollegeId(collegeId: string): Promise<Payment[]> {
    const docs = await this.model.find({ collegeId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    const docs = await this.model.find({ subscriptionId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async create(entity: Payment): Promise<Payment> {
    const doc = new this.model(entity.toJSON());
    await doc.save();
    return this.toEntity(doc);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async save(entity: Payment): Promise<void> {
    await this.model.findOneAndUpdate(
      { id: entity.id },
      { $set: entity.toJSON() },
      { upsert: true, new: true }
    );
  }

  async update(id: string, entity: Payment): Promise<Payment> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: entity.toJSON() },
      { new: true }
    );
    if (!doc) throw new Error("Payment not found");
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id });
  }

  async findAll(page: number = 1, limit: number = 10000, filters?: any): Promise<{ data: Payment[]; total: number; }> {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.model.countDocuments(query)
    ]);
    return { data: docs.map(d => this.toEntity(d)), total };
  }

  async getRevenueStats(): Promise<{ totalRevenue: number; monthlyRevenue: { month: string; revenue: number }[] }> {
    const activePayments = await this.model.find({ status: "successful" });
    
    let totalRevenue = 0;
    const monthlyMap: { [key: string]: number } = {};
    
    activePayments.forEach(payment => {
      totalRevenue += payment.amount;
      const month = payment.createdAt.toLocaleString('default', { month: 'short' });
      monthlyMap[month] = (monthlyMap[month] || 0) + payment.amount;
    });

    const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthlyRevenue = monthNames.map(month => ({
      month,
      revenue: monthlyMap[month] || 0
    }));

    return { totalRevenue, monthlyRevenue };
  }
}
