export interface CollegeProfileResponse {
  name: string;
  organizerName: string;
  email: string;
  phone?: string;
  website?: string;
  instituteType?: string;
  address?: string;
}

export interface IGetCollegeProfileUseCase {
  execute(orgId: string, adminId: string): Promise<CollegeProfileResponse>;
}
