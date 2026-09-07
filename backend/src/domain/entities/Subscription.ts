import { PlanType } from "@domain/enums/PlanType.enum";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";

export interface SubscriptionProps {
    id: string;
    collegeId: string;
    planId: string;
    planType?: PlanType;
    status: SubscriptionStatus;
    providerOrderId: string;
    providerPaymentId?: string;
    aiCreditsAllocated: number;
    aiCreditsConsumed: number;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Subscription {
    constructor(private readonly _props: SubscriptionProps) {}

    get id(): string { return this._props.id; }
    get collegeId(): string { return this._props.collegeId; }
    get planId(): string { return this._props.planId; }
    get planType(): PlanType | undefined { return this._props.planType; }
    get status(): SubscriptionStatus { return this._props.status; }
    get providerOrderId(): string { return this._props.providerOrderId; }
    get providerPaymentId(): string | undefined { return this._props.providerPaymentId; }
    get aiCreditsAllocated(): number { return this._props.aiCreditsAllocated; }
    get aiCreditsConsumed(): number { return this._props.aiCreditsConsumed; }
    get startDate(): Date | undefined { return this._props.startDate; }
    get endDate(): Date | undefined { return this._props.endDate; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public activatePayment(providerPaymentId: string, aiCredits: number): void {
        this._props.status = SubscriptionStatus.ACTIVE;
        this._props.providerPaymentId = providerPaymentId;
        this._props.aiCreditsAllocated = aiCredits;
        this._props.aiCreditsConsumed = 0;
        this._props.startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        this._props.endDate = endDate;
        this._props.updatedAt = new Date();
    }

    public cancel(): void {
        this._props.status = SubscriptionStatus.CANCELLED;
        this._props.updatedAt = new Date();
    }
}
