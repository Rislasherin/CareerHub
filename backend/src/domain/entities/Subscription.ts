import { PlanType } from "@domain/enums/PlanType.enum";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";

export interface SubscriptionProps {
    id: string;
    collegeId: string;
    planType: PlanType;
    status: SubscriptionStatus;
    gatewaySubscriptionId: string;
    aiTokensAllocated: number;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Subscription {
    constructor(private readonly _props: SubscriptionProps) {}

    get id(): string { return this._props.id; }
    get collegeId(): string { return this._props.collegeId; }
    get planType(): PlanType { return this._props.planType; }
    get status(): SubscriptionStatus { return this._props.status; }
    get gatewaySubscriptionId(): string { return this._props.gatewaySubscriptionId; }
    get aiTokensAllocated(): number { return this._props.aiTokensAllocated; }
    get startDate(): Date | undefined { return this._props.startDate; }
    get endDate(): Date | undefined { return this._props.endDate; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public activate(tokens: number): void {
        this._props.status = SubscriptionStatus.ACTIVE;
        this._props.aiTokensAllocated = tokens;
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
