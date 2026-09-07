export interface AIUsageRecordProps {
    id: string;
    subscriptionId?: string;
    collegeId: string;
    userId: string;
    feature: string; // e.g. 'mock_interview', 'resume_builder'
    creditsConsumed: number;
    reservedCredits?: number;
    status?: 'RESERVED' | 'COMMITTED' | 'RELEASED';
    provider: string; // e.g. 'openai', 'livekit'
    model?: string;
    tokens?: number;
    metadata?: any;
    committedAt?: Date;
    releasedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class AIUsageRecord {
    constructor(private readonly _props: AIUsageRecordProps) {}

    get id(): string { return this._props.id; }
    get subscriptionId(): string | undefined { return this._props.subscriptionId; }
    get collegeId(): string { return this._props.collegeId; }
    get userId(): string { return this._props.userId; }
    get feature(): string { return this._props.feature; }
    get creditsConsumed(): number { return this._props.creditsConsumed; }
    get reservedCredits(): number | undefined { return this._props.reservedCredits; }
    get status(): 'RESERVED' | 'COMMITTED' | 'RELEASED' { return this._props.status || 'COMMITTED'; }
    get provider(): string { return this._props.provider; }
    get model(): string | undefined { return this._props.model; }
    get tokens(): number | undefined { return this._props.tokens; }
    get metadata(): any { return this._props.metadata; }
    get committedAt(): Date | undefined { return this._props.committedAt; }
    get releasedAt(): Date | undefined { return this._props.releasedAt; }
    get expiresAt(): Date | undefined { return this._props.expiresAt; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public commit(finalCredits: number, telemetry?: any) {
        this._props.status = 'COMMITTED';
        this._props.creditsConsumed = finalCredits;
        this._props.committedAt = new Date();
        this._props.updatedAt = new Date();
        if (telemetry) {
            this._props.metadata = { ...this._props.metadata, ...telemetry };
        }
    }

    public release() {
        this._props.status = 'RELEASED';
        this._props.releasedAt = new Date();
        this._props.updatedAt = new Date();
    }

    public toJSON() {
        return { ...this._props };
    }
}
