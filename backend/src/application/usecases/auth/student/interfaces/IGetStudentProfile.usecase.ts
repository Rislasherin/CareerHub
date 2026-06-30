export interface StudentProfileResponse {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  rollNumber?: string;
  department?: string;
  proofUrl?: string;
  rejectReason?: string;
}

export interface IGetStudentProfileUseCase {
  execute(studentId: string): Promise<StudentProfileResponse>;
}
