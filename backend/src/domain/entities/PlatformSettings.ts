export interface PlatformSettingsProps {
    id?: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    collegeRegistration: boolean;
    companyRegistration: boolean;
    studentRegistration: boolean;
    requireApproval: boolean;
    contactEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

export class PlatformSettings {
    constructor(private _props: PlatformSettingsProps) { }

    static create(props: PlatformSettingsProps): PlatformSettings {
        return new PlatformSettings(props)
    }
    
    //getters
    get id(): string | undefined { return this._props.id }
    get maintenanceMode(): boolean { return this._props.maintenanceMode }
    get maintenanceMessage(): string { return this._props.maintenanceMessage; }
    get collegeRegistration(): boolean { return this._props.collegeRegistration; }
    get companyRegistration(): boolean { return this._props.companyRegistration; }
    get studentRegistration(): boolean { return this._props.studentRegistration; }
    get requireApproval(): boolean { return this._props.requireApproval; }
    get contactEmail(): string { return this._props.contactEmail; }
    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    //setters
    set maintenanceMode(value: boolean) { this._props.maintenanceMode = value; }
    set maintenanceMessage(value: string) { this._props.maintenanceMessage = value; }
    set collegeRegistration(value: boolean) { this._props.collegeRegistration = value; }
    set companyRegistration(value: boolean) { this._props.companyRegistration = value; }
    set studentRegistration(value: boolean) { this._props.studentRegistration = value; }
    set requireApproval(value: boolean) { this._props.requireApproval = value; }

    set contactEmail(value: string) {
        if (!value.includes('@')) throw new Error("Invalid contact email format");
        this._props.contactEmail = value;
    }
    // Helper to extract clean data for Mappers
    toJSON() {
        return {
            id: this.id,
            maintenanceMode: this.maintenanceMode,
            maintenanceMessage: this.maintenanceMessage,
            collegeRegistration: this.collegeRegistration,
            companyRegistration: this.companyRegistration,
            studentRegistration: this.studentRegistration,
            requireApproval: this.requireApproval,
            contactEmail: this.contactEmail,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
