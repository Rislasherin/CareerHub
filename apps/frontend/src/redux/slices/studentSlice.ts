import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StudentDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber?: string;
  department?: string;
  collegeId?: string;
  status: string;
  profileImage?: string;
  proofUrl?: string;
  rejectReason?: string;
  onboardingStep?: number;
  cgpa?: number | string;
  degree?: string;
  branch?: string;
  graduationYear?: number | string;
  tenthPercentage?: number | string;
  twelfthPercentage?: number | string;
  activeBacklogs?: number;
  skills?: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    cloudDevops?: string[];
    otherTools?: string[];
    aiMl?: string[];
  };
  appliedJobs?: string[];
}

interface StudentState {
  details: StudentDetails | null;
}

const initialState: StudentState = {
  details: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentDetails: (state, action: PayloadAction<StudentDetails>) => {
      state.details = action.payload;
    },
    clearStudentDetails: (state) => {
      state.details = null;
    },
  },
});

export const { setStudentDetails, clearStudentDetails } = studentSlice.actions;
export default studentSlice.reducer;
