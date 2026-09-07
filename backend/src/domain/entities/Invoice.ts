export interface InvoiceProps {
    id: string;
    invoiceNumber: string;
    collegeId: string;
    subscriptionId: string;
    paymentId: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    status: string; // 'paid', 'pending', 'overdue', 'cancelled'
    issuedAt: Date;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Invoice {
    constructor(private readonly _props: InvoiceProps) {}

    get id(): string { return this._props.id; }
    get invoiceNumber(): string { return this._props.invoiceNumber; }
    get collegeId(): string { return this._props.collegeId; }
    get subscriptionId(): string { return this._props.subscriptionId; }
    get paymentId(): string { return this._props.paymentId; }
    get subtotal(): number { return this._props.subtotal; }
    get tax(): number { return this._props.tax; }
    get total(): number { return this._props.total; }
    get currency(): string { return this._props.currency; }
    get status(): string { return this._props.status; }
    get issuedAt(): Date { return this._props.issuedAt; }
    get dueDate(): Date | undefined { return this._props.dueDate; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public toJSON() {
        return { ...this._props };
    }
}
