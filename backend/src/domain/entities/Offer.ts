import { OfferStatus } from "@domain/enums/OfferStatus.enum";
import { Role } from "@domain/enums/Roles.enum";

export interface OfferProps {
    id?: string,
    jobId: string,
    applicationId: string,
    studentId: string,
    companyId: string,
    role: Role,
    ctc: number,
    joiningDate: Date,
    status: OfferStatus,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date
}

export class Offer {
    private constructor(private readonly _props: OfferProps) { }

    static create(props: OfferProps): Offer {
        return new Offer(props)
    }
    get id(): string | undefined { return this._props.id; }
    get jobId(): string { return this._props.jobId; }
    get applicationId(): string { return this._props.applicationId; }
    get studentId(): string { return this._props.studentId; }
    get companyId(): string { return this._props.companyId; }
    get role(): string { return this._props.role; }
    get ctc(): number { return this._props.ctc; }
    get joiningDate(): Date { return this._props.joiningDate; }
    get status(): OfferStatus { return this._props.status; }
    get expiresAt(): Date { return this._props.expiresAt; }

    accept(): void {
        if (this._props.status !== OfferStatus.PENDING) throw new Error("Only pending offers can be accepted.");
        this._props.status = OfferStatus.ACCEPTED
    }
    reject(): void {
        if (this._props.status !== OfferStatus.PENDING) throw new Error("Only pending offers can be accepted.");
        this._props.status = OfferStatus.REJECTED
    }
    toJson(): OfferProps {
        return {...this._props};
    }
}