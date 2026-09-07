import { Model } from "mongoose";
import { Invoice } from "@domain/entities/Invoice";
import { IInvoiceRepository } from "@domain/repositories/IInvoiceRepository";
import { InvoiceDocument } from "../database/models/organizer/invoice.model";

export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly model: Model<InvoiceDocument>) {}

  private toEntity(doc: InvoiceDocument): Invoice {
    return new Invoice({
      id: doc.id,
      invoiceNumber: doc.invoiceNumber,
      collegeId: doc.collegeId,
      subscriptionId: doc.subscriptionId,
      paymentId: doc.paymentId,
      subtotal: doc.subtotal,
      tax: doc.tax,
      total: doc.total,
      currency: doc.currency,
      status: doc.status,
      issuedAt: doc.issuedAt,
      dueDate: doc.dueDate ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await this.model.findOne({ id });
    return doc ? this.toEntity(doc) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const doc = await this.model.findOne({ invoiceNumber });
    return doc ? this.toEntity(doc) : null;
  }

  async findByCollegeId(collegeId: string): Promise<Invoice[]> {
    const docs = await this.model.find({ collegeId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    const docs = await this.model.find({ subscriptionId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  async create(entity: Invoice): Promise<Invoice> {
    const doc = new this.model(entity.toJSON());
    await doc.save();
    return this.toEntity(doc);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async save(entity: Invoice): Promise<void> {
    await this.model.findOneAndUpdate(
      { id: entity.id },
      { $set: entity.toJSON() },
      { upsert: true, new: true }
    );
  }

  async update(id: string, entity: Invoice): Promise<Invoice> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: entity.toJSON() },
      { new: true }
    );
    if (!doc) throw new Error("Invoice not found");
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id });
  }

  async findAll(page: number, limit: number, filters?: any): Promise<{ data: Invoice[]; total: number; }> {
    const query: any = {};
    if (filters?.search) {
      query.invoiceNumber = { $regex: filters.search, $options: 'i' };
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.model.countDocuments(query)
    ]);
    return { data: docs.map(d => this.toEntity(d)), total };
  }
}
