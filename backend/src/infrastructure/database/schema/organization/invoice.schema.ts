import { Schema } from "mongoose";

export const InvoiceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    collegeId: { type: String, required: true },
    subscriptionId: { type: String, required: true },
    paymentId: { type: String, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true }, // 'paid', 'pending', 'overdue', 'cancelled'
    issuedAt: { type: Date, required: true },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
  }
);
