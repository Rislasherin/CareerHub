export interface PaymentProps {
    id: string;
    collegeId: string;
    subscriptionId: string;
    provider: string; // e.g. 'razorpay'
    providerPaymentId: string;
    amount: number;
    currency: string;
    status: string; // 'successful', 'failed', 'refunded'
    eventType: string; // 'subscription.charged'
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Payment {
    constructor(private readonly _props: PaymentProps) {}

    get id(): string { return this._props.id; }
    get collegeId(): string { return this._props.collegeId; }
    get subscriptionId(): string { return this._props.subscriptionId; }
    get provider(): string { return this._props.provider; }
    get providerPaymentId(): string { return this._props.providerPaymentId; }
    get amount(): number { return this._props.amount; }
    get currency(): string { return this._props.currency; }
    get status(): string { return this._props.status; }
    get eventType(): string { return this._props.eventType; }
    get failureReason(): string | undefined { return this._props.failureReason; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public toJSON() {
        return { ...this._props };
    }
}
