import { NoticePriority } from "@domain/enums/NoticePriority";

export interface NoticeProps {
    id?: string;
    title: string;
    content: string;
    priority: NoticePriority;
    collegeId: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Notice {
    constructor(private _props: NoticeProps) {}

    static create(props: NoticeProps): Notice {
        return new Notice(props);
    }

    get id(): string | undefined { return this._props.id; }
    
    get title(): string { return this._props.title; }
    set title(value: string) { this._props.title = value; }

    get content(): string { return this._props.content; }
    set content(value: string) { this._props.content = value; }

    get priority(): NoticePriority { return this._props.priority; }
    set priority(value: NoticePriority) { this._props.priority = value; }

    get collegeId(): string { return this._props.collegeId; }
    
    get isActive(): boolean { return this._props.isActive; }
    set isActive(value: boolean) { this._props.isActive = value; }

    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    toJSON(): NoticeProps {
        return { ...this._props };
    }
}