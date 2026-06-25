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
    constructor(private props: NoticeProps) {}

    static create(props: NoticeProps): Notice {
        return new Notice(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get title(): string {
        return this.props.title;
    }

    set title(value: string) {
        this.props.title = value;
    }

    get content(): string {
        return this.props.content;
    }

    set content(value: string) {
        this.props.content = value;
    }

    get priority(): NoticePriority {
        return this.props.priority;
    }

    set priority(value: NoticePriority) {
        this.props.priority = value;
    }

    get collegeId(): string {
        return this.props.collegeId;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    set isActive(value: boolean) {
        this.props.isActive = value;
    }

    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toJSON(): NoticeProps {
        return { ...this.props };
    }
}