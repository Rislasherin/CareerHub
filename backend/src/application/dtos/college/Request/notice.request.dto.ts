import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { NoticePriority } from '@domain/enums/NoticePriority';


export class NoticeRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsEnum(NoticePriority, { message: 'Priority must be Urgent, Important, or Normal' })
  @IsNotEmpty()
  priority: NoticePriority;
}


