import { NoticePriority } from "@domain/enums/NoticePriority";
import { Expose } from "class-transformer";

export class NoticeResponseDTO {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  priority: NoticePriority;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
  
}