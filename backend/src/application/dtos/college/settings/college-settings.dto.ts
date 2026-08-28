import { IsNotEmpty, IsString, MaxLength, IsOptional } from "class-validator";
import { Expose } from "class-transformer";

export class UpdateCollegeProfileRequestDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: "College Name is required" })
  @MaxLength(100, { message: "College Name is too long" })
  name!: string;

  @Expose()
  @IsString()
  @IsNotEmpty({ message: "Organizer Name is required" })
  @MaxLength(100, { message: "Organizer Name is too long" })
  organizerName!: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: "Phone number is too long" })
  phone?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: "Website URL is too long" })
  website?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: "Institute Type is too long" })
  instituteType?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: "Address is too long" })
  address?: string;
}
