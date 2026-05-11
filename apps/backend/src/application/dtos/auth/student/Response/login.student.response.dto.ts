export interface StudentLoginResponseDto {
  accessToken: string;
  refreshToken: string;
  student: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    isFirstLogin: boolean;
  };
}
