export interface PlanProps {
    id: string;
    name: string;
    code: string;
    price: number;
    currency: string;
    billingInterval: string; // 'monthly' | 'yearly'
    maxStudents: number; // -1 for unlimited
    aiCredits: number;
    storageLimit: number; // in GB
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Plan {
    constructor(private readonly _props: PlanProps) {}

    get id(): string { return this._props.id; }
    get name(): string { return this._props.name; }
    get code(): string { return this._props.code; }
    get price(): number { return this._props.price; }
    get currency(): string { return this._props.currency; }
    get billingInterval(): string { return this._props.billingInterval; }
    get maxStudents(): number { return this._props.maxStudents; }
    get aiCredits(): number { return this._props.aiCredits; }
    get storageLimit(): number { return this._props.storageLimit; }
    get features(): string[] { return this._props.features; }
    get isActive(): boolean { return this._props.isActive; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public toJSON() {
        return { ...this._props };
    }
}
